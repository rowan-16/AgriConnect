import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const ATLAS_URI = 'mongodb+srv://jowanm1234_db_user:eHatIAxq1TnHziZj@cluster0.p3m41it.mongodb.net/agriconnect?retryWrites=true&w=majority&appName=Cluster0';

const rowanCrops = [
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
  },
];

async function run() {
  const uri = process.env.MONGODB_URI || ATLAS_URI;
  console.log('Connecting to Atlas...');
  await mongoose.connect(uri);

  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Crop = mongoose.model('Crop', new mongoose.Schema({}, { strict: false }));

  // 1. Ensure Rowan farmer profile exists and is active & verified
  await User.findOneAndUpdate(
    { email: 'rocklandrowanm@gmail.com' },
    {
      $set: {
        id: 'usr_farmer_rowan',
        name: 'Rockland Rowan M',
        email: 'rocklandrowanm@gmail.com',
        role: 'farmer',
        farmName: 'Rowan Organic Agro Tech',
        farmLocation: 'Pollachi Main Road, Coimbatore',
        farmSizeAcres: 24.5,
        cropsGrown: ['Organic Bell Peppers', 'Hydroponic Butterhead Lettuce', 'Bhagwa Organic Pomegranates'],
        farmerRating: 5.0,
        isVerified: true,
        status: 'active',
      },
    },
    { upsert: true, returnDocument: 'after' }
  );
  console.log('✅ Rowan farmer profile verified in Atlas');

  // 2. Ensure Rowan crops exist in Crop collection
  for (const crop of rowanCrops) {
    await Crop.findOneAndUpdate(
      { id: crop.id },
      { $set: crop },
      { upsert: true, returnDocument: 'after' }
    );
    console.log(`✅ Upserted Rowan crop: ${crop.name} (${crop.id})`);
  }

  const allCrops = await Crop.find({});
  console.log(`\n🎉 Total crops currently in Atlas: ${allCrops.length}`);
  const rowanFound = allCrops.filter(c => (c.farmerName || '').includes('Rowan') || (c.id || '').includes('rowan'));
  console.log(`🌾 Rowan crops in Atlas (${rowanFound.length}):`);
  rowanFound.forEach(c => console.log(`   - [${c.id}] ${c.name} (₹${c.pricePerUnit}/${c.unit})`));

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
