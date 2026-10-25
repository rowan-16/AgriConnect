import { User, UserRole } from '../types';
import { INITIAL_USERS } from './mockData';
import { loadStorage, saveStorage } from './storageUtils';

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'current_user';
import { API_BASE_URL } from './apiConfig';

const DEFAULT_LAND_DOC = 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=600';
const DEFAULT_CROP_DOC = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600';
const DEFAULT_LAND_IMG = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600';

export const authService = {
  getUsers(): User[] {
    const rawUsers = loadStorage<User[]>(USERS_KEY, INITIAL_USERS);
    return rawUsers.map(u => {
      const isVerified = Boolean(u.isVerified || u.verificationDocuments?.status === 'approved');
      if (u.role === 'farmer' && u.verificationDocuments) {
        return {
          ...u,
          isVerified,
          verificationDocuments: {
            ...u.verificationDocuments,
            landDocumentImage: u.verificationDocuments.landDocumentImage || DEFAULT_LAND_DOC,
            cropApprovalDocumentImage: u.verificationDocuments.cropApprovalDocumentImage || DEFAULT_CROP_DOC,
            landImage: u.verificationDocuments.landImage || DEFAULT_LAND_IMG,
          }
        };
      }
      return {
        ...u,
        isVerified,
      };
    });
  },

  async fetchUsersFromMongoDB(): Promise<User[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/users`);
      if (res.ok) {
        const mongoUsers = await res.json();
        if (Array.isArray(mongoUsers) && mongoUsers.length > 0) {
          saveStorage(USERS_KEY, mongoUsers);
          return this.getUsers();
        }
      }
    } catch {
      // Server offline fallback to storage
    }
    return this.getUsers();
  },

  getCurrentUser(): User | null {
    try {
      let user: User | null = null;
      const sessionData = sessionStorage.getItem(`agriconnect_${CURRENT_USER_KEY}`);
      if (sessionData) {
        user = JSON.parse(sessionData) as User;
      } else {
        const localData = localStorage.getItem(`agriconnect_${CURRENT_USER_KEY}`);
        if (localData) {
          user = JSON.parse(localData) as User;
        }
      }

      if (user) {
        const allUsers = this.getUsers();
        const latest = allUsers.find(u => u.id === user!.id || u.email.toLowerCase() === user!.email.toLowerCase());
        if (latest) {
          const isVerified = Boolean(latest.isVerified || latest.verificationDocuments?.status === 'approved');
          const resolvedLatest = { ...latest, isVerified };
          const isRemembered = Boolean(localStorage.getItem(`agriconnect_${CURRENT_USER_KEY}`));
          this.setCurrentUser(resolvedLatest, isRemembered);
          return resolvedLatest;
        }

        const isVerified = Boolean(user.isVerified || user.verificationDocuments?.status === 'approved');
        return { ...user, isVerified };
      }
      return user;
    } catch (e) {
      console.error('Failed to get current user', e);
    }
    return null;
  },

  setCurrentUser(user: User | null, rememberMe = false): void {
    if (!user) {
      sessionStorage.removeItem(`agriconnect_${CURRENT_USER_KEY}`);
      localStorage.removeItem(`agriconnect_${CURRENT_USER_KEY}`);
      return;
    }
    if (rememberMe) {
      localStorage.setItem(`agriconnect_${CURRENT_USER_KEY}`, JSON.stringify(user));
      sessionStorage.setItem(`agriconnect_${CURRENT_USER_KEY}`, JSON.stringify(user));
    } else {
      sessionStorage.setItem(`agriconnect_${CURRENT_USER_KEY}`, JSON.stringify(user));
      localStorage.removeItem(`agriconnect_${CURRENT_USER_KEY}`);
    }
  },

  login(email: string, password = '', rememberMe = false): { success: boolean; user?: User; error?: string } {
    const users = this.getUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      if (found.status === 'suspended') {
        return { success: false, error: 'This account has been suspended by administration.' };
      }
      if (found.email.toLowerCase() === 'admin@agriconnect.com' && password && password !== 'admin@agri') {
        return { success: false, error: 'Invalid Admin password. Use password: admin@agri' };
      }
      this.setCurrentUser(found, rememberMe);
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
    const index = users.findIndex(u => u.id === userId || u.email.toLowerCase() === userId.toLowerCase());
    if (index === -1) return null;

    const updated = { ...users[index], ...updates };
    users[index] = updated;
    saveStorage(USERS_KEY, users);

    // Sync to MongoDB Atlas
    fetch(`${API_BASE_URL}/users/${encodeURIComponent(users[index].id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => {});

    const currentUser = this.getCurrentUser();
    if (currentUser?.id === userId || currentUser?.email?.toLowerCase() === userId.toLowerCase()) {
      this.setCurrentUser(updated);
    }
    return updated;
  },

  loginWithGoogle(role: UserRole = 'farmer', googleProfile?: { name?: string; email?: string; picture?: string }, rememberMe = false): { success: boolean; user?: User; error?: string } {
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

    this.setCurrentUser(found, rememberMe);
    return { success: true, user: found };
  },

  submitVerificationDocuments(
    userId: string,
    docs: { landDocumentImage?: string; cropApprovalDocumentImage?: string; landImage?: string }
  ): User | null {
    const verificationDocuments = {
      landDocumentImage: docs.landDocumentImage || DEFAULT_LAND_DOC,
      cropApprovalDocumentImage: docs.cropApprovalDocumentImage || DEFAULT_CROP_DOC,
      landImage: docs.landImage || DEFAULT_LAND_IMG,
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
    const target = users.find(u => u.id === farmerId || u.email.toLowerCase() === farmerId.toLowerCase());
    if (!target) return null;

    const currentDocs = target.verificationDocuments || {
      status: 'unsubmitted' as const,
    };

    const updatedDocs = {
      ...currentDocs,
      status: isApproved ? ('approved' as const) : ('rejected' as const),
      rejectionReason: isApproved ? undefined : rejectionReason || 'Documents rejected by Admin.',
    };

    return this.updateProfile(target.id, {
      isVerified: isApproved,
      status: isApproved ? 'active' : 'pending',
      verificationDocuments: updatedDocs,
    });
  },

  deleteAccount(userId: string): boolean {
    const users = this.getUsers();
    const targetUser = users.find(u => u.id === userId || u.email.toLowerCase() === userId.toLowerCase());
    const targetEmail = targetUser?.email || userId;

    const filtered = users.filter(u => u.id !== userId && u.email.toLowerCase() !== targetEmail.toLowerCase());
    saveStorage(USERS_KEY, filtered);

    // Sync deletion to MongoDB Atlas cloud database by ID and target email
    fetch(`${API_BASE_URL}/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    }).catch(err => console.error('MongoDB sync delete error:', err));

    if (targetEmail && targetEmail !== userId) {
      fetch(`${API_BASE_URL}/users/${encodeURIComponent(targetEmail)}`, {
        method: 'DELETE',
      }).catch(() => {});
    }

    const currentUser = this.getCurrentUser();
    if (currentUser?.id === userId || currentUser?.email?.toLowerCase() === targetEmail.toLowerCase()) {
      this.logout();
    }
    return true;
  },

  logout(): void {
    // Clear session user
    this.setCurrentUser(null);
  }
};
