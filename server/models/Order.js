import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    buyerId: { type: String, required: true },
    buyerName: { type: String, required: true },
    buyerEmail: { type: String, required: true },
    buyerPhone: { type: String, required: true },
    farmerId: { type: String, required: true },
    farmerName: { type: String, required: true },
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    items: [
      {
        cropId: String,
        cropName: String,
        category: String,
        quantity: Number,
        unit: String,
        unitPrice: Number,
        total: Number,
        image: String,
      }
    ],
    subtotal: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, default: 'upi' },
    paymentStatus: { type: String, default: 'paid' },
    orderStatus: { type: String, enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    orderDate: { type: String, required: true },
    estimatedDelivery: { type: String, required: true },
    trackingNumber: { type: String, required: true },
    timeline: [
      {
        status: String,
        title: String,
        description: String,
        timestamp: String,
        completed: Boolean,
      }
    ],
    notes: String,
    feedback: {
      rating: Number,
      qualityTag: String,
      comment: String,
      submittedAt: String,
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);
