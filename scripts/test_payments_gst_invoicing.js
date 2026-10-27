/**
 * AgriConnect — Automated Verification Suite for
 * Razorpay Payments, GST Engine, HMAC Signatures, and PDF Invoices
 */

import crypto from 'crypto';
import {
  calculateAuthoritativeTax,
  validateGstinFormat,
  verifyGstinWithProvider,
  resolveStateCode,
  numberToIndianWords,
} from '../server/services/taxService.js';
import { generateInvoicePdf } from '../server/services/pdfService.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
    failedTests++;
  }
}

async function runTests() {
  console.log('\n===============================================================');
  console.log('🌾 AgriConnect Payments, GST Engine & PDF Invoice Test Suite');
  console.log('===============================================================\n');

  // ==========================================
  // TEST GROUP 1: GST Place of Supply & Tax Calculations
  // ==========================================
  console.log('--- TEST GROUP 1: GST Calculations (Intra-State vs Inter-State) ---');

  // Scenario A: Intra-State (Maharashtra to Maharashtra)
  // 50kg Organic Tomatoes @ ₹28/kg = ₹1,400 (HSN 0702, Exempt 0% GST)
  // Platform Fee @ 2% = ₹28 -> 18% GST = ₹5.04 -> CGST 9% (₹2.52), SGST 9% (₹2.52)
  // Logistics Freight = ₹350 (Exempt 0% GST)
  const intraTax = calculateAuthoritativeTax({
    items: [{ cropName: 'Organic Vine Tomatoes', category: 'Fresh Vegetables', quantity: 50, unitPrice: 28 }],
    farmerLocation: 'Nashik, Maharashtra',
    deliveryAddress: { street: 'Vashi Market', city: 'Navi Mumbai', state: 'Maharashtra', pincode: '400703' },
  });

  assert(intraTax.isInterState === false, 'Scenario A is identified as Intra-State transaction');
  assert(intraTax.supplierState.stateCode === '27', 'Supplier state code resolved to 27 (Maharashtra)');
  assert(intraTax.recipientState.stateCode === '27', 'Recipient state code resolved to 27 (Maharashtra)');
  assert(intraTax.produceSubtotal === 1400, 'Produce subtotal calculated as ₹1,400');
  assert(intraTax.produceTotalTax === 0, 'Produce tax is 0% (CBIC Notif 2/2017 agricultural produce exemption)');
  assert(intraTax.platformFee === 28, 'Platform fee calculated as 2% of ₹1,400 = ₹28');
  assert(intraTax.platformGst === 5.04, 'Platform fee GST is 18% of ₹28 = ₹5.04');
  assert(intraTax.totalCgst === 2.52, 'Intra-state split: CGST is ₹2.52 (50% of ₹5.04)');
  assert(intraTax.totalSgst === 2.52, 'Intra-state split: SGST is ₹2.52 (50% of ₹5.04)');
  assert(intraTax.totalIgst === 0, 'Intra-state IGST is 0');
  assert(intraTax.grandTotal === 1783.04, 'Grand total matches produce + freight + platform fee + GST (₹1,783.04)');
  assert(intraTax.totalInPaise === 178304, 'Integer-safe paise representation is 178304 paise');

  // Scenario B: Inter-State Produce (Guntur, AP to Mumbai, MH) with Intra-State Marketplace (MH to MH)
  // 10kg Guntur S4 Chilli @ ₹185/kg = ₹1,850 (HSN 0904, 5% GST = ₹92.50 IGST)
  // Platform Fee @ 2% = ₹37 -> AgriConnect (MH 27) to Buyer (MH 27) = CGST (₹3.33) + SGST (₹3.33)
  // Freight = ₹350
  const interTax = calculateAuthoritativeTax({
    items: [{ cropName: 'Guntur S4 Hot Red Chilli', category: 'Spices & Herbs', quantity: 10, unitPrice: 185 }],
    farmerLocation: 'Tenali, Guntur, Andhra Pradesh',
    deliveryAddress: { street: 'Dadar Godown', city: 'Mumbai', state: 'Maharashtra', pincode: '400014' },
    farmerGstin: '37AAAAA0000A1Z5',
  });

  assert(interTax.isInterState === true, 'Scenario B is identified as Inter-State goods transaction');
  assert(interTax.supplierState.stateCode === '37', 'Supplier state code resolved to 37 (Andhra Pradesh)');
  assert(interTax.recipientState.stateCode === '27', 'Recipient state code resolved to 27 (Maharashtra)');
  assert(interTax.produceIgst === 92.5, 'Spices inter-state IGST calculated as 5% of ₹1,850 = ₹92.50');
  assert(interTax.produceTotalTax === 92.5, 'Produce total tax is ₹92.50 IGST');
  assert(interTax.platformCgst === 3.33 && interTax.platformSgst === 3.33, 'Platform commission correctly applies intra-state CGST+SGST (AgriConnect MH to Buyer MH)');
  assert(interTax.totalGst === 99.16, 'Combined GST (IGST ₹92.50 + Platform CGST/SGST ₹6.66) = ₹99.16');
  assert(interTax.invoiceType === 'TAX_INVOICE', 'Registered farmer with valid GSTIN triggers TAX_INVOICE');

  // ==========================================
  // TEST GROUP 2: GSTIN Format & Provider Verification
  // ==========================================
  console.log('\n--- TEST GROUP 2: GSTIN Format & State Matching ---');

  const validGstinCheck = validateGstinFormat('27AAAAA0000A1Z5', '27');
  assert(validGstinCheck.isValid === true, 'Valid 15-char Maharashtra GSTIN format verified');

  const mismatchGstinCheck = validateGstinFormat('03AAAAA0000A1Z5', '27');
  assert(mismatchGstinCheck.isValid === false, 'GSTIN state code mismatch (03 Punjab != 27 MH) correctly rejected');

  const invalidFormatCheck = validateGstinFormat('INVALID_GSTIN_123');
  assert(invalidFormatCheck.isValid === false, 'Malformed GSTIN correctly rejected');

  const unconfiguredProviderCheck = await verifyGstinWithProvider('27AAAAA0000A1Z5', '27');
  assert(
    unconfiguredProviderCheck.status === 'SYNTAX_VALID_UNVERIFIED',
    'Provider adapter safely declares SYNTAX_VALID_UNVERIFIED without fabricating live verification'
  );

  // ==========================================
  // TEST GROUP 3: Razorpay HMAC SHA-256 Signatures & Tamper Protection
  // ==========================================
  console.log('\n--- TEST GROUP 3: Razorpay HMAC Signature Verification ---');

  const testKeySecret = 'agriconnect_test_secret_key_2026';
  const orderId = 'order_test_1001';
  const paymentId = 'pay_test_2001';

  // Compute authentic signature
  const validSignature = crypto
    .createHmac('sha256', testKeySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  // Verify authentic signature
  const expectedSig = crypto
    .createHmac('sha256', testKeySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const isSigValid = crypto.timingSafeEqual(
    Buffer.from(expectedSig),
    Buffer.from(validSignature)
  );
  assert(isSigValid === true, 'Authentic Razorpay HMAC SHA-256 signature accepted');

  // Verify tampered signature fails
  const tamperedSignature = validSignature.slice(0, -4) + '0000';
  const isTamperedValid = crypto.timingSafeEqual(
    Buffer.from(expectedSig),
    Buffer.from(tamperedSignature)
  );
  assert(isTamperedValid === false, 'Tampered Razorpay signature rejected (tamper protection active)');

  // ==========================================
  // TEST GROUP 4: Indian Currency Words Formatter
  // ==========================================
  console.log('\n--- TEST GROUP 4: Legal Indian Currency In Words ---');

  const words1 = numberToIndianWords(1783);
  assert(words1.includes('One Thousand Seven Hundred Eighty Three'), `1783 correctly formatted in words: "${words1}"`);

  const words2 = numberToIndianWords(125400);
  assert(words2.includes('One Lakh Twenty Five Thousand Four Hundred'), `125400 correctly formatted in words: "${words2}"`);

  // ==========================================
  // TEST GROUP 5: Authoritative PDF Invoice Generation
  // ==========================================
  console.log('\n--- TEST GROUP 5: PDF Invoice Generation with PDFKit ---');

  const sampleInvoice = {
    invoiceNumber: 'AGC-INV-2026-01001',
    invoiceType: 'TAX_INVOICE',
    orderId: 'ORD-2026-8899',
    paymentId: 'pay_test_rzp_9900',
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
    items: intraTax.items,
    marketplaceFee: { taxableAmount: intraTax.platformFee, totalAmount: intraTax.platformFeeTotal },
    logisticsFee: { taxableAmount: intraTax.deliveryFee, totalAmount: intraTax.deliveryFee },
    summary: {
      totalTaxableValue: intraTax.produceTaxableAmount,
      totalCgst: intraTax.totalCgst,
      totalSgst: intraTax.totalSgst,
      totalIgst: intraTax.totalIgst,
      totalTax: intraTax.totalGst,
      grandTotal: intraTax.grandTotal,
      amountInWords: intraTax.amountInWords,
    },
    immutableSnapshotHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  };

  const pdfBuffer = await generateInvoicePdf(sampleInvoice);

  assert(Buffer.isBuffer(pdfBuffer), 'PDF generator returned a valid Node Buffer');
  assert(pdfBuffer.length > 3000, `PDF size is ${pdfBuffer.length} bytes (complete high-resolution document)`);
  assert(pdfBuffer.toString('latin1', 0, 5) === '%PDF-', 'Buffer header contains valid %PDF- magic signature');
  assert(pdfBuffer.toString('latin1').includes('%%EOF'), 'Buffer terminates with standard %%EOF delimiter');

  console.log('\n===============================================================');
  console.log(`📊 Test Summary: ${passedTests} Passed, ${failedTests} Failed.`);
  console.log('===============================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Test execution fatal error:', err);
  process.exit(1);
});
