import mongoose from 'mongoose';

const cropSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    farmerId: { type: String, required: true },
    farmerName: { type: String, required: true },
    farmerLocation: { type: String, required: true },
    farmerRating: { type: Number, default: 4.9 },
    farmerPhone: { type: String },
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, default: '' },
    quantity: { type: Number, required: true },
    unit: { type: String, enum: ['kg', 'quintal', 'ton', 'crates', 'boxes'], required: true },
    pricePerUnit: { type: Number, required: true },
    harvestDate: { type: String, required: true },
    farmLocation: { type: String, required: true },
    image: { type: String, required: true },
    status: { type: String, enum: ['active', 'draft', 'sold_out', 'pending_moderation'], default: 'active' },
    organic: { type: Boolean, default: true },
    minOrder: { type: Number, default: 1 },
    shelfLifeDays: { type: Number, default: 14 },
    gradeQuality: { type: String, default: 'Grade A Premium' },
    hsnCode: { type: String, default: '0702' },
    gstRate: { type: Number, default: 0 },
    isExempt: { type: Boolean, default: true },
    salesVolume: { type: Number, default: 0 },
    totalSold: { type: Number, default: 0 },
    demandTrend: { type: String, default: 'High' },
    isTopSelling: { type: Boolean, default: false },
    salesRevenue: { type: Number, default: 0 },
    orderCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Crop = mongoose.model('Crop', cropSchema);
