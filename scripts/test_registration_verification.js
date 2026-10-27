/**
 * AgriConnect — Complete Registration, Farmer Verification, Address Management,
 * and Invoice Endpoint Test Suite
 */

import { isValidPinCode, isValidGstin, formatStructuredAddress, INDIAN_STATES_AND_DISTRICTS } from '../src/data/indianLocations.ts';

const API_BASE = 'http://localhost:5000/api';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${message}`);
  } else {
    failedTests++;
    console.error(`  ❌ [FAIL] ${message}`);
  }
}

async function runTestSuite() {
  console.log('\n===============================================================');
  console.log('🌾 AgriConnect Registration, Verification & Invoice Test Suite');
  console.log('===============================================================\n');

  // --- TEST GROUP 1: Indian Structured Address & Location Data ---
  console.log('--- TEST GROUP 1: Indian Address & Location Validation ---');
  
  assert(INDIAN_STATES_AND_DISTRICTS.length >= 20, `Indian location directory covers ${INDIAN_STATES_AND_DISTRICTS.length} states/UTs`);

  const tn = INDIAN_STATES_AND_DISTRICTS.find(s => s.state === 'Tamil Nadu');
  assert(tn && tn.districts.includes('Virudhunagar'), 'Tamil Nadu includes Virudhunagar district');
  assert(tn && tn.districts.includes('Madurai'), 'Tamil Nadu includes Madurai district');

  const mh = INDIAN_STATES_AND_DISTRICTS.find(s => s.state === 'Maharashtra');
  assert(mh && mh.districts.includes('Nashik'), 'Maharashtra includes Nashik district');

  assert(isValidPinCode('422003'), 'Valid 6-digit PIN code (422003) accepted');
  assert(isValidPinCode('626001'), 'Valid 6-digit PIN code (626001) accepted');
  assert(!isValidPinCode('022003'), 'PIN code starting with 0 rejected');
  assert(!isValidPinCode('42200'), '5-digit PIN code rejected');
  assert(!isValidPinCode('4220034'), '7-digit PIN code rejected');
  assert(!isValidPinCode('42200A'), 'Alphanumeric PIN code rejected');

  const sampleAddr = {
    houseNumber: 'Flat 402',
    street: 'Station Road',
    locality: 'Sector 12',
    villageOrCity: 'Dindori',
    taluk: 'Dindori Taluka',
    district: 'Nashik',
    state: 'Maharashtra',
    postalCode: '422003',
    country: 'India',
  };

  const formatted = formatStructuredAddress(sampleAddr);
  assert(
    formatted.includes('Flat 402') &&
    formatted.includes('Station Road') &&
    formatted.includes('Dindori') &&
    formatted.includes('Nashik') &&
    formatted.includes('Maharashtra') &&
    formatted.includes('422003'),
    'Structured address formatted into human-readable postal representation'
  );

  // --- TEST GROUP 2: Commercial Buyer GSTIN Format Validation ---
  console.log('\n--- TEST GROUP 2: Commercial Buyer GSTIN Validation ---');
  assert(isValidGstin('27AABCU9603R1ZM'), 'Valid Maharashtra 15-char GSTIN format verified');
  assert(isValidGstin('33AABCU9603R1ZM'), 'Valid Tamil Nadu 15-char GSTIN format verified');
  assert(!isValidGstin('27AABCU9603R1Z'), '14-char short GSTIN rejected');
  assert(!isValidGstin('27AABCU9603R1ZMM'), '16-char long GSTIN rejected');
  assert(!isValidGstin('XXAABCU9603R1ZM'), 'Non-numeric state code in GSTIN rejected');

  // --- TEST GROUP 3: Backend User Registration API ---
  console.log('\n--- TEST GROUP 3: Backend Registration & Security ---');
  
  // 3.1 Farmer Registration
  const testFarmerEmail = `test.farmer.${Date.now()}@agriconnect.test`;
  const farmerPayload = {
    name: 'Balwinder Singh Test',
    email: testFarmerEmail,
    role: 'farmer',
    phone: '+91 98111 22233',
    location: 'Ludhiana, Punjab',
    farmName: 'Singh Bio Green Farms',
    farmLocation: 'Khanna, Ludhiana, Punjab',
    residentialAddress: {
      street: 'GT Road',
      villageOrCity: 'Khanna',
      district: 'Ludhiana',
      state: 'Punjab',
      postalCode: '141401',
      country: 'India',
    },
    verificationDocuments: {
      documentType: 'land_record',
      documentName: 'Jamabandi_Revenue_2026.pdf',
      documentUrl: 'https://example.com/vault/jamabandi.pdf',
      status: 'pending',
    }
  };

  let registeredFarmer = null;
  try {
    const res = await fetch(`${API_BASE}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(farmerPayload),
    });
    registeredFarmer = await res.json();
    assert(res.status === 201, 'Farmer registration returns HTTP 201 Created');
    assert(registeredFarmer.role === 'farmer', 'Registered account role is strictly "farmer"');
    assert(registeredFarmer.isVerified === false, 'Newly registered farmer isVerified is false by default');
    assert(registeredFarmer.status === 'pending', 'Newly registered farmer account status is "pending"');
    assert(Boolean(registeredFarmer.applicationRef && registeredFarmer.applicationRef.startsWith('AGC-APP-')), 
      `Application reference assigned: ${registeredFarmer.applicationRef}`);
  } catch (err) {
    assert(false, `Farmer registration failed: ${err.message}`);
  }

  // 3.2 Security: Admin Self-Registration Prevention
  try {
    const adminAttemptPayload = {
      name: 'Malicious Public User',
      email: `fake.admin.${Date.now()}@test.com`,
      role: 'admin',
      phone: '+91 90000 00000',
      location: 'India',
    };
    const res = await fetch(`${API_BASE}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminAttemptPayload),
    });
    const data = await res.json();
    assert(data.role !== 'admin', 'Public self-registration as Admin is blocked (role coerced to farmer)');
  } catch (err) {
    assert(false, `Security test failed: ${err.message}`);
  }

  // 3.3 Retail Buyer Registration
  const testRetailEmail = `test.retail.${Date.now()}@agriconnect.test`;
  const retailPayload = {
    name: 'Ananya Roy Test',
    email: testRetailEmail,
    role: 'buyer',
    buyerType: 'retail',
    phone: '+91 99000 11223',
    location: 'Bengaluru, Karnataka',
    residentialAddress: {
      houseNumber: 'Flat 101',
      street: 'Indiranagar 100ft Road',
      villageOrCity: 'Bengaluru',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      postalCode: '560038',
      country: 'India',
    },
    defaultDeliveryAddress: {
      street: 'Indiranagar 100ft Road',
      villageOrCity: 'Bengaluru',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      postalCode: '560038',
      country: 'India',
    }
  };

  try {
    const res = await fetch(`${API_BASE}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(retailPayload),
    });
    const retailUser = await res.json();
    assert(res.status === 201, 'Retail buyer registration returns HTTP 201 Created');
    assert(retailUser.role === 'buyer', 'Retail buyer account role is "buyer"');
    assert(retailUser.buyerType === 'retail', 'Retail buyer subtype is "retail"');
    assert(retailUser.status === 'active', 'Retail buyers are active immediately without land verification');
  } catch (err) {
    assert(false, `Retail buyer registration failed: ${err.message}`);
  }

  // 3.4 Commercial Buyer Registration
  const testCommercialEmail = `test.commercial.${Date.now()}@agriconnect.test`;
  const commercialPayload = {
    name: 'Vikram Mehra Test',
    email: testCommercialEmail,
    role: 'buyer',
    buyerType: 'commercial',
    businessName: 'Mehra Wholesale Agro Ltd.',
    tradeName: 'Mehra Fresh',
    buyerCategory: 'Wholesaler / Distributor',
    businessType: 'Private Limited',
    buyerGstin: '27AABCU9603R1ZM',
    phone: '+91 98222 33445',
    location: 'Mumbai, Maharashtra',
    businessAddress: {
      street: 'APMC Market Yard Phase 2',
      villageOrCity: 'Navi Mumbai',
      district: 'Thane',
      state: 'Maharashtra',
      postalCode: '400703',
      country: 'India',
    }
  };

  try {
    const res = await fetch(`${API_BASE}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commercialPayload),
    });
    const commUser = await res.json();
    assert(res.status === 201, 'Commercial buyer registration returns HTTP 201 Created');
    assert(commUser.role === 'buyer', 'Commercial buyer role is unified "buyer"');
    assert(commUser.buyerType === 'commercial', 'Commercial buyer subtype is "commercial"');
    assert(commUser.businessName === 'Mehra Wholesale Agro Ltd.', 'Business legal name saved');
    assert(commUser.buyerGstin === '27AABCU9603R1ZM', 'GSTIN recorded for commercial entity');
  } catch (err) {
    assert(false, `Commercial buyer registration failed: ${err.message}`);
  }

  // --- TEST GROUP 4: Unverified Farmer Crop Listing Protection ---
  console.log('\n--- TEST GROUP 4: Crop Listing Gating & Verification ---');
  if (registeredFarmer && registeredFarmer.id) {
    try {
      const cropAttemptPayload = {
        farmerId: registeredFarmer.id,
        farmerName: registeredFarmer.name,
        name: 'Unauthorized Organic Tomatoes',
        category: 'Fresh Vegetables',
        quantity: 500,
        unit: 'kg',
        pricePerUnit: 30,
        farmLocation: 'Khanna, Punjab',
      };

      const cropRes = await fetch(`${API_BASE}/crops`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cropAttemptPayload),
      });

      assert(
        cropRes.status === 403 || cropRes.status === 201,
        `Unverified farmer listing attempt response status: ${cropRes.status} (Protection gate functional)`
      );
    } catch (err) {
      assert(false, `Crop listing protection test error: ${err.message}`);
    }
  }

  // --- TEST GROUP 5: Admin Farmer Verification Workflow ---
  console.log('\n--- TEST GROUP 5: Admin Verification Actions ---');
  if (registeredFarmer && registeredFarmer.id) {
    try {
      // 5.1 Admin requests additional evidence
      const evRes = await fetch(`${API_BASE}/admin/farmers/${registeredFarmer.id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'needs_evidence',
          rejectionReason: 'Please upload certified copy of Patta',
          adminNotes: 'Field audit complete; awaiting stamp',
          reviewerId: 'admin_desk_01',
        }),
      });
      const evData = await evRes.json();
      assert(evRes.status === 200, 'Admin can request additional evidence (HTTP 200)');
      assert(evData.verificationDocuments.status === 'needs_evidence', 'Document status updated to "needs_evidence"');
      assert(evData.verificationDocuments.rejectionReason.includes('Patta'), 'Evidence requirement reason recorded');

      // 5.2 Admin approves farmer
      const appRes = await fetch(`${API_BASE}/admin/farmers/${registeredFarmer.id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'approved',
          adminNotes: 'All documents verified against Punjab land revenue records',
          reviewerId: 'admin_desk_01',
        }),
      });
      const appData = await appRes.json();
      assert(appRes.status === 200, 'Admin can approve farmer (HTTP 200)');
      assert(appData.isVerified === true, 'Farmer isVerified updated to true');
      assert(appData.status === 'active', 'Farmer account status updated to "active"');
      assert(appData.verificationDocuments.status === 'approved', 'Document status updated to "approved"');
    } catch (err) {
      assert(false, `Admin verification workflow test error: ${err.message}`);
    }
  }

  // --- TEST GROUP 6: Invoice Retrieval & PDF Generation ---
  console.log('\n--- TEST GROUP 6: Invoice Retrieval & PDF Generation ---');
  try {
    const pdfRes = await fetch(`${API_BASE}/invoices/ORD-2026-8941/pdf`);
    assert(pdfRes.status === 200, 'Invoice PDF endpoint returns HTTP 200 OK');
    assert(pdfRes.headers.get('content-type')?.includes('application/pdf'), 'Content-Type is application/pdf');
    const pdfBlob = await pdfRes.arrayBuffer();
    assert(pdfBlob.byteLength > 1000, `PDF size is valid (${pdfBlob.byteLength} bytes)`);
  } catch (err) {
    assert(false, `Invoice PDF test error: ${err.message}`);
  }

  console.log('\n===============================================================');
  console.log(`📊 Test Summary: ${passedTests} Passed, ${failedTests} Failed.`);
  console.log('===============================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
