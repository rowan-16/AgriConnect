import { authService } from '../src/services/authService.js';

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

async function testJowanFlow() {
  console.log('--- STEP 1: Jowan M logs in as Farmer ---');
  const loginFarmer = await authService.login('jowanm1234@gmail.com', 'password123', true, 'farmer');
  console.log('Farmer Login Result:', {
    success: loginFarmer.success,
    role: loginFarmer.user?.role,
    name: loginFarmer.user?.name,
    farmName: loginFarmer.user?.farmName,
  });

  if (loginFarmer.user?.role !== 'farmer') {
    throw new Error('Expected role to be farmer on initial farmer login');
  }

  console.log('\n--- STEP 2: Jowan M deletes his profile ---');
  const deleteRes = await authService.deleteAccount(loginFarmer.user.id, loginFarmer.user.email);
  console.log('Delete Account Result:', deleteRes);

  const currentUserAfterDelete = authService.getCurrentUser();
  console.log('Current user in session after delete:', currentUserAfterDelete);
  if (currentUserAfterDelete !== null) {
    throw new Error('Current user should be null after account deletion');
  }

  // Verify deleted blacklist
  const deletedList = JSON.parse(localStorage.getItem('agriconnect_deleted_users') || '[]');
  console.log('agriconnect_deleted_users:', deletedList);
  if (!deletedList.includes('jowanm1234@gmail.com')) {
    throw new Error('Expected jowanm1234@gmail.com to be recorded in deleted users list');
  }

  // Verify getUsers() does NOT resurrect Jowan
  const usersAfterDelete = authService.getUsers();
  const jowanResurrected = usersAfterDelete.find(u => u.email.toLowerCase() === 'jowanm1234@gmail.com');
  console.log('Jowan resurrected in getUsers()?:', jowanResurrected ? 'YES (BAD)' : 'NO (GOOD)');
  if (jowanResurrected) {
    throw new Error('Jowan was resurrected by getUsers()!');
  }

  console.log('\n--- STEP 3: Jowan M logs in as Commercial Buyer ---');
  const loginBuyer = await authService.login('jowanm1234@gmail.com', 'password123', true, 'buyer');
  console.log('Buyer Login Result:', {
    success: loginBuyer.success,
    role: loginBuyer.user?.role,
    name: loginBuyer.user?.name,
    businessName: loginBuyer.user?.businessName,
    buyerType: loginBuyer.user?.buyerType,
  });

  if (loginBuyer.user?.role !== 'buyer') {
    throw new Error(`Expected role to be buyer, but got: ${loginBuyer.user?.role}`);
  }

  console.log('\n--- STEP 4: Google OAuth test as Buyer ---');
  const googleBuyer = authService.loginWithGoogle('buyer', {
    name: 'Jowan M',
    email: 'jowanm1234@gmail.com',
  }, true);
  console.log('Google Buyer Login Result:', {
    success: googleBuyer.success,
    role: googleBuyer.user?.role,
    name: googleBuyer.user?.name,
    businessName: googleBuyer.user?.businessName,
  });

  if (googleBuyer.user?.role !== 'buyer') {
    throw new Error(`Expected role from Google to be buyer, but got: ${googleBuyer.user?.role}`);
  }

  console.log('\n✅ ALL VERIFICATION CHECKS PASSED PERFECTLY!');
  process.exit(0);
}

testJowanFlow().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
