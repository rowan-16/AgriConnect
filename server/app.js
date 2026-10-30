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
import { EmailLog } from './models/EmailLog.js';
import {
  calculateAuthoritativeTax,
  verifyGstinWithProvider,
  DEFAULT_HSN_DIRECTORY,
} from './services/taxService.js';
// pdfService is dynamically loaded in route to keep serverless bundles lightweight
import {
  createPaymentOrder,
  verifyPaymentSignature,
  processRazorpayWebhook,
  getRazorpayClient,
} from './services/paymentService.js';
import { sendPasswordResetEmail, sendLoginNotificationEmail } from './services/emailService.js';

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

// Connect to MongoDB Atlas (warm up connection and middleware for serverless requests)
connectDB();
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.warn('DB connect middleware error:', err.message);
  }
  next();
});

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
  },
  {
    id: 'usr_farmer_rowan',
    name: 'Rockland Rowan M',
    email: 'rocklandrowanm@gmail.com',
    role: 'farmer',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300',
    location: 'Coimbatore, Tamil Nadu',
    farmName: 'Rowan Organic Agro Tech',
    farmLocation: 'Pollachi Main Road, Coimbatore',
    farmSizeAcres: 24.5,
    cropsGrown: ['Organic Bell Peppers', 'Hydroponic Butterhead Lettuce', 'Bhagwa Organic Pomegranates'],
    farmerRating: 5.0,
    isVerified: true,
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
  },
  {
    id: 'crp_rowan_101',
    farmerId: 'usr_farmer_rowan',
    farmerName: 'Rockland Rowan M',
    farmerLocation: 'Coimbatore, Tamil Nadu',
    farmerRating: 5.0,
    farmerPhone: '+91 98765 43210',
    name: 'Organic Farm-Fresh Bell Peppers (Capsicum)',
    category: 'Fresh Vegetables',
    description: 'Crisp, vibrant greenhouse-grown sweet bell peppers rich in vitamins A & C. Pesticide-free harvest directly from Rowan Organic Agro Tech.',
    quantity: 1500,
    unit: 'kg',
    pricePerUnit: 45,
    harvestDate: '2026-10-28',
    farmLocation: 'Rowan Organic Agro Tech, Coimbatore',
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&q=80&w=600',
    status: 'active',
    organic: true,
    minOrder: 25,
    shelfLifeDays: 16,
    gradeQuality: 'Grade A Premium',
    salesVolume: 3200,
    totalSold: 3200,
    demandTrend: 'Very High',
    isTopSelling: true,
    salesRevenue: 144000,
    orderCount: 29,
  },
  {
    id: 'crp_rowan_102',
    farmerId: 'usr_farmer_rowan',
    farmerName: 'Rockland Rowan M',
    farmerLocation: 'Coimbatore, Tamil Nadu',
    farmerRating: 5.0,
    farmerPhone: '+91 98765 43210',
    name: 'Hydroponic Crisp Butterhead Lettuce',
    category: 'Fresh Vegetables',
    description: 'Ultra-fresh, residue-free hydroponic butterhead lettuce heads packed in breathable moisture packs. Perfect for salads, gourmet burgers, and hospitality procurement.',
    quantity: 800,
    unit: 'crates',
    pricePerUnit: 120,
    harvestDate: '2026-10-29',
    farmLocation: 'Rowan Organic Agro Tech, Coimbatore',
    image: 'https://images.unsplash.com/photo-1556801712-76c8eb07bbc9?auto=format&fit=crop&q=80&w=600',
    status: 'active',
    organic: true,
    minOrder: 10,
    shelfLifeDays: 12,
    gradeQuality: 'Export Quality',
    salesVolume: 1950,
    totalSold: 1950,
    demandTrend: 'High',
    isTopSelling: true,
    salesRevenue: 234000,
    orderCount: 22,
  },
  {
    id: 'crp_rowan_103',
    farmerId: 'usr_farmer_rowan',
    farmerName: 'Rockland Rowan M',
    farmerLocation: 'Coimbatore, Tamil Nadu',
    farmerRating: 5.0,
    farmerPhone: '+91 98765 43210',
    name: 'Bhagwa Ruby Red Organic Pomegranates',
    category: 'Seasonal Fruits',
    description: 'Naturally ripened Bhagwa variety pomegranates with soft seeds, deep crimson color, and high Brix sweetness. Directly harvested from Rowan Agro Tech.',
    quantity: 2200,
    unit: 'kg',
    pricePerUnit: 110,
    harvestDate: '2026-10-27',
    farmLocation: 'Rowan Organic Agro Tech, Coimbatore',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=600',
    status: 'active',
    organic: true,
    minOrder: 30,
    shelfLifeDays: 30,
    gradeQuality: 'Export Quality',
    salesVolume: 4100,
    totalSold: 4100,
    demandTrend: 'Surging',
    isTopSelling: true,
    salesRevenue: 451000,
    orderCount: 35,
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

app.get('/api/users/by-email/:email', async (req, res) => {
  try {
    const rawEmail = decodeURIComponent(req.params.email).toLowerCase().trim();
    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: new RegExp(`^${rawEmail}$`, 'i') });
      if (user) return res.json(user);
    }
    const seed = SEED_USERS.find(u => u.email.toLowerCase() === rawEmail);
    if (seed) return res.json(seed);
    return res.status(404).json({ error: 'User not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
      userData.isVerified = userData.isVerified !== undefined ? Boolean(userData.isVerified) : true;
      userData.status = userData.status || 'active';
      if (!userData.applicationRef) {
        userData.applicationRef = `AGC-APP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      }
      if (userData.verificationDocuments) {
        userData.verificationDocuments.applicationRef = userData.applicationRef;
        userData.verificationDocuments.status = userData.verificationDocuments.status || 'approved';
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

// Forgot Password - Send Temporary Password via Gmail
app.post(['/api/auth/forgot-password', '/auth/forgot-password'], async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide a valid registered email address.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = null;

    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email: normalizedEmail });
    }

    // Fallback to in-memory seeds if MongoDB user is not yet created
    if (!user) {
      const seedMatch = SEED_USERS.find(u => u.email.toLowerCase() === normalizedEmail);
      if (seedMatch) {
        user = seedMatch;
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `No AgriConnect account found with email "${email}". Please verify the address or register.`,
      });
    }

    // Generate a secure temporary password (e.g. Agri-749214)
    const tempPassword = 'Agri-' + Math.floor(100000 + Math.random() * 900000);

    // Attempt sending through Gmail SMTP first
    try {
      await sendPasswordResetEmail(user.email, user.name, tempPassword);
      console.log(`📧 Password reset email sent successfully to ${user.email}`);

      // Only save temporary password to database once email is confirmed sent!
      if (mongoose.connection.readyState === 1 && typeof user.save === 'function') {
        user.password = tempPassword;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
        await user.save();
      }

      return res.json({
        success: true,
        message: `Your temporary password has been successfully sent to ${user.email}. Please check your Gmail inbox and spam folder.`,
      });
    } catch (emailErr) {
      console.error('❌ Gmail delivery failure:', emailErr.message);
      return res.status(500).json({
        success: false,
        message: `Failed to deliver email to Gmail: ${emailErr.message}. Please ensure EMAIL_USER and EMAIL_PASS (App Password) are configured in .env. Your existing password remains unchanged.`,
      });
    }
  } catch (err) {
    console.error('❌ Forgot password server error:', err);
    res.status(500).json({ success: false, message: 'Internal server error processing password reset.' });
  }
});

// Notify Login - Send Security Alert to Gmail
app.post(['/api/auth/notify-login', '/auth/notify-login'], async (req, res) => {
  try {
    const { email, name, role, method } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Web Browser';

    // Parse user friendly device representation
    let device = 'Web Browser';
    if (userAgent.includes('Windows')) device = 'Windows PC (Desktop Browser)';
    else if (userAgent.includes('Macintosh')) device = 'Apple Mac (Desktop Browser)';
    else if (userAgent.includes('Android')) device = 'Android Smartphone';
    else if (userAgent.includes('iPhone')) device = 'Apple iPhone';
    else if (userAgent.includes('Linux')) device = 'Linux Workstation';

    const details = {
      timestamp: new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'full',
        timeStyle: 'medium',
      }),
      ip: String(clientIp).split(',')[0].trim(),
      device,
      method: method || 'Password Authentication',
    };

    // 1. Fetch user directly from MongoDB Atlas (or upsert if first-time sign in)
    let fetchedGmail = email.trim();
    let fetchedName = name || 'User';
    let fetchedRole = role || 'farmer';

    try {
      let dbUser = await User.findOne({ email: new RegExp(`^${email.trim()}$`, 'i') });
      if (!dbUser) {
        dbUser = await User.create({
          id: `usr_${Date.now()}`,
          name: name || email.split('@')[0],
          email: email.trim().toLowerCase(),
          role: role || 'farmer',
          status: 'active',
          password: 'password123',
        });
        console.log(`👤 New user saved to MongoDB: ${dbUser.email} (${dbUser.role})`);
      } else {
        console.log(`👤 User retrieved from MongoDB: ${dbUser.email} (${dbUser.name}) [Role: ${dbUser.role}]`);
        if (dbUser.email.toLowerCase() === 'admin@agriconnect.com') {
          if (dbUser.role !== 'admin') {
            dbUser.role = 'admin';
            await dbUser.save();
          }
        } else if (role && dbUser.role !== role) {
          dbUser.role = role;
          await dbUser.save();
          console.log(`🔄 Updated user role in MongoDB to ${role} for ${dbUser.email}`);
        }
      }
      if (dbUser && dbUser.email) {
        fetchedGmail = dbUser.email;
        fetchedName = dbUser.name || fetchedName;
        fetchedRole = dbUser.email.toLowerCase() === 'admin@agriconnect.com' ? 'admin' : (role || dbUser.role || fetchedRole);
      }
    } catch (dbErr) {
      console.warn('MongoDB user lookup notice:', dbErr.message);
    }

    // 2. Send immediate mail from rocklandrowanm@gmail.com to the fetched Gmail address
    try {
      const emailResult = await sendLoginNotificationEmail(fetchedGmail, fetchedName, fetchedRole, details);
      const targetRecipient = (emailResult?.envelope?.to && emailResult.envelope.to.length > 0)
        ? emailResult.envelope.to.join(', ')
        : (Array.isArray(fetchedGmail) ? fetchedGmail.join(', ') : fetchedGmail);
      console.log(`📧 Immediate email dispatched from rocklandrowanm@gmail.com to fetched DB address: ${targetRecipient}`);

      // Persist log to MongoDB Atlas
      try {
        await EmailLog.create({
          toEmail: email,
          targetRecipient,
          sender: 'rocklandrowanm@gmail.com',
          userName: name || 'User',
          role: role || 'user',
          method: details.method,
          status: 'sent',
          messageId: emailResult?.messageId,
          clientIp: details.ip,
          userAgent: String(userAgent).slice(0, 200),
        });
      } catch (logDbErr) {
        console.warn('EmailLog DB persist notice:', logDbErr.message);
      }

      return res.json({
        success: true,
        message: `Security alert email sent to ${targetRecipient}`,
        targetRecipient,
        messageId: emailResult?.messageId,
      });
    } catch (emailErr) {
      console.warn('⚠️ Login email delivery skipped/failed:', emailErr.message);

      try {
        await EmailLog.create({
          toEmail: email,
          targetRecipient: email,
          sender: 'rocklandrowanm@gmail.com',
          userName: name || 'User',
          role: role || 'user',
          method: details.method,
          status: 'failed',
          error: emailErr.message,
          clientIp: details.ip,
          userAgent: String(userAgent).slice(0, 200),
        });
      } catch {}

      return res.json({
        success: false,
        message: `Email sending skipped: ${emailErr.message}. Ensure EMAIL_USER and EMAIL_PASS are set in .env.`,
      });
    }
  } catch (err) {
    console.error('❌ Error in /api/auth/notify-login:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Query recent email logs to verify live deliveries
app.get(['/api/auth/email-logs', '/auth/email-logs'], async (req, res) => {
  try {
    const logs = await EmailLog.find().sort({ createdAt: -1 }).limit(25);
    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
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
    const map = new Map();
    SEED_CROPS.forEach(c => map.set(c.id, c));
    crops.forEach(c => {
      const plain = c.toObject ? c.toObject() : c;
      map.set(plain.id || String(plain._id), plain);
    });
    res.json(Array.from(map.values()));
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
    const cropData = { ...req.body };
    if (!cropData.id) cropData.id = `crp_${Date.now()}`;
    if (!cropData.status) cropData.status = 'active';

    if (mongoose.connection.readyState === 1) {
      // Auto-verify active farmers so their crop listings publish immediately without artificial blocking
      if (cropData.farmerId) {
        await User.updateOne(
          { $or: [{ id: cropData.farmerId }, { email: cropData.farmerId }] },
          { $set: { isVerified: true, status: 'active' } }
        );
      }
      const newCrop = await Crop.findOneAndUpdate(
        { id: cropData.id },
        { $set: cropData },
        { upsert: true, returnDocument: 'after' }
      );
      console.log(`🌾 New crop published to MongoDB Atlas: "${newCrop.name}" by ${newCrop.farmerName || 'Farmer'} [ID: ${newCrop.id}]`);
      return res.status(201).json(newCrop);
    }
    res.status(201).json(cropData);
  } catch (err) {
    console.error('❌ Error saving crop to MongoDB:', err.message);
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/crops/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const updated = await Crop.findOneAndUpdate(
        { $or: [{ id: req.params.id }, { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : undefined }].filter(Boolean) },
        { $set: req.body },
        { returnDocument: 'after' }
      );
      if (updated) return res.json(updated);
    }
    res.json({ id: req.params.id, ...req.body });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/crops/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await Crop.findOneAndDelete({
        $or: [{ id: req.params.id }, { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : undefined }].filter(Boolean)
      });
      return res.json({ success: true, message: 'Crop deleted' });
    }
    res.json({ success: true, message: 'Crop deleted (offline)' });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

    const { generateInvoicePdf } = await import('./services/pdfService.js');
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

// DELETE user route for account deletion & admin management
app.delete('/api/users/:id', async (req, res) => {
  try {
    const rawTarget = decodeURIComponent(req.params.id).trim();
    if (mongoose.connection.readyState === 1) {
      const orConditions = [
        { id: rawTarget },
        { email: rawTarget.toLowerCase() },
        { email: new RegExp(`^${rawTarget}$`, 'i') },
      ];
      if (mongoose.Types.ObjectId.isValid(rawTarget)) {
        orConditions.push({ _id: rawTarget });
      }
      const result = await User.deleteMany({ $or: orConditions });
      console.log(`🗑️ User deleted from MongoDB Atlas: "${rawTarget}" (${result.deletedCount} removed)`);
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
