import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema(
  {
    toEmail: { type: String, required: true },
    targetRecipient: { type: String, required: true },
    sender: { type: String, default: 'rocklandrowanm@gmail.com' },
    userName: { type: String },
    role: { type: String },
    method: { type: String },
    status: { type: String, enum: ['sent', 'failed'], default: 'sent' },
    messageId: { type: String },
    error: { type: String },
    clientIp: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

export const EmailLog = mongoose.model('EmailLog', emailLogSchema);
