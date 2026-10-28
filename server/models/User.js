import mongoose from 'mongoose';

const structuredAddressSchema = new mongoose.Schema(
  {
    houseNumber: { type: String, default: '' },
    street: { type: String, default: '' },
    locality: { type: String, default: '' },
    villageOrCity: { type: String, default: '' },
    taluk: { type: String, default: '' },
    district: { type: String, default: '' },
    state: { type: String, default: '' },
    stateCode: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    country: { type: String, default: 'India' },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['farmer', 'buyer', 'admin'], default: 'farmer' },
    phone: { type: String, default: '+91 98765 43210' },
    avatar: { type: String, default: '' },
    location: { type: String, default: 'India' },
    preferredLanguage: { type: String, enum: ['en', 'ta', 'hi', 'te', 'ml', 'kn'], default: 'en' },
    applicationRef: { type: String, default: '' },
    
    // Structured Addresses
    residentialAddress: structuredAddressSchema,
    farmAddress: structuredAddressSchema,
    businessAddress: structuredAddressSchema,
    defaultDeliveryAddress: structuredAddressSchema,
    defaultBillingAddress: structuredAddressSchema,

    // Farmer specific
    farmName: { type: String, default: '' },
    farmLocation: { type: String, default: '' },
    farmSizeAcres: { type: Number, default: 0 },
    cropsGrown: [{ type: String }],
    farmerRating: { type: Number, default: 4.9 },
    isVerified: { type: Boolean, default: false },
    gstin: { type: String, default: '' },
    isGstRegistered: { type: Boolean, default: false },
    gstinVerification: {
      status: {
        type: String,
        enum: ['UNREGISTERED', 'PENDING_VERIFICATION', 'SYNTAX_VALID_UNVERIFIED', 'VERIFIED', 'INVALID'],
        default: 'UNREGISTERED',
      },
      verifiedAt: { type: Date },
      source: { type: String, default: 'SELF_DECLARATION' },
      legalName: { type: String, default: '' },
      tradeName: { type: String, default: '' },
      stateCode: { type: String, default: '' },
      taxpayerType: { type: String, default: 'Agriculturist' },
    },
    verificationDocuments: {
      documentType: { type: String, default: 'land_record' },
      documentName: { type: String, default: '' },
      documentUrl: { type: String, default: '' },
      landDocumentImage: { type: String, default: '' },
      landImage: { type: String, default: '' },
      applicationRef: { type: String, default: '' },
      submittedAt: { type: Date },
      status: { 
        type: String, 
        enum: ['unsubmitted', 'pending', 'approved', 'rejected', 'needs_evidence'], 
        default: 'unsubmitted' 
      },
      rejectionReason: { type: String, default: '' },
      adminNotes: { type: String, default: '' },
      reviewedAt: { type: Date },
      reviewedBy: { type: String, default: '' },
    },

    // Buyer specific
    businessName: { type: String, default: '' },
    tradeName: { type: String, default: '' },
    buyerType: { type: String, default: 'retail' },
    buyerCategory: { type: String, default: '' },
    businessType: { type: String, default: '' },
    buyerGstin: { type: String, default: '' },
    procurementCategories: [{ type: String }],
    estimatedVolume: { type: String, default: '' },
    savedAddresses: [
      {
        id: String,
        label: String,
        street: String,
        city: String,
        state: String,
        pincode: String,
        isDefault: Boolean,
        structured: structuredAddressSchema,
      }
    ],

    // Password and Reset Authentication
    password: { type: String, default: 'agri@123' },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },

    // Account Status
    status: { type: String, enum: ['active', 'pending', 'suspended'], default: 'active' },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
