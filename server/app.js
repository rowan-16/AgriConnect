import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import mongoose from 'mongoose';
import { connectDB } from './db.js';
import { User } from './models/User.js';
import { Crop } from './models/Crop.js';
import { Order } from './models/Order.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect DB middleware for both standalone and serverless environments
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (err) {
      console.warn('DB connect error in middleware:', err.message);
    }
  }
  next();
});

// Normalize URL in case Vercel rewrites target /api/index.js
app.use((req, res, next) => {
  if (req.url.startsWith('/api/index.js')) {
    req.url = req.url.replace('/api/index.js', '') || '/';
  }
  next();
});

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
  },
  {
    id: 'usr_buyer_pushpitha',
    name: 'Pushpitha .K',
    email: 'pushpitha.k@agriconnect.com',
    role: 'buyer',
    phone: '+91 98765 00000',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    location: 'Bengaluru, Karnataka',
    businessName: 'KP Commercial Farm Procurement Hub',
    buyerType: 'Wholesale Distributor',
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
  }
];

// Router for all API routes
const apiRouter = express.Router();

// Health Check
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'online',
    message: 'AgriConnect MongoDB Atlas API Server is running.',
    dbState: mongoose.connection.readyState,
    timestamp: new Date().toISOString(),
  });
});

// Users REST API
apiRouter.get('/users', async (req, res) => {
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

apiRouter.post('/users/register', async (req, res) => {
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

apiRouter.patch('/users/:id', async (req, res) => {
  try {
    const targetId = req.params.id;
    if (mongoose.connection.readyState === 1) {
      const updated = await User.findOneAndUpdate(
        { $or: [{ id: targetId }, { email: targetId.toLowerCase() }] },
        { $set: req.body },
        { returnDocument: 'after' }
      );
      return res.json(updated);
    }
    res.json({ id: targetId, ...req.body });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/users/:id', async (req, res) => {
  try {
    const targetId = req.params.id;
    if (mongoose.connection.readyState === 1) {
      await User.deleteMany({ $or: [{ id: targetId }, { email: targetId.toLowerCase() }] });
      console.log(`🗑️ User deleted from MongoDB Atlas: ${targetId}`);
    }
    return res.json({ success: true, message: `User ${targetId} deleted successfully` });
  } catch (err) {
    console.error('❌ Error deleting user from MongoDB Atlas:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// Crops REST API
apiRouter.get('/crops', async (req, res) => {
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

apiRouter.post('/crops', async (req, res) => {
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
apiRouter.get('/orders', async (req, res) => {
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

apiRouter.post('/orders', async (req, res) => {
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

apiRouter.patch('/orders/:id/status', async (req, res) => {
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

// Mount router on both `/api` and `/` so requests work regardless of rewrite behavior
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Serve Vite React frontend if built (for standalone production server)
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

export default app;
