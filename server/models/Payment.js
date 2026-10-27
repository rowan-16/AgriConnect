import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    orderId: { type: String, required: true, index: true },
    buyerId: { type: String, required: true, index: true },
    buyerEmail: { type: String, required: true },
    farmerId: { type: String, required: true },
    amountInPaise: { type: Number, required: true },
    amountInRupees: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    razorpayOrderId: { type: String, index: true },
    razorpayPaymentId: { type: String, index: true },
    razorpaySignature: { type: String },
    status: {
      type: String,
      enum: ['created', 'authorized', 'captured', 'failed', 'refunded'],
      default: 'created',
      index: true,
    },
    method: { type: String, default: 'razorpay' },
    isTestMode: { type: Boolean, default: true },
    idempotencyKey: { type: String, unique: true, sparse: true },
    taxBreakdown: {
      produceSubtotal: Number,
      produceTaxableAmount: Number,
      produceCgst: Number,
      produceSgst: Number,
      produceIgst: Number,
      produceTotalTax: Number,
      platformFee: Number,
      platformGst: Number,
      deliveryFee: Number,
      deliveryGst: Number,
      totalGst: Number,
      grandTotal: Number,
      isInterState: Boolean,
      placeOfSupply: String,
    },
    failureReason: { type: String },
    rawGatewayResponse: { type: mongoose.Schema.Types.Mixed },
    reconciliationLogs: [
      {
        timestamp: { type: Date, default: Date.now },
        action: String,
        details: String,
        status: String,
        operator: { type: String, default: 'SYSTEM' },
      },
    ],
  },
  { timestamps: true }
);

export const Payment = mongoose.model('Payment', paymentSchema);
