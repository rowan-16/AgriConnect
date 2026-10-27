export type UserRole = 'farmer' | 'buyer' | 'admin';

export interface StructuredAddress {
  houseNumber?: string;
  street: string;
  locality?: string;
  villageOrCity: string;
  taluk?: string;
  district: string;
  state: string;
  stateCode?: string;
  postalCode: string;
  country: string;
}

export type FarmerEvidenceCategory =
  | 'land_record' // 7-12 Extract, Patta/Chitta, Title Deed
  | 'lease_agreement' // Tenant Cultivation Agreement, Authorized cultivator
  | 'farmer_id' // PM-KISAN ID, State Farmer ID, Soil Health Card
  | 'other_supporting';

export interface FarmerVerificationDocuments {
  documentType?: FarmerEvidenceCategory;
  documentName?: string;
  documentUrl?: string;
  landDocumentImage?: string;
  landImage?: string;
  applicationRef?: string;
  submittedAt?: string;
  status: 'unsubmitted' | 'pending' | 'approved' | 'rejected' | 'needs_evidence';
  rejectionReason?: string;
  adminNotes?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatar: string;
  location: string;
  // Farmer specific
  farmName?: string;
  farmLocation?: string;
  farmSizeAcres?: number;
  cropsGrown?: string[];
  farmerRating?: number;
  isVerified?: boolean;
  applicationRef?: string;
  verificationDocuments?: FarmerVerificationDocuments;
  residentialAddress?: StructuredAddress;
  farmAddress?: StructuredAddress;
  // Buyer specific
  businessName?: string;
  tradeName?: string;
  buyerType?: 'retail' | 'commercial' | 'Wholesale Distributor' | 'Retailer' | 'Consumer' | 'Restaurant / Food Service' | 'Exporter' | string;
  buyerCategory?: string;
  businessType?: string;
  buyerGstin?: string;
  procurementCategories?: string[];
  estimatedVolume?: string;
  businessAddress?: StructuredAddress;
  defaultDeliveryAddress?: StructuredAddress;
  defaultBillingAddress?: StructuredAddress;
  savedAddresses?: {
    id: string;
    label: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    isDefault?: boolean;
    structured?: StructuredAddress;
  }[];
  // Admin / General
  preferredLanguage?: 'en' | 'ta' | 'hi' | 'te' | 'ml' | 'kn';
  status: 'active' | 'pending' | 'suspended';
  createdAt: string;
}

export type CropCategory = 
  | 'Grains & Cereals'
  | 'Fresh Vegetables'
  | 'Seasonal Fruits'
  | 'Pulses & Legumes'
  | 'Spices & Herbs'
  | 'Organic Produce'
  | 'Cash Crops'
  | 'Oilseeds';

export interface Crop {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerLocation: string;
  farmerRating: number;
  farmerPhone?: string;
  name: string;
  category: CropCategory;
  description: string;
  quantity: number;
  unit: 'kg' | 'quintal' | 'ton' | 'crates' | 'boxes';
  pricePerUnit: number;
  harvestDate: string;
  farmLocation: string;
  image: string;
  status: 'active' | 'draft' | 'sold_out' | 'pending_moderation';
  organic: boolean;
  minOrder: number;
  shelfLifeDays: number;
  gradeQuality: 'Grade A Premium' | 'Grade B Standard' | 'Export Quality';
  salesVolume?: number;
  totalSold?: number;
  demandTrend?: 'High' | 'Very High' | 'Moderate' | 'Surging';
  isTopSelling?: boolean;
  salesRevenue?: number;
  orderCount?: number;
  createdAt: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';
export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'cod' | 'razorpay';

export interface TaxBreakdown {
  produceSubtotal: number;
  produceTaxableAmount: number;
  produceCgst: number;
  produceSgst: number;
  produceIgst: number;
  produceTotalTax: number;
  platformFee: number;
  platformGst: number;
  deliveryFee: number;
  deliveryGst: number;
  totalGst: number;
  grandTotal: number;
  isInterState: boolean;
  placeOfSupply: string;
}

export interface OrderItem {
  cropId: string;
  cropName: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  image: string;
  hsnCode?: string;
  gstRate?: number;
}

export interface OrderTimelineStep {
  status: OrderStatus;
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
}

export interface OrderFeedback {
  rating: number;
  qualityTag: string;
  comment: string;
  submittedAt: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  farmerId: string;
  farmerName: string;
  farmerGstin?: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: OrderItem[];
  subtotal: number;
  platformFee: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  orderDate: string;
  estimatedDelivery: string;
  trackingNumber: string;
  timeline: OrderTimelineStep[];
  notes?: string;
  feedback?: OrderFeedback;
  paymentId?: string;
  razorpayOrderId?: string;
  invoiceNumber?: string;
  taxBreakdown?: TaxBreakdown;
}

export interface CartItem {
  crop: Crop;
  quantity: number;
}

export interface Notification {
  id: string;
  recipientId: string; // 'all' | 'farmers' | 'buyers' | specific user id
  title: string;
  message: string;
  type: 'order' | 'weather' | 'ai_recommendation' | 'payment' | 'system';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface WeatherCondition {
  temp: number;
  condition: string;
  icon: string;
  humidity: number;
  rainfallMm: number;
  windSpeedKmh: number;
  uvIndex: number;
  soilMoisturePercent: number;
  feelsLike: number;
}

export interface WeatherForecastDay {
  day: string;
  date: string;
  maxTemp: number;
  minTemp: number;
  condition: string;
  icon: string;
  rainProb: number;
}

export interface WeatherAlert {
  id: string;
  severity: 'warning' | 'info' | 'critical';
  title: string;
  description: string;
  time: string;
}

export interface FarmingAdvice {
  crop: string;
  recommendation: string;
  urgency: 'high' | 'medium' | 'low';
}

export interface WeatherData {
  location: string;
  current: WeatherCondition;
  forecast: WeatherForecastDay[];
  alerts: WeatherAlert[];
  farmingAdvice: FarmingAdvice[];
}

export interface AIRecommendationRequest {
  soilType: 'Alluvial' | 'Black' | 'Red & Yellow' | 'Laterite' | 'Clayey' | 'Sandy Loam';
  location: string;
  season: 'Kharif (Monsoon)' | 'Rabi (Winter)' | 'Zaid (Summer)' | 'Year Round';
  temperatureC: number;
  rainfallMm: number;
  humidityPercent: number;
  soilPh?: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
}

export interface AIRecommendation {
  id: string;
  cropName: string;
  cropImage: string;
  suitabilityScore: number;
  expectedGrowingPeriod: string;
  expectedYield: string;
  marketDemand: 'High' | 'Very High' | 'Moderate';
  waterRequirement: 'Low' | 'Medium' | 'High';
  profitPotential: '₹45,000 - ₹75,000 / acre' | '₹60,000 - ₹95,000 / acre' | '₹80,000 - ₹1,40,000 / acre' | '₹30,000 - ₹50,000 / acre';
  reason: string;
  suggestedAction: string;
  companionCrops: string[];
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  buyerName: string;
  farmerName: string;
  amount: number;
  platformCommission: number;
  netFarmerPayout: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  payoutStatus: 'processed' | 'pending' | 'escrow';
  date: string;
  transactionRef: string;
}
