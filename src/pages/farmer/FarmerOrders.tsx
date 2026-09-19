import React, { useState } from 'react';
import {
  ClipboardList,
  Search,
  Filter,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  User,
  Phone,
  MapPin,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { orderService } from '../../services/orderService';
import { Order, OrderStatus } from '../../types';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { InvoiceModal } from '../../components/common/InvoiceModal';

export const FarmerOrders: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<Order[]>(() => orderService.getOrdersByFarmer(user.id));
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | OrderStatus>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  const refreshOrders = () => {
    setOrders(orderService.getOrdersByFarmer(user.id));
  };

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    const updated = orderService.updateOrderStatus(orderId, newStatus);
    if (updated) {
      refreshOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated);
      }
      showToast(`Order #${orderId} status updated to ${newStatus.toUpperCase()}`, 'success', 'Status Updated');
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(i => i.cropName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="amber" dot>Pending Confirmation</Badge>;
      case 'confirmed':
        return <Badge variant="blue" dot>Farmer Confirmed</Badge>;
      case 'processing':
        return <Badge variant="purple" dot>Packaging & Grading</Badge>;
      case 'shipped':
        return <Badge variant="blue" dot>Dispatched in Transit</Badge>;
      case 'delivered':
        return <Badge variant="emerald" dot>Delivered & Settled</Badge>;
      case 'cancelled':
        return <Badge variant="red" dot>Cancelled</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Orders Received' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Buyer Orders Received</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Accept commercial purchase contracts, verify grading, and dispatch shipments to buyers.
          </p>
        </div>

        <div className="text-xs font-bold text-slate-600 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-soft">
          Total Received Orders: <span className="text-agri-600 font-extrabold">{orders.length}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order ID, buyer name, or crop..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-agri-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">Filter:</span>
          {(['All', 'pending', 'confirmed', 'processing', 'shipped', 'delivered'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all shrink-0 ${
                statusFilter === st
                  ? 'bg-agri-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table / Cards */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No orders found"
          description="There are currently no buyer purchase orders matching your selected status filter."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Order ID & Date</th>
                  <th className="px-6 py-4">Buyer Details</th>
                  <th className="px-6 py-4">Produce Items</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Current Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{order.id}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(order.orderDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{order.buyerName}</div>
                      <div className="text-[11px] text-slate-500">{order.deliveryAddress.city}, {order.deliveryAddress.state}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="font-semibold text-slate-800">
                            {item.quantity} {item.unit} • {item.cropName}
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-black text-slate-900 text-sm">
                        ₹{order.totalAmount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-bold uppercase">
                        Escrow: {order.paymentStatus}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {getStatusBadge(order.orderStatus)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3.5 py-1.5 bg-agri-50 hover:bg-agri-600 text-agri-700 hover:text-white font-bold text-xs rounded-xl border border-agri-200 hover:border-transparent transition-all"
                      >
                        Manage & Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail & Status Updater Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order Management: #${selectedOrder.id}`}
          subtitle={`Buyer: ${selectedOrder.buyerName} • Contact: ${selectedOrder.buyerPhone}`}
          maxWidth="2xl"
        >
          <div className="space-y-5">
            {/* Status Update Control */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Update Order Status:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all border ${
                      selectedOrder.orderStatus === st
                        ? 'bg-agri-600 text-white border-agri-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Mark {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Produce Items breakdown */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Ordered Produce Items
              </h4>
              <div className="space-y-2">
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100 text-xs">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.cropName} className="w-10 h-10 rounded-xl object-cover" />
                      <div>
                        <div className="font-bold text-slate-900">{item.cropName}</div>
                        <div className="text-[11px] text-slate-500">
                          {item.quantity} {item.unit} @ ₹{item.unitPrice}/{item.unit}
                        </div>
                      </div>
                    </div>
                    <div className="font-bold text-slate-900">
                      ₹{item.total.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Buyer Feedback & Rating Display (if submitted) */}
            {selectedOrder.feedback && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <span className="text-amber-500">⭐</span> Buyer Review & Quality Feedback
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                    Rating: {selectedOrder.feedback.rating}/5
                  </span>
                </div>
                <div className="font-semibold text-slate-800">
                  Tag: <span className="text-emerald-700">{selectedOrder.feedback.qualityTag}</span>
                </div>
                {selectedOrder.feedback.comment && (
                  <p className="text-slate-600 italic bg-white/80 p-2 rounded-xl border border-amber-100">
                    "{selectedOrder.feedback.comment}"
                  </p>
                )}
              </div>
            )}

            {/* Delivery address & Tracking details */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-2">
              <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Delivery Destination Address
              </div>
              <p className="text-slate-700">
                {selectedOrder.deliveryAddress.street}, {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} - {selectedOrder.deliveryAddress.pincode}
              </p>
              <div className="pt-2 border-t border-emerald-100 flex justify-between text-[11px] text-emerald-800 font-semibold">
                <span>Tracking Reference: <strong>{selectedOrder.trackingNumber}</strong></span>
                <span>Est Delivery: {selectedOrder.estimatedDelivery}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setInvoiceOrder(selectedOrder)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-200"
              >
                <FileText className="w-4 h-4 text-slate-600" /> View Tax Invoice
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200"
              >
                Close Window
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* REQ-4.4 Tax Invoice Modal */}
      {invoiceOrder && (
        <InvoiceModal
          order={invoiceOrder}
          isOpen={!!invoiceOrder}
          onClose={() => setInvoiceOrder(null)}
        />
      )}

    </div>
  );
};

