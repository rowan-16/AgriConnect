import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import { User } from './models/User.js';
import { Crop } from './models/Crop.js';
import { Order } from './models/Order.js';

dotenv.config();

const INITIAL_USERS = [
  {
    id: 'usr_farmer_ramesh',
    name: 'Ramesh Patel',
    email: 'ramesh.farmer@agriconnect.com',
    role: 'farmer',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&q=80&w=300',
    location: 'Nashik, Maharashtra',
    farmName: 'Patel Organic Bio-Farms',
    farmLocation: 'Pimpalgaon Baswant, Nashik',
    farmSizeAcres: 14.5,
    cropsGrown: ['Organic Onions', 'Table Grapes', 'Pomegranate', 'Pusa Basmati Rice'],
    farmerRating: 4.9,
    isVerified: true,
    status: 'active',
  },
  {
    id: 'usr_farmer_sukhwinder',
    name: 'Sukhwinder Singh',
    email: 'sukhwinder.farmer@agriconnect.com',
    role: 'farmer',
    phone: '+91 98123 45678',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    location: 'Ludhiana, Punjab',
    farmName: 'Singh Golden Grains Estate',
    farmLocation: 'Khanna, Ludhiana',
    farmSizeAcres: 28.0,
    cropsGrown: ['Sharbati Wheat', 'Golden Sweet Corn', 'Mustard Seed'],
    farmerRating: 4.8,
    isVerified: true,
    status: 'active',
  },
  {
    id: 'usr_farmer_lakshmi',
    name: 'Lakshmi Narayanan',
    email: 'lakshmi.farmer@agriconnect.com',
    role: 'farmer',
    phone: '+91 94432 10987',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    location: 'Guntur, Andhra Pradesh',
    farmName: 'Red Spice Valley Farms',
    farmLocation: 'Tenali, Guntur',
    farmSizeAcres: 12.0,
    cropsGrown: ['Guntur S4 Red Chilli', 'Organic Turmeric'],
    farmerRating: 4.95,
    isVerified: true,
    status: 'active',
  },
  {
    id: 'usr_buyer_priya',
    name: 'Priya Sharma',
    email: 'priya.buyer@agriconnect.com',
    role: 'buyer',
    phone: '+91 91234 56789',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    location: 'Mumbai, Maharashtra',
    businessName: 'FreshnessMart Superstores',
    buyerType: 'Retailer',
    status: 'active',
  },
  {
    id: 'usr_admin_main',
    name: 'AgriConnect Administrator',
    email: 'admin@agriconnect.com',
    role: 'admin',
    phone: '+91 1800 123 4567',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300',
    location: 'New Delhi, India',
    status: 'active',
  }
];

const INITIAL_CROPS = [
  {
    id: 'crp_101',
    farmerId: 'usr_farmer_ramesh',
    farmerName: 'Ramesh Patel',
    farmerLocation: 'Nashik, Maharashtra',
    farmerRating: 4.9,
    farmerPhone: '+91 98765 43210',
    name: 'Organic Vine-Ripened Tomatoes',
    category: 'Fresh Vegetables',
    description: 'Pesticide-free, naturally ripened hybrid red tomatoes. Firm texture with high lycopene content.',
    quantity: 1200,
    unit: 'kg',
    pricePerUnit: 28,
    harvestDate: '2026-09-12',
    farmLocation: 'Patel Bio-Farms, Dindori, Nashik',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600',
    status: 'active',
    organic: true,
    minOrder: 50,
    shelfLifeDays: 14,
    gradeQuality: 'Grade A Premium',
  },
  {
    id: 'crp_102',
    farmerId: 'usr_farmer_sukhwinder',
    farmerName: 'Sukhwinder Singh',
    farmerLocation: 'Ludhiana, Punjab',
    farmerRating: 4.8,
    farmerPhone: '+91 98123 45678',
    name: 'Sharbati Royal Golden Wheat',
    category: 'Grains & Cereals',
    description: 'Single-origin premium Sharbati wheat grains from Punjab soil. Golden luster, heavy grains, superior gluten elasticity.',
    quantity: 85,
    unit: 'quintal',
    pricePerUnit: 3400,
    harvestDate: '2026-08-28',
    farmLocation: 'Singh Estate, Khanna, Ludhiana',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600',
    status: 'active',
    organic: false,
    minOrder: 5,
    shelfLifeDays: 365,
    gradeQuality: 'Grade A Export',
  },
  {
    id: 'crp_103',
    farmerId: 'usr_farmer_lakshmi',
    farmerName: 'Lakshmi Narayanan',
    farmerLocation: 'Guntur, Andhra Pradesh',
    farmerRating: 4.95,
    farmerPhone: '+91 94432 10987',
    name: 'Guntur S4 Hot Red Chilli',
    category: 'Spices & Herbs',
    description: 'Sun-dried high SHU spicy red chillies with intense aroma and natural deep red color pigment.',
    quantity: 450,
    unit: 'kg',
    pricePerUnit: 185,
    harvestDate: '2026-09-01',
    farmLocation: 'Red Spice Valley, Tenali, Guntur',
    image: 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&q=80&w=600',
    status: 'active',
    organic: true,
    minOrder: 10,
    shelfLifeDays: 180,
    gradeQuality: 'Grade A Extra Hot',
  },
  {
    id: 'crp_104',
    farmerId: 'usr_farmer_ramesh',
    farmerName: 'Ramesh Patel',
    farmerLocation: 'Nashik, Maharashtra',
    farmerRating: 4.9,
    farmerPhone: '+91 98765 43210',
    name: 'Export Superfine Basmati Rice (Pusa 1121)',
    category: 'Grains & Cereals',
    description: 'Aged 12-month traditional extra-long grain Pusa 1121 Basmati with signature aroma.',
    quantity: 850,
    unit: 'kg',
    pricePerUnit: 95,
    harvestDate: '2026-08-18',
    farmLocation: 'Patel Bio-Farms, Nashik',
    image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&q=80&w=600',
    status: 'active',
    organic: true,
    minOrder: 20,
    shelfLifeDays: 540,
    gradeQuality: 'Export Quality',
  },
  {
    id: 'crp_105',
    farmerId: 'usr_farmer_ramesh',
    farmerName: 'Ramesh Patel',
    farmerLocation: 'Nashik, Maharashtra',
    farmerRating: 4.9,
    farmerPhone: '+91 98765 43210',
    name: 'Nashik Red Storage Onions',
    category: 'Fresh Vegetables',
    description: 'Medium to large pungent red onions with tight outer skin. Excellent shelf life up to 4 months.',
    quantity: 2500,
    unit: 'kg',
    pricePerUnit: 28,
    harvestDate: '2026-09-05',
    farmLocation: 'Patel Bio-Farms, Nashik',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&q=80&w=600',
    status: 'active',
    organic: false,
    minOrder: 100,
    shelfLifeDays: 120,
    gradeQuality: 'Grade A Storage',
  }
];

async function seedDatabase() {
  await connectDB();

  console.log('🧹 Clearing existing collections...');
  await User.deleteMany({});
  await Crop.deleteMany({});

  console.log('🌱 Seeding Users into MongoDB Atlas...');
  await User.insertMany(INITIAL_USERS);

  console.log('🌾 Seeding Crops into MongoDB Atlas...');
  await Crop.insertMany(INITIAL_CROPS);

  console.log('✅ MongoDB Atlas Seed Completed Successfully!');
  process.exit(0);
}

seedDatabase().catch(err => {
  console.error('❌ Seeding Error:', err);
  process.exit(1);
});
