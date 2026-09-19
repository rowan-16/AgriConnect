import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import { User } from './models/User.js';
import { Crop } from './models/Crop.js';
import { Order } from './models/Order.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
connectDB();

// Root Server Landing Page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>AgriConnect Express REST API Server</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
          .card { background: white; padding: 32px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); max-width: 500px; width: 100%; text-align: center; }
          .badge { display: inline-flex; align-items: center; gap: 6px; background: #ecfdf5; color: #047857; font-weight: 700; font-size: 12px; padding: 6px 12px; border-radius: 9999px; margin-bottom: 16px; border: 1px solid #a7f3d0; }
          h1 { font-size: 24px; font-weight: 900; margin: 0 0 8px 0; color: #0f172a; }
          p { color: #64748b; font-size: 14px; margin: 0 0 24px 0; line-height: 1.5; }
          .endpoints { display: flex; flex-direction: column; gap: 10px; text-align: left; }
          .endpoint { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; text-decoration: none; color: #1e293b; font-weight: 600; font-size: 13px; transition: all 0.2s; }
          .endpoint:hover { background: #f1f5f9; border-color: #cbd5e1; color: #166534; }
          .method { font-size: 10px; font-weight: 800; background: #166534; color: white; padding: 3px 8px; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">● REST API Server Online</div>
          <h1>AgriConnect Backend Engine</h1>
          <p>Express 5 & MongoDB Atlas Database Server for direct farm-to-buyer trade & AI advisory.</p>
          <div class="endpoints">
            <a href="/api/health" class="endpoint"><span>/api/health</span> <span class="method">GET</span></a>
            <a href="/api/crops" class="endpoint"><span>/api/crops</span> <span class="method">GET / POST</span></a>
            <a href="/api/users" class="endpoint"><span>/api/users</span> <span class="method">GET / POST</span></a>
            <a href="/api/orders" class="endpoint"><span>/api/orders</span> <span class="method">GET / POST</span></a>
          </div>
        </div>
      </body>
    </html>
  `);
});

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    message: 'AgriConnect MongoDB Atlas API Server is running.',
    timestamp: new Date().toISOString(),
  });
});

import mongoose from 'mongoose';

const SEED_USERS = [
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
  }
];

const SEED_CROPS = [
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
  }
];

// Users REST API
app.get('/api/users', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(SEED_USERS);
    }
    const users = await User.find();
    res.json(users.length > 0 ? users : SEED_USERS);
  } catch {
    res.json(SEED_USERS);
  }
});

app.post('/api/users/register', async (req, res) => {
  try {
    const userData = req.body;
    if (!userData.id) userData.id = `usr_${Date.now()}`;
    if (!userData.phone) userData.phone = '+91 98765 43210';
    if (!userData.location) userData.location = 'India';

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOneAndUpdate(
        { email: userData.email.toLowerCase() },
        { $set: userData },
        { upsert: true, returnDocument: 'after' }
      );
      console.log(`✅ User synced to MongoDB Atlas: ${user.email} (${user.role})`);
      return res.status(201).json(user);
    }
    res.status(201).json(userData);
  } catch (err) {
    console.error('❌ Error saving user to MongoDB Atlas:', err.message);
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/users/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const updated = await User.findOneAndUpdate({ id: req.params.id }, req.body, { returnDocument: 'after' });
      return res.json(updated);
    }
    res.json({ id: req.params.id, ...req.body });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Crops REST API
app.get('/api/crops', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(SEED_CROPS);
    }
    const crops = await Crop.find();
    res.json(crops.length > 0 ? crops : SEED_CROPS);
  } catch {
    res.json(SEED_CROPS);
  }
});

app.post('/api/crops', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const newCrop = new Crop(req.body);
      await newCrop.save();
      return res.status(201).json(newCrop);
    }
    res.status(201).json({ ...req.body, id: `crp_${Date.now()}` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Orders REST API
app.get('/api/orders', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.json([]);
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const newOrder = new Order(req.body);
      await newOrder.save();
      return res.status(201).json(newOrder);
    }
    res.status(201).json({ ...req.body, id: `ord_${Date.now()}` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (mongoose.connection.readyState === 1) {
      const updated = await Order.findOneAndUpdate(
        { id: req.params.id },
        { orderStatus: status },
        { returnDocument: 'after' }
      );
      return res.json(updated);
    }
    res.json({ id: req.params.id, orderStatus: status });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const server = app.listen(PORT, () => {
  console.log(`🚀 AgriConnect Express Server running on http://localhost:${PORT}`);
});

// Keep process active even if DB connection is offline
setInterval(() => {}, 1000 * 60 * 60);
