import mongoose from 'mongoose';

const webhookLogSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    eventType: { type: String, required: true },
    source: { type: String, default: 'razorpay' },
    payloadHash: { type: String },
    processedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['processed', 'ignored', 'failed'], default: 'processed' },
    error: { type: String },
  },
  { timestamps: true }
);

export const WebhookLog = mongoose.model('WebhookLog', webhookLogSchema);
