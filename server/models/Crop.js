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
  },
  { timestamps: true }
);

export const Crop = mongoose.model('Crop', cropSchema);
