import { loadStorage, saveStorage } from './storageUtils';
import { notificationService } from './notificationService';

export interface FarmerReview {
  id: string;
  farmerId: string;
  farmerName: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar?: string;
  rating: number; // 1 to 5
  qualityTag: string;
  comment: string;
  cropName?: string;
  createdAt: string;
}

const REVIEWS_STORAGE_KEY = 'farmer_reviews';

const INITIAL_REVIEWS: FarmerReview[] = [
  {
    id: 'rev_101',
    farmerId: 'usr_farmer_1',
    farmerName: 'Ramesh Patel',
    buyerId: 'usr_buyer_1',
    buyerName: 'Priya Sharma',
    buyerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    rating: 5,
    qualityTag: 'Exceptional Freshness & Aroma',
    comment: 'Rameshji supplied 250kg of prime vine-ripened tomatoes and red onions. Packaging was spotless with moisture seals, zero damage in transit!',
    cropName: 'Organic Vine-Ripened Tomatoes',
    createdAt: '2026-10-14T11:30:00Z',
  },
  {
    id: 'rev_102',
    farmerId: 'usr_farmer_1',
    farmerName: 'Ramesh Patel',
    buyerId: 'usr_buyer_2',
    buyerName: 'Green Grocers Superstores',
    buyerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    rating: 5,
    qualityTag: 'Authentic Organic Certification',
    comment: 'Authentic organic produce directly from Nashik farm. Consistent Grade-A sorting and honest weight. Highly recommend Ramesh Patel.',
    cropName: 'Nashik Red Storage Onions',
    createdAt: '2026-10-09T14:15:00Z',
  },
  {
    id: 'rev_103',
    farmerId: 'usr_farmer_2',
    farmerName: 'Sukhwinder Singh',
    buyerId: 'usr_buyer_1',
    buyerName: 'Priya Sharma',
    buyerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    rating: 5,
    qualityTag: 'Grade-A Sorting & Moisture',
    comment: 'Best Sharbati wheat grains from Punjab soil! Gluten elasticity and kernel weight are top-notch. Fast dispatch through AgriConnect logistics.',
    cropName: 'Sharbati Royal Golden Wheat',
    createdAt: '2026-10-12T16:00:00Z',
  },
  {
    id: 'rev_104',
    farmerId: 'usr_farmer_2',
    farmerName: 'Sukhwinder Singh',
    buyerId: 'usr_buyer_3',
    buyerName: 'Apex Food Processing Ltd',
    buyerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    rating: 4,
    qualityTag: 'Punctual Delivery Fulfillment',
    comment: '120 quintals of Pusa 1121 Basmati arrived within scheduled delivery window. Extra-long slender grains and pristine aroma.',
    cropName: 'Traditional 1121 XXL Basmati Rice',
    createdAt: '2026-10-04T09:45:00Z',
  },
  {
    id: 'rev_105',
    farmerId: 'usr_farmer_3',
    farmerName: 'Lakshmi Narayana',
    buyerId: 'usr_buyer_1',
    buyerName: 'Priya Sharma',
    buyerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    rating: 5,
    qualityTag: 'Exceptional Freshness & Aroma',
    comment: 'Lakshmiji produces the purest Guntur S4 red chillies. The ASTA color rating and heat level are exactly as advertised.',
    cropName: 'Guntur S4 Hot Red Chilli',
    createdAt: '2026-09-28T18:20:00Z',
  }
];

export const reviewService = {
  getAllReviews(): FarmerReview[] {
    return loadStorage<FarmerReview[]>(REVIEWS_STORAGE_KEY, INITIAL_REVIEWS);
  },

  getReviewsForFarmer(farmerId: string): FarmerReview[] {
    const all = this.getAllReviews();
    return all.filter(r => r.farmerId === farmerId || r.farmerId === farmerId.replace('usr_farmer_', 'usr_farmer_ramesh') || r.farmerName.toLowerCase().includes(farmerId.toLowerCase()));
  },

  getReviewsByFarmerName(farmerName: string): FarmerReview[] {
    const all = this.getAllReviews();
    return all.filter(r => r.farmerName.toLowerCase().trim() === farmerName.toLowerCase().trim());
  },

  addReview(reviewData: Omit<FarmerReview, 'id' | 'createdAt'>): FarmerReview {
    const reviews = this.getAllReviews();
    const newReview: FarmerReview = {
      ...reviewData,
      id: `rev_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [newReview, ...reviews];
    saveStorage(REVIEWS_STORAGE_KEY, updated);

    // Notify farmer about the new customer review
    notificationService.sendNotification({
      recipientId: reviewData.farmerId,
      title: `New Customer Review ⭐ (${reviewData.rating}/5)`,
      message: `${reviewData.buyerName} submitted a ${reviewData.rating}-star review: "${reviewData.comment}"`,
      type: 'order',
      actionUrl: '/farmer/profile',
    });

    return newReview;
  },

  getFarmerStats(farmerId: string, fallbackRating = 4.9): { averageRating: number; totalReviews: number } {
    const reviews = this.getReviewsForFarmer(farmerId);
    if (reviews.length === 0) {
      return { averageRating: fallbackRating, totalReviews: 0 };
    }
    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    const averageRating = Number((sum / reviews.length).toFixed(1));
    return { averageRating, totalReviews: reviews.length };
  }
};
