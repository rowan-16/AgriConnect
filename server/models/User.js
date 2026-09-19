import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['farmer', 'buyer', 'admin'], default: 'farmer' },
    phone: { type: String, default: '+91 98765 43210' },
    avatar: { type: String, default: '' },
    location: { type: String, default: 'India' },
    
    // Farmer specific
    farmName: { type: String, default: '' },
    farmLocation: { type: String, default: '' },
    farmSizeAcres: { type: Number, default: 0 },
    cropsGrown: [{ type: String }],
    farmerRating: { type: Number, default: 4.9 },
    isVerified: { type: Boolean, default: false },

    // Buyer specific
    businessName: { type: String, default: '' },
    buyerType: { type: String, default: 'Consumer' },
    savedAddresses: [
      {
        id: String,
        label: String,
        street: String,
        city: String,
        state: String,
        pincode: String,
        isDefault: Boolean,
      }
    ],

    // Account Status
    status: { type: String, enum: ['active', 'pending', 'suspended'], default: 'active' },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
