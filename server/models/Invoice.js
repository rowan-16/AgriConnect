import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  cropId: String,
  cropName: String,
  category: String,
  hsnCode: String,
  quantity: Number,
  unit: String,
  unitPrice: Number,
  taxableAmount: Number,
  gstRate: Number,
  cgstAmount: Number,
  sgstAmount: Number,
  igstAmount: Number,
  totalAmount: Number,
  isExempt: Boolean,
});

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    invoiceType: {
      type: String,
      enum: ['TAX_INVOICE', 'BILL_OF_SUPPLY'],
      default: 'BILL_OF_SUPPLY',
    },
    orderId: { type: String, required: true, unique: true, index: true },
    paymentId: { type: String, required: true },
    issueDate: { type: Date, default: Date.now },
    
    // Legal Supplier: Farmer
    supplier: {
      type: { type: String, enum: ['FARMER', 'MARKETPLACE'], default: 'FARMER' },
      id: String,
      name: String,
      farmName: String,
      farmLocation: String,
      state: String,
      stateCode: String,
      phone: String,
      gstin: String,
      isRegistered: { type: Boolean, default: false },
      gstinVerificationStatus: {
        type: String,
        enum: ['VERIFIED', 'SYNTAX_VALID_UNVERIFIED', 'UNREGISTERED_AGRICULTURIST'],
        default: 'UNREGISTERED_AGRICULTURIST',
      },
    },

    // Recipient: Buyer
    recipient: {
      id: String,
      name: String,
      businessName: String,
      email: String,
      phone: String,
      billingAddress: {
        street: String,
        city: String,
        state: String,
        pincode: String,
      },
      deliveryAddress: {
        street: String,
        city: String,
        state: String,
        pincode: String,
      },
      stateCode: String,
      gstin: String,
    },

    placeOfSupply: { type: String, required: true },
    isInterState: { type: Boolean, default: false },

    items: [invoiceItemSchema],

    // Platform Facilitation & Logistics
    marketplaceFee: {
      hsnSac: { type: String, default: '998311' }, // IT / E-commerce portal services
      description: { type: String, default: 'AgriConnect Marketplace Facilitation Fee' },
      taxableAmount: Number,
      gstRate: { type: Number, default: 18 },
      cgstAmount: Number,
      sgstAmount: Number,
      igstAmount: Number,
      totalAmount: Number,
    },

    logisticsFee: {
      hsnSac: { type: String, default: '996511' }, // Transport of Goods by Road
      description: { type: String, default: 'Cold Logistics Freight' },
      taxableAmount: Number,
      gstRate: { type: Number, default: 0 }, // 0% for unprocessed agricultural produce transport
      cgstAmount: Number,
      sgstAmount: Number,
      igstAmount: Number,
      totalAmount: Number,
    },

    summary: {
      totalTaxableValue: Number,
      totalCgst: Number,
      totalSgst: Number,
      totalIgst: Number,
      totalTax: Number,
      grandTotal: Number,
      amountInWords: String,
    },

    immutableSnapshotHash: { type: String, required: true },
    status: { type: String, enum: ['issued', 'cancelled', 'refunded'], default: 'issued' },
    pdfGeneratedAt: { type: Date },
  },
  { timestamps: true }
);

export const Invoice = mongoose.model('Invoice', invoiceSchema);
