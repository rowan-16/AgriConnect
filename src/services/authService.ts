import { User, UserRole } from '../types';
import { INITIAL_USERS } from './mockData';
import { loadStorage, saveStorage } from './storageUtils';

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'current_user';
import { API_BASE_URL } from './apiConfig';

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
      if ((found as any).password && password && (found as any).password !== password && found.email.toLowerCase() !== 'admin@agriconnect.com') {
        return { success: false, error: 'Incorrect password. Please check your credentials or use "Forgot Password".' };
      }
      if (found.preferredLanguage) {
        localStorage.setItem('agriconnect_language', found.preferredLanguage);
      }
      this.setCurrentUser(found);
      return { success: true, user: found };
    }
    return { success: false, error: 'Invalid credentials. Please check email and password.' };
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string; tempPassword?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.tempPassword) {
        const users = this.getUsers();
        const updated = users.map(u => {
          if (u.email.toLowerCase() === email.toLowerCase()) {
            return { ...u, password: data.tempPassword };
          }
          return u;
        });
        saveStorage(USERS_KEY, updated);
      }
      return data;
    } catch {
      const users = this.getUsers();
      const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!found) {
        return { success: false, message: `No user found with email "${email}".` };
      }
      const tempPassword = 'Agri-' + Math.floor(100000 + Math.random() * 900000);
      const updated = users.map(u => u.id === found.id ? { ...u, password: tempPassword } : u);
      saveStorage(USERS_KEY, updated);
      return {
        success: true,
        tempPassword,
        message: `Temporary password generated: ${tempPassword}. You can now sign in with this password.`,
      };
    }
  },

  async register(userData: Partial<User> & { name: string; email: string; role: UserRole; phone: string; location: string }): Promise<{ success: boolean; user?: User; error?: string }> {
    const users = this.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existing) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const currentLang = (localStorage.getItem('agriconnect_language') || 'en') as any;
    const currentYear = new Date().getFullYear();
    const appRef = userData.role === 'farmer' 
      ? (userData.applicationRef || `AGC-APP-${currentYear}-${Math.floor(10000 + Math.random() * 90000)}`)
      : undefined;

    const newUser: User = {
      id: `usr_${userData.role}_${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      phone: userData.phone,
      location: userData.location,
      preferredLanguage: (userData.preferredLanguage || currentLang),
      avatar: userData.role === 'farmer'
        ? 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      farmName: userData.farmName,
      farmLocation: userData.farmLocation || userData.location,
      farmSizeAcres: userData.farmSizeAcres,
      cropsGrown: userData.cropsGrown,
      businessName: userData.businessName,
      tradeName: userData.tradeName,
      buyerType: userData.buyerType,
      buyerCategory: userData.buyerCategory,
      businessType: userData.businessType,
      buyerGstin: userData.buyerGstin,
      procurementCategories: userData.procurementCategories,
      estimatedVolume: userData.estimatedVolume,
      residentialAddress: userData.residentialAddress,
      farmAddress: userData.farmAddress,
      businessAddress: userData.businessAddress,
      defaultDeliveryAddress: userData.defaultDeliveryAddress,
      defaultBillingAddress: userData.defaultBillingAddress,
      farmerRating: userData.role === 'farmer' ? 5.0 : undefined,
      isVerified: false,
      applicationRef: appRef,
      verificationDocuments: userData.role === 'farmer' ? {
        documentType: userData.verificationDocuments?.documentType || 'land_record',
        documentName: userData.verificationDocuments?.documentName || 'Proof of Cultivation',
        documentUrl: userData.verificationDocuments?.documentUrl || userData.verificationDocuments?.landDocumentImage || '',
        landDocumentImage: userData.verificationDocuments?.landDocumentImage || userData.verificationDocuments?.documentUrl || '',
        landImage: userData.verificationDocuments?.landImage || '',
        applicationRef: appRef,
        submittedAt: new Date().toISOString(),
        status: 'pending',
      } : undefined,
      status: userData.role === 'farmer' ? 'pending' : 'active',
      createdAt: new Date().toISOString().split('T')[0],
      savedAddresses: userData.role === 'buyer' ? (userData.savedAddresses || [
        {
          id: `addr_${Date.now()}`,
          label: 'Default Delivery Address',
          street: userData.defaultDeliveryAddress?.street || userData.location,
          city: userData.defaultDeliveryAddress?.villageOrCity || userData.location.split(',')[0] || userData.location,
          state: userData.defaultDeliveryAddress?.state || userData.location.split(',')[1]?.trim() || 'State',
          pincode: userData.defaultDeliveryAddress?.postalCode || '400001',
          isDefault: true,
          structured: userData.defaultDeliveryAddress || userData.residentialAddress
        }
      ]) : undefined
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

    if (found.preferredLanguage) {
      localStorage.setItem('agriconnect_language', found.preferredLanguage);
    }
    this.setCurrentUser(found);
    return { success: true, user: found };
  },

  submitVerificationDocuments(
    userId: string,
    docs: { 
      documentType?: any; 
      documentName?: string; 
      documentUrl?: string; 
      landDocumentImage?: string; 
      landImage?: string 
    }
  ): User | null {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    const appRef = user?.applicationRef || user?.verificationDocuments?.applicationRef || `AGC-APP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const verificationDocuments = {
      ...user?.verificationDocuments,
      ...docs,
      applicationRef: appRef,
      submittedAt: new Date().toISOString(),
      status: 'pending' as const,
    };

    return this.updateProfile(userId, {
      applicationRef: appRef,
      verificationDocuments,
      status: 'pending',
    });
  },

  reviewFarmerVerification(
    farmerId: string,
    isApproved: boolean,
    rejectionReason?: string,
    options?: { status?: 'approved' | 'rejected' | 'needs_evidence'; adminNotes?: string; reviewerId?: string }
  ): User | null {
    const users = this.getUsers();
    const target = users.find(u => u.id === farmerId);
    if (!target) return null;

    const currentDocs = target.verificationDocuments || {
      status: 'unsubmitted' as const,
    };

    const finalStatus: 'approved' | 'rejected' | 'needs_evidence' = 
      options?.status || (isApproved ? 'approved' : 'rejected');

    const updatedDocs = {
      ...currentDocs,
      status: finalStatus,
      rejectionReason: finalStatus !== 'approved' ? (rejectionReason || 'Documents rejected by Admin.') : undefined,
      adminNotes: options?.adminNotes || currentDocs.adminNotes,
      reviewedAt: new Date().toISOString(),
      reviewedBy: options?.reviewerId || 'AgriConnect Admin',
    };

    return this.updateProfile(farmerId, {
      isVerified: finalStatus === 'approved',
      status: finalStatus === 'approved' ? 'active' : 'pending',
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
