import { Order, OrderStatus, CartItem, User, PaymentMethod, OrderFeedback } from '../types';
import { INITIAL_ORDERS } from './mockData';
import { loadStorage, saveStorage } from './storageUtils';
import { notificationService } from './notificationService';

const ORDERS_KEY = 'orders';

export const orderService = {
  getAllOrders(): Order[] {
    return loadStorage<Order[]>(ORDERS_KEY, INITIAL_ORDERS);
  },

  getOrderById(id: string): Order | undefined {
    return this.getAllOrders().find(o => o.id === id);
  },

  getOrdersByBuyer(buyerId: string): Order[] {
    return this.getAllOrders().filter(o => o.buyerId === buyerId);
  },

  getOrdersByFarmer(farmerId: string): Order[] {
    return this.getAllOrders().filter(o => o.farmerId === farmerId);
  },

  createOrder(params: {
    buyer: User;
    items: CartItem[];
    deliveryAddress: { street: string; city: string; state: string; pincode: string };
    paymentMethod: PaymentMethod;
    notes?: string;
  }): Order {
    const orders = this.getAllOrders();
    const orderId = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const firstCrop = params.items[0].crop;
    const subtotal = params.items.reduce((acc, item) => acc + (item.crop.pricePerUnit * item.quantity), 0);
    const platformFee = Math.round(subtotal * 0.02);
    const deliveryFee = 350;
    const totalAmount = subtotal + platformFee + deliveryFee;

    const orderDate = new Date().toISOString();
    const estDate = new Date();
    estDate.setDate(estDate.getDate() + 3);

    const newOrder: Order = {
      id: orderId,
      buyerId: params.buyer.id,
      buyerName: params.buyer.name,
      buyerEmail: params.buyer.email,
      buyerPhone: params.buyer.phone,
      farmerId: firstCrop.farmerId,
      farmerName: firstCrop.farmerName,
      deliveryAddress: params.deliveryAddress,
      items: params.items.map(i => ({
        cropId: i.crop.id,
        cropName: i.crop.name,
        category: i.crop.category,
        quantity: i.quantity,
        unit: i.crop.unit,
        unitPrice: i.crop.pricePerUnit,
        total: i.crop.pricePerUnit * i.quantity,
        image: i.crop.image,
      })),
      subtotal,
      platformFee,
      deliveryFee,
      totalAmount,
      paymentMethod: params.paymentMethod,
      paymentStatus: 'paid',
      orderStatus: 'pending',
      orderDate,
      estimatedDelivery: estDate.toISOString().split('T')[0],
      trackingNumber: `AGC-LOG-${Math.floor(10000 + Math.random() * 90000)}`,
      timeline: [
        {
          status: 'pending',
          title: 'Order Placed & Verified',
          description: `Payment confirmed via ${params.paymentMethod.toUpperCase()}.`,
          timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          completed: true,
        },
        {
          status: 'confirmed',
          title: 'Farmer Confirmation',
          description: `Awaiting acceptance from ${firstCrop.farmerName}.`,
          timestamp: 'Pending',
          completed: false,
        },
        {
          status: 'processing',
          title: 'Sorting & Packaging',
          description: 'Quality grading and moisture-proof packing.',
          timestamp: 'Pending',
          completed: false,
        },
        {
          status: 'shipped',
          title: 'Dispatched in Transit',
          description: 'Logistics cargo pickup and transit.',
          timestamp: 'Pending',
          completed: false,
        },
        {
          status: 'delivered',
          title: 'Delivery Completed',
          description: `Destination: ${params.deliveryAddress.city}.`,
          timestamp: 'Pending',
          completed: false,
        }
      ],
      notes: params.notes,
    };

    const updated = [newOrder, ...orders];
    saveStorage(ORDERS_KEY, updated);

    // Persist order directly into MongoDB Atlas via Express Backend API
    try {
      fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      }).catch(err => console.warn('MongoDB REST API Order Sync Note:', err));
    } catch (e) {
      console.warn('MongoDB REST API Order Sync Note:', e);
    }

    // Notify farmer about new order
    notificationService.sendNotification({
      recipientId: firstCrop.farmerId,
      title: 'New Order Received',
      message: `${params.buyer.name} ordered ₹${totalAmount.toLocaleString('en-IN')} of produce (${params.items.map(i => i.crop.name).join(', ')}).`,
      type: 'order',
      actionUrl: '/farmer/orders',
    });

    return newOrder;
  },

  updateOrderStatus(orderId: string, status: OrderStatus): Order | null {
    const orders = this.getAllOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) return null;

    const order = orders[index];
    order.orderStatus = status;

    const statusIndexMap: Record<OrderStatus, number> = {
      pending: 0,
      confirmed: 1,
      processing: 2,
      shipped: 3,
      delivered: 4,
      cancelled: -1,
    };

    const targetIdx = statusIndexMap[status];
    if (targetIdx >= 0) {
      order.timeline.forEach((step, idx) => {
        if (idx <= targetIdx) {
          step.completed = true;
          if (idx === targetIdx && step.timestamp === 'Pending') {
            step.timestamp = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
          }
        } else {
          step.completed = false;
        }
      });
    }

    orders[index] = order;
    saveStorage(ORDERS_KEY, orders);

    // Sync status change directly to MongoDB Atlas via Express API
    try {
      fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }).catch(err => console.warn('MongoDB REST API Status Sync Note:', err));
    } catch (e) {
      console.warn('MongoDB REST API Status Sync Note:', e);
    }

    // Notify buyer
    notificationService.sendNotification({
      recipientId: order.buyerId,
      title: `Order Status Updated: ${status.toUpperCase()}`,
      message: `Your order #${order.id} is now ${status}.`,
      type: 'order',
      actionUrl: `/buyer/track/${order.id}`,
    });

    return order;
  },

  submitFeedback(orderId: string, feedback: { rating: number; qualityTag: string; comment: string }): Order | null {
    const orders = this.getAllOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) return null;

    const order = orders[index];
    const newFeedback: OrderFeedback = {
      ...feedback,
      submittedAt: new Date().toISOString(),
    };

    order.feedback = newFeedback;
    orders[index] = order;
    saveStorage(ORDERS_KEY, orders);

    // Notify farmer about buyer feedback
    notificationService.sendNotification({
      recipientId: order.farmerId,
      title: `New Buyer Rating Received ⭐ (${feedback.rating}/5)`,
      message: `${order.buyerName} left a ${feedback.rating}-star review for order #${order.id}: "${feedback.comment || feedback.qualityTag}"`,
      type: 'order',
      actionUrl: '/farmer/orders',
    });

    return order;
  }
};
