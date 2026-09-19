import { User, UserRole } from '../types';
import { INITIAL_USERS } from './mockData';
import { loadStorage, saveStorage } from './storageUtils';

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'current_user';
const API_BASE_URL = 'http://localhost:5000/api';

export const authService = {
  getUsers(): User[] {
    return loadStorage<User[]>(USERS_KEY, INITIAL_USERS);
  },

  async fetchUsersFromMongoDB(): Promise<User[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/users`);
      if (res.ok) {
        const mongoUsers = await res.json();
        if (Array.isArray(mongoUsers) && mongoUsers.length > 0) {
          saveStorage(USERS_KEY, mongoUsers);
          return mongoUsers;
        }
      }
    } catch {
      // Server offline fallback to storage
    }
    return this.getUsers();
  },

  getCurrentUser(): User | null {
    return loadStorage<User | null>(CURRENT_USER_KEY, null);
  },

  setCurrentUser(user: User): void {
    saveStorage(CURRENT_USER_KEY, user);
  },

  login(email: string, password = ''): { success: boolean; user?: User; error?: string } {
    const users = this.getUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      if (found.status === 'suspended') {
        return { success: false, error: 'This account has been suspended by administration.' };
      }
      if (found.email.toLowerCase() === 'admin@agriconnect.com' && password && password !== 'admin@agri') {
        return { success: false, error: 'Invalid Admin password. Use password: admin@agri' };
      }
      this.setCurrentUser(found);
      return { success: true, user: found };
    }
    return { success: false, error: 'Invalid credentials. Please check email and password.' };
  },

  async register(userData: Partial<User> & { name: string; email: string; role: UserRole; phone: string; location: string }): Promise<{ success: boolean; user?: User; error?: string }> {
    const users = this.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existing) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id: `usr_${userData.role}_${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      phone: userData.phone,
      location: userData.location,
      avatar: userData.role === 'farmer'
        ? 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      farmName: userData.farmName || (userData.role === 'farmer' ? `${userData.name}'s Agro Farm` : undefined),
      farmLocation: userData.farmLocation || userData.location,
      farmSizeAcres: userData.farmSizeAcres || (userData.role === 'farmer' ? 5 : undefined),
      cropsGrown: userData.cropsGrown || (userData.role === 'farmer' ? ['Wheat', 'Vegetables'] : undefined),
      businessName: userData.businessName,
      buyerType: userData.buyerType,
      farmerRating: userData.role === 'farmer' ? 5.0 : undefined,
      isVerified: false,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      savedAddresses: userData.role === 'buyer' ? [
        {
          id: `addr_${Date.now()}`,
          label: 'Primary Address',
          street: userData.location,
          city: userData.location.split(',')[0] || userData.location,
          state: userData.location.split(',')[1]?.trim() || 'State',
          pincode: '400001',
          isDefault: true
        }
      ] : undefined
    };

    // 1. Sync to MongoDB Atlas cloud database
    try {
      await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
    } catch {
      // Local fallback
    }

    // 2. Save locally
    const updatedUsers = [newUser, ...users];
    saveStorage(USERS_KEY, updatedUsers);
    this.setCurrentUser(newUser);
    return { success: true, user: newUser };
  },

  updateProfile(userId: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) return null;

    const updated = { ...users[index], ...updates };
    users[index] = updated;
    saveStorage(USERS_KEY, users);

    // Sync to MongoDB Atlas
    fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => {});

    const currentUser = this.getCurrentUser();
    if (currentUser.id === userId) {
      this.setCurrentUser(updated);
    }
    return updated;
  },

  loginWithGoogle(role: UserRole = 'farmer', googleProfile?: { name?: string; email?: string; picture?: string }): { success: boolean; user?: User; error?: string } {
    const targetEmail = googleProfile?.email || (role === 'farmer' ? 'ramesh.farmer@agriconnect.com' : 'priya.buyer@agriconnect.com');
    const targetName = googleProfile?.name || (googleProfile?.email ? googleProfile.email.split('@')[0] : (role === 'farmer' ? 'Ramesh Patel (Google User)' : 'Priya Sharma (Google User)'));
    const targetAvatar = googleProfile?.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300';

    const users = this.getUsers();
    let found = users.find(u => u.email.toLowerCase() === targetEmail.toLowerCase());

    if (!found) {
      found = {
        id: `usr_google_${Date.now()}`,
        name: targetName,
        email: targetEmail,
        role: role,
        phone: '+91 98765 43210',
        location: 'Nashik, Maharashtra',
        avatar: targetAvatar,
        farmName: role === 'farmer' ? `${targetName}'s Agro Farm` : undefined,
        businessName: role === 'buyer' ? 'FreshnessMart Superstores' : undefined,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
      };
      saveStorage(USERS_KEY, [found, ...users]);
    } else {
      let changed = false;
      if (googleProfile?.picture && found.avatar !== googleProfile.picture) {
        found.avatar = googleProfile.picture;
        changed = true;
      }
      if (googleProfile?.name && found.name !== googleProfile.name) {
        found.name = googleProfile.name;
        changed = true;
      }
      if (changed) {
        saveStorage(USERS_KEY, users.map(u => u.id === found!.id ? found! : u));
      }
    }

    // ALWAYS sync Google user profile to MongoDB Atlas cloud database
    fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(found),
    }).catch(err => console.error('MongoDB sync error on Google login:', err));

    this.setCurrentUser(found);
    return { success: true, user: found };
  },

  submitVerificationDocuments(
    userId: string,
    docs: { landDocumentImage: string; cropApprovalDocumentImage: string; landImage: string }
  ): User | null {
    const verificationDocuments = {
      ...docs,
      submittedAt: new Date().toISOString(),
      status: 'pending' as const,
    };

    return this.updateProfile(userId, {
      verificationDocuments,
      status: 'pending',
    });
  },

  reviewFarmerVerification(
    farmerId: string,
    isApproved: boolean,
    rejectionReason?: string
  ): User | null {
    const users = this.getUsers();
    const target = users.find(u => u.id === farmerId);
    if (!target) return null;

    const currentDocs = target.verificationDocuments || {
      status: 'unsubmitted' as const,
    };

    const updatedDocs = {
      ...currentDocs,
      status: isApproved ? ('approved' as const) : ('rejected' as const),
      rejectionReason: isApproved ? undefined : rejectionReason || 'Documents rejected by Admin.',
    };

    return this.updateProfile(farmerId, {
      isVerified: isApproved,
      status: isApproved ? 'active' : 'pending',
      verificationDocuments: updatedDocs,
    });
  },

  deleteAccount(userId: string): boolean {
    const users = this.getUsers();
    const filtered = users.filter(u => u.id !== userId);
    saveStorage(USERS_KEY, filtered);

    // Sync deletion to MongoDB Atlas
    fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
    }).catch(() => {});

    this.logout();
    return true;
  },

  logout(): void {
    // Clear session user
    saveStorage(CURRENT_USER_KEY, null);
  }
};
