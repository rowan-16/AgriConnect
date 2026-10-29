import { Crop, CropCategory } from '../types';
import { INITIAL_CROPS } from './mockData';
import { loadStorage, saveStorage } from './storageUtils';
import { API_BASE_URL } from './apiConfig';

const CROPS_KEY = 'crops';

export const cropService = {
  getAllCrops(): Crop[] {
    return loadStorage<Crop[]>(CROPS_KEY, INITIAL_CROPS);
  },

  async fetchCropsFromMongoDB(): Promise<Crop[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/crops`);
      if (res.ok) {
        const mongoCrops = await res.json();
        if (Array.isArray(mongoCrops) && mongoCrops.length > 0) {
          const local = this.getAllCrops();
          const map = new Map<string, Crop>();
          local.forEach(c => map.set(c.id, c));
          mongoCrops.forEach((c: Crop) => map.set(c.id, c));
          const merged = Array.from(map.values());
          saveStorage(CROPS_KEY, merged);
          return merged;
        }
      }
    } catch {
      // Graceful offline fallback
    }
    return this.getAllCrops();
  },

  getActiveCrops(): Crop[] {
    return this.getAllCrops().filter(c => c.status === 'active');
  },

  getCropById(id: string): Crop | undefined {
    return this.getAllCrops().find(c => c.id === id);
  },

  getTopSellingCrops(): Crop[] {
    const crops = this.getActiveCrops();
    const top = crops.filter(c => c.isTopSelling);
    return (top.length > 0 ? top : crops).sort((a, b) => (b.salesRevenue || 0) - (a.salesRevenue || 0));
  },

  getCropsByFarmer(farmerId: string): Crop[] {
    return this.getAllCrops().filter(c => c.farmerId === farmerId);
  },

  addCrop(cropData: Omit<Crop, 'id' | 'createdAt'>): Crop {
    const crops = this.getAllCrops();
    const newCrop: Crop = {
      ...cropData,
      id: `crp_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [newCrop, ...crops];
    saveStorage(CROPS_KEY, updated);

    // Sync directly to MongoDB Atlas
    fetch(`${API_BASE_URL}/crops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCrop),
    }).catch(err => console.warn('MongoDB crop add sync note:', err));

    return newCrop;
  },

  updateCrop(id: string, updates: Partial<Crop>): Crop | null {
    const crops = this.getAllCrops();
    const index = crops.findIndex(c => c.id === id);
    if (index === -1) return null;

    const updatedCrop = { ...crops[index], ...updates };
    crops[index] = updatedCrop;
    saveStorage(CROPS_KEY, crops);

    // Sync updates to MongoDB Atlas
    fetch(`${API_BASE_URL}/crops/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(err => console.warn('MongoDB crop update sync note:', err));

    return updatedCrop;
  },

  deleteCrop(id: string): boolean {
    const crops = this.getAllCrops();
    const filtered = crops.filter(c => c.id !== id);
    if (filtered.length === crops.length) return false;
    saveStorage(CROPS_KEY, filtered);

    // Sync deletion to MongoDB Atlas
    fetch(`${API_BASE_URL}/crops/${id}`, {
      method: 'DELETE',
    }).catch(err => console.warn('MongoDB crop delete sync note:', err));

    return true;
  },

  filterCrops(params: {
    category?: CropCategory | 'All';
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    organicOnly?: boolean;
    sortBy?: 'featured' | 'price_low' | 'price_high' | 'rating' | 'newest';
  }): Crop[] {
    let list = this.getActiveCrops();

    if (params.category && params.category !== 'All') {
      list = list.filter(c => c.category === params.category);
    }

    if (params.search && params.search.trim() !== '') {
      const term = params.search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.farmerName.toLowerCase().includes(term) ||
        c.farmLocation.toLowerCase().includes(term) ||
        c.category.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term)
      );
    }

    if (params.minPrice !== undefined) {
      list = list.filter(c => c.pricePerUnit >= (params.minPrice || 0));
    }

    if (params.maxPrice !== undefined && params.maxPrice > 0) {
      list = list.filter(c => c.pricePerUnit <= (params.maxPrice || Infinity));
    }

    if (params.organicOnly) {
      list = list.filter(c => c.organic);
    }

    if (params.sortBy) {
      switch (params.sortBy) {
        case 'price_low':
          list.sort((a, b) => a.pricePerUnit - b.pricePerUnit);
          break;
        case 'price_high':
          list.sort((a, b) => b.pricePerUnit - a.pricePerUnit);
          break;
        case 'rating':
          list.sort((a, b) => b.farmerRating - a.farmerRating);
          break;
        case 'newest':
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        default:
          break;
      }
    }

    return list;
  }
};
