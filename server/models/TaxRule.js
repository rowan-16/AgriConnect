import mongoose from 'mongoose';

const taxRuleSchema = new mongoose.Schema(
  {
    hsnCode: { type: String, required: true, index: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    gstRate: { type: Number, required: true, default: 0 }, // e.g. 0, 5, 12, 18
    isExempt: { type: Boolean, default: false },
    exemptionNotification: { type: String, default: '' },
    effectiveFrom: { type: Date, default: () => new Date('2017-07-01') },
    verifiedSource: {
      type: String,
      default: 'CBIC Official GST Tariff Schedule (Chapters 06-12 Agricultural Produce)',
    },
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
    auditNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const TaxRule = mongoose.model('TaxRule', taxRuleSchema);
