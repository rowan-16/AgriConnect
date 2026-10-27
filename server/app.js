import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import { User } from './models/User.js';
import { Crop } from './models/Crop.js';
import { Order } from './models/Order.js';
import { Payment } from './models/Payment.js';
import { Invoice } from './models/Invoice.js';
import { TaxRule } from './models/TaxRule.js';
import { Counter } from './models/Counter.js';
import { WebhookLog } from './models/WebhookLog.js';
import {
  calculateAuthoritativeTax,
  verifyGstinWithProvider,
  DEFAULT_HSN_DIRECTORY,
} from './services/taxService.js';
import { generateInvoicePdf } from './services/pdfService.js';
import {
  createPaymentOrder,
  verifyPaymentSignature,
  processRazorpayWebhook,
  getRazorpayClient,
} from './services/paymentService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

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
    salesVolume: 6800,
    totalSold: 6800,
    demandTrend: 'High',
    isTopSelling: true,
    salesRevenue: 190400,
    orderCount: 47,
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
    salesVolume: 480,
    totalSold: 480,
    demandTrend: 'Surging',
    isTopSelling: true,
    salesRevenue: 1632000,
    orderCount: 38,
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
    salesVolume: 3850,
    totalSold: 3850,
    demandTrend: 'High',
    isTopSelling: true,
    salesRevenue: 712250,
    orderCount: 31,
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
    salesVolume: 18000,
    totalSold: 18000,
    demandTrend: 'Very High',
    isTopSelling: true,
    salesRevenue: 1710000,
    orderCount: 52,
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
    salesVolume: 24500,
    totalSold: 24500,
    demandTrend: 'Very High',
    isTopSelling: true,
    salesRevenue: 686000,
    orderCount: 64,
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
    const userData = { ...req.body };
    if (!userData.id) userData.id = `usr_${Date.now()}`;
    if (!userData.phone) userData.phone = '+91 98765 43210';
    if (!userData.location) userData.location = 'India';

    // Prevent public admin registration
    if (userData.role === 'admin') {
      userData.role = 'farmer';
    }

    if (userData.role === 'farmer') {
      userData.isVerified = false;
      userData.status = 'pending';
      if (!userData.applicationRef) {
        userData.applicationRef = `AGC-APP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      }
      if (userData.verificationDocuments) {
        userData.verificationDocuments.applicationRef = userData.applicationRef;
        userData.verificationDocuments.status = userData.verificationDocuments.status || 'pending';
        userData.verificationDocuments.submittedAt = userData.verificationDocuments.submittedAt || new Date();
      }
    }

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOneAndUpdate(
        { email: userData.email.toLowerCase() },
        { $set: userData },
        { upsert: true, returnDocument: 'after' }
      );
      console.log(`✅ User synced to MongoDB Atlas: ${user.email} (${user.role}) [Ref: ${user.applicationRef || 'N/A'}]`);
      return res.status(201).json(user);
    }
    res.status(201).json(userData);
  } catch (err) {
    console.error('❌ Error saving user to MongoDB Atlas:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// Admin Review & Verification Endpoint
app.patch('/api/admin/farmers/:id/verify', async (req, res) => {
  try {
    const { status, rejectionReason, adminNotes, reviewerId } = req.body;
    const isApproved = status === 'approved';
    const update = {
      isVerified: isApproved,
      status: isApproved ? 'active' : 'pending',
      'verificationDocuments.status': status,
      'verificationDocuments.rejectionReason': !isApproved ? (rejectionReason || 'Documents rejected by Admin') : '',
      'verificationDocuments.adminNotes': adminNotes || '',
      'verificationDocuments.reviewedAt': new Date(),
      'verificationDocuments.reviewedBy': reviewerId || 'AgriConnect Admin',
    };

    if (mongoose.connection.readyState === 1) {
      const updated = await User.findOneAndUpdate(
        { id: req.params.id },
        { $set: update },
        { returnDocument: 'after' }
      );
      if (!updated) return res.status(404).json({ error: 'Farmer not found' });
      return res.json(updated);
    }
    res.json({ id: req.params.id, ...update });
  } catch (err) {
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

// Top Selling Crops Analytics API
app.get('/api/crops/top-selling', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const topCrops = await Crop.find({ isTopSelling: true }).sort({ salesRevenue: -1 });
      if (topCrops.length > 0) return res.json(topCrops);
      const fallback = await Crop.find().sort({ salesVolume: -1 }).limit(5);
      if (fallback.length > 0) return res.json(fallback);
    }
    const top = SEED_CROPS.filter(c => c.isTopSelling).sort((a, b) => (b.salesRevenue || 0) - (a.salesRevenue || 0));
    res.json(top.length > 0 ? top : SEED_CROPS.slice(0, 5));
  } catch {
    res.json(SEED_CROPS.filter(c => c.isTopSelling));
  }
});

app.post('/api/crops', async (req, res) => {
  try {
    // Check if farmer is verified
    if (mongoose.connection.readyState === 1 && req.body.farmerId) {
      const farmer = await User.findOne({ id: req.body.farmerId });
      if (farmer && !farmer.isVerified) {
        return res.status(403).json({ 
          error: 'Unverified farmer accounts cannot publish crop listings. Please await Administrator verification.' 
        });
      }
    }

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

// ==========================================
// RAZORPAY PAYMENT ENDPOINTS
// ==========================================

// Gateway Configuration (Public key for checkout.js)
app.get('/api/payments/config', (req, res) => {
  const { key_id } = getRazorpayClient();
  const isLive = Boolean(process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.includes('test'));
  res.json({
    keyId: key_id,
    isLive,
    currency: 'INR',
    escrowEnabled: true,
  });
});

// Create Order (Authoritative server-side price & tax calculation)
app.post('/api/payments/create-order', async (req, res) => {
  try {
    const { buyer, cartItems, deliveryAddress, notes } = req.body;
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart items are required to create payment order.' });
    }

    const result = await createPaymentOrder({
      buyer: buyer || { id: 'usr_guest', name: 'Buyer', email: 'buyer@agriconnect.com' },
      cartItems,
      deliveryAddress: deliveryAddress || {},
      notes: notes || '',
    });

    res.status(201).json(result);
  } catch (err) {
    console.error('❌ Error creating Razorpay order:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// Verify Payment Signature (HMAC SHA-256 Verification & Stock Atomic Deduction)
app.post('/api/payments/verify', async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      internalOrderId,
      buyer,
      deliveryAddress,
      notes,
    } = req.body;

    const result = await verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      internalOrderId,
      buyer,
      deliveryAddress,
      notes,
    });

    res.json(result);
  } catch (err) {
    console.error('❌ Payment verification failed:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// Razorpay Webhook Endpoint (Raw body HMAC SHA-256 signature verification)
app.post('/api/payments/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));

    const result = await processRazorpayWebhook(rawBody, signature);
    res.json(result);
  } catch (err) {
    console.error('❌ Razorpay webhook error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// Payment Status & Details
app.get('/api/payments/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const payment = await Payment.findOne({
        $or: [{ id: req.params.id }, { orderId: req.params.id }, { razorpayOrderId: req.params.id }],
      });
      if (payment) return res.json(payment);
    }
    res.status(404).json({ error: 'Payment record not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Payment Reconciliation & Audit Logs
app.get('/api/payments/reconciliation/logs', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const payments = await Payment.find().sort({ createdAt: -1 }).limit(50);
      return res.json(payments);
    }
    res.json([]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// GST & TAX ENGINE ENDPOINTS
// ==========================================

// Authoritative Tax Calculation (for cart preview & checkout)
app.post('/api/tax/calculate', (req, res) => {
  try {
    const { items, farmerLocation, deliveryAddress, farmerGstin } = req.body;
    const taxCalc = calculateAuthoritativeTax({
      items: items || [],
      farmerLocation: farmerLocation || 'Maharashtra',
      deliveryAddress: deliveryAddress || {},
      farmerGstin: farmerGstin || '',
    });
    res.json(taxCalc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GSTIN Verification Adapter
app.post('/api/tax/verify-gstin', async (req, res) => {
  try {
    const { gstin, stateCode } = req.body;
    const verification = await verifyGstinWithProvider(gstin, stateCode);
    res.json(verification);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Tax Rules List
app.get('/api/tax/rules', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const dbRules = await TaxRule.find({ status: 'active' });
      if (dbRules.length > 0) return res.json(dbRules);
    }
    // Return verified CBIC HSN directory
    const defaultRules = Object.entries(DEFAULT_HSN_DIRECTORY).map(([hsnCode, val]) => ({
      hsnCode,
      ...val,
      status: 'active',
      verifiedSource: 'CBIC Official GST Tariff Schedule (Chapters 06-12 Agricultural Produce)',
    }));
    res.json(defaultRules);
  } catch {
    res.json([]);
  }
});

// Admin Add/Update Tax Rule
app.post('/api/tax/rules', async (req, res) => {
  try {
    const ruleData = req.body;
    if (mongoose.connection.readyState === 1) {
      const updated = await TaxRule.findOneAndUpdate(
        { hsnCode: ruleData.hsnCode },
        { $set: ruleData },
        { upsert: true, returnDocument: 'after' }
      );
      return res.status(201).json(updated);
    }
    res.status(201).json(ruleData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// INVOICE & PDF GENERATION ENDPOINTS
// ==========================================

// List Invoices
app.get('/api/invoices', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const invoices = await Invoice.find().sort({ createdAt: -1 });
      return res.json(invoices);
    }
    res.json([]);
  } catch {
    res.json([]);
  }
});

// Get Invoice by Order ID
app.get('/api/invoices/:orderId', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const invoice = await Invoice.findOne({
        $or: [{ orderId: req.params.orderId }, { invoiceNumber: req.params.orderId }],
      });
      if (invoice) return res.json(invoice);
    }
    res.status(404).json({ error: 'Invoice not found for this order' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download/View Authoritative PDF Invoice
app.get('/api/invoices/:orderId/pdf', async (req, res) => {
  try {
    let invoice = null;

    if (mongoose.connection.readyState === 1) {
      invoice = await Invoice.findOne({
        $or: [{ orderId: req.params.orderId }, { invoiceNumber: req.params.orderId }],
      });
    }

    // If invoice not created yet in DB, synthesize from order
    if (!invoice) {
      let order = null;
      if (mongoose.connection.readyState === 1) {
        order = await Order.findOne({ id: req.params.orderId });
      }

      if (!order) {
        // Fallback demo invoice if order in local storage
        const taxCalc = calculateAuthoritativeTax({
          items: [{ cropName: 'Organic Fresh Produce', quantity: 100, unitPrice: 35 }],
          farmerLocation: 'Maharashtra',
        });
        invoice = {
          invoiceNumber: `AGC-INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          invoiceType: 'TAX_INVOICE',
          orderId: req.params.orderId,
          paymentId: 'rzp_demo_payment_verified',
          issueDate: new Date(),
          supplier: {
            name: 'Ramesh Patel',
            farmName: 'Patel Bio-Farms',
            farmLocation: 'Nashik, Maharashtra',
            state: 'Maharashtra',
            stateCode: '27',
            gstin: '27AAAAA0000A1Z5',
            isRegistered: true,
          },
          recipient: {
            name: 'Priya Sharma',
            businessName: 'FreshnessMart Superstores',
            deliveryAddress: { street: 'Plot 42, APMC Yard', city: 'Navi Mumbai', state: 'Maharashtra', pincode: '400703' },
          },
          placeOfSupply: 'Maharashtra (27)',
          isInterState: false,
          items: taxCalc.items,
          marketplaceFee: { taxableAmount: taxCalc.platformFee, totalAmount: taxCalc.platformFeeTotal },
          logisticsFee: { taxableAmount: taxCalc.deliveryFee, totalAmount: taxCalc.deliveryFee },
          summary: {
            totalTaxableValue: taxCalc.produceTaxableAmount,
            totalCgst: taxCalc.totalCgst,
            totalSgst: taxCalc.totalSgst,
            totalIgst: taxCalc.totalIgst,
            totalTax: taxCalc.totalGst,
            grandTotal: taxCalc.grandTotal,
            amountInWords: taxCalc.amountInWords,
          },
        };
      } else {
        const taxCalc = calculateAuthoritativeTax({
          items: order.items || [],
          farmerLocation: order.deliveryAddress?.state || 'Maharashtra',
          deliveryAddress: order.deliveryAddress || {},
        });
        invoice = {
          invoiceNumber: order.invoiceNumber || `AGC-INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          invoiceType: 'BILL_OF_SUPPLY',
          orderId: order.id,
          paymentId: order.paymentId || 'PAID_ESCROW',
          issueDate: new Date(order.orderDate || Date.now()),
          supplier: {
            name: order.farmerName,
            farmName: `${order.farmerName}'s Farm Estate`,
            farmLocation: taxCalc.supplierState.stateName,
            state: taxCalc.supplierState.stateName,
            stateCode: taxCalc.supplierState.stateCode,
            isRegistered: false,
          },
          recipient: {
            name: order.buyerName,
            email: order.buyerEmail,
            phone: order.buyerPhone,
            deliveryAddress: order.deliveryAddress,
          },
          placeOfSupply: taxCalc.placeOfSupply,
          isInterState: taxCalc.isInterState,
          items: taxCalc.items,
          marketplaceFee: { taxableAmount: taxCalc.platformFee, totalAmount: taxCalc.platformFeeTotal },
          logisticsFee: { taxableAmount: taxCalc.deliveryFee, totalAmount: taxCalc.deliveryFee },
          summary: {
            totalTaxableValue: taxCalc.produceTaxableAmount,
            totalCgst: taxCalc.totalCgst,
            totalSgst: taxCalc.totalSgst,
            totalIgst: taxCalc.totalIgst,
            totalTax: taxCalc.totalGst,
            grandTotal: taxCalc.grandTotal,
            amountInWords: taxCalc.amountInWords,
          },
        };
      }
    }

    const pdfBuffer = await generateInvoicePdf(invoice);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="AgriConnect-Invoice-${invoice.invoiceNumber}.pdf"`
    );
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('❌ PDF Generation Error:', err.message);
    res.status(500).json({ error: 'Failed to generate authoritative PDF invoice: ' + err.message });
  }
});


import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

// DELETE user route for admin manage users
app.delete('/api/users/:id', async (req, res) => {
  try {
    const targetId = req.params.id;
    if (mongoose.connection.readyState === 1) {
      await User.deleteMany({ $or: [{ id: targetId }, { email: targetId.toLowerCase() }] });
    }
    return res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Serve frontend if built
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
