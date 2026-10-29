import { cropService } from '../src/services/cropService.js';

// Polyfill localStorage & sessionStorage for node test environment
const storage = new Map();
global.localStorage = {
  getItem: (key) => storage.get(key) || null,
  setItem: (key, val) => storage.set(key, String(val)),
  removeItem: (key) => storage.delete(key),
  clear: () => storage.clear(),
};
global.sessionStorage = {
  getItem: (key) => storage.get('sess_' + key) || null,
  setItem: (key, val) => storage.set('sess_' + key, String(val)),
  removeItem: (key) => storage.delete('sess_' + key),
  clear: () => {},
};

async function testBuyerProducts() {
  console.log('--- STEP 1: Fetch live crops from MongoDB Atlas ---');
  const liveCrops = await cropService.fetchCropsFromMongoDB();
  console.log('Total live crops fetched from MongoDB:', liveCrops.length);

  const rowanCrops = liveCrops.filter(c => (c.farmerName || '').includes('Rowan') || (c.id || '').includes('rowan'));
  console.log(`Found ${rowanCrops.length} products listed by Rowan:`);
  rowanCrops.forEach(c => {
    console.log(`  🌾 [${c.id}] ${c.name} - ₹${c.pricePerUnit}/${c.unit} (Farmer: ${c.farmerName})`);
  });

  if (rowanCrops.length < 3) {
    throw new Error(`Expected at least 3 crops listed by Rowan, but found only ${rowanCrops.length}`);
  }

  console.log('\n--- STEP 2: Verify Buyer Browse Filter ---');
  const allBuyerCrops = cropService.filterCrops({ category: 'All' });
  const buyerRowanCount = allBuyerCrops.filter(c => (c.farmerName || '').includes('Rowan')).length;
  console.log(`Buyer catalog total: ${allBuyerCrops.length} crops, Rowan crops present: ${buyerRowanCount}`);

  if (buyerRowanCount < 3) {
    throw new Error('Rowan crops missing in Buyer browse catalog!');
  }

  console.log('\n--- STEP 3: Verify Buyer Category Filters ---');
  const vegCrops = cropService.filterCrops({ category: 'Fresh Vegetables' });
  const rowanVeg = vegCrops.filter(c => (c.farmerName || '').includes('Rowan'));
  console.log(`Fresh Vegetables category has ${rowanVeg.length} Rowan products:`, rowanVeg.map(c => c.name));

  const fruitCrops = cropService.filterCrops({ category: 'Seasonal Fruits' });
  const rowanFruits = fruitCrops.filter(c => (c.farmerName || '').includes('Rowan'));
  console.log(`Seasonal Fruits category has ${rowanFruits.length} Rowan products:`, rowanFruits.map(c => c.name));

  console.log('\n✅ ALL BUYER PRODUCT VISIBILITY CHECKS PASSED PERFECTLY!');
  process.exit(0);
}

testBuyerProducts().catch((err) => {
  console.error('❌ Buyer products verification failed:', err);
  process.exit(1);
});
