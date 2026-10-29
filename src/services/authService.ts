import { User, UserRole } from '../types';
import { INITIAL_USERS } from './mockData';
import { loadStorage, saveStorage } from './storageUtils';

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'current_user';
import { API_BASE_URL } from './apiConfig';

let lastNotifiedEmail = '';
let lastNotifiedTime = 0;

export const authService = {
  getUsers(): User[] {
    const cached = loadStorage<User[]>(USERS_KEY, INITIAL_USERS);
    // Ensure all critical users from INITIAL_USERS (Pushpitha, Rowan, etc.) are present even if localStorage had an older snapshot
    const map = new Map<string, User>();
    cached.forEach(u => map.set(u.email.toLowerCase(), u));
    INITIAL_USERS.forEach(u => {
      if (!map.has(u.email.toLowerCase())) {
        map.set(u.email.toLowerCase(), u);
      }
    });
    const merged = Array.from(map.values());
    if (merged.length !== cached.length) {
      saveStorage(USERS_KEY, merged);
    }
    return merged;
  },

  async fetchUsersFromMongoDB(): Promise<User[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/users`);
      if (res.ok) {
        const mongoUsers = await res.json();
        if (Array.isArray(mongoUsers) && mongoUsers.length > 0) {
          const current = this.getUsers();
          const map = new Map<string, User>();
          current.forEach(u => map.set(u.email.toLowerCase(), u));
          mongoUsers.forEach((u: User) => map.set(u.email.toLowerCase(), u));
          const allMerged = Array.from(map.values());
          saveStorage(USERS_KEY, allMerged);
          return allMerged;
        }
      }
    } catch {
      // Server offline fallback to storage
    }
    return this.getUsers();
  },

  isRememberMe(): boolean {
    const saved = localStorage.getItem('agriconnect_remember_me');
    return saved !== 'false';
  },

  getRememberedCredentials(): { email: string; password: string; rememberMe: boolean } {
    const isRemembered = this.isRememberMe();
    if (!isRemembered) {
      return { email: '', password: '', rememberMe: false };
    }
    const savedEmail = localStorage.getItem('agriconnect_remembered_email');
    const savedPassword = localStorage.getItem('agriconnect_remembered_password');
    if (savedEmail !== null) {
      return {
        email: savedEmail,
        password: savedPassword || '',
        rememberMe: true,
      };
    }
    return {
      email: 'ramesh.farmer@agriconnect.com',
      password: 'password123',
      rememberMe: true,
    };
  },

  setRememberMe(rememberMe: boolean, email?: string, password?: string): void {
    if (rememberMe) {
      localStorage.setItem('agriconnect_remember_me', 'true');
      if (email !== undefined && email.trim()) {
        localStorage.setItem('agriconnect_remembered_email', email.trim());
      }
      if (password !== undefined && password) {
        localStorage.setItem('agriconnect_remembered_password', password);
      }
    } else {
      localStorage.setItem('agriconnect_remember_me', 'false');
      localStorage.removeItem('agriconnect_remembered_email');
      localStorage.removeItem('agriconnect_remembered_password');
    }
  },

  getCurrentUser(): User | null {
    const localUser = loadStorage<User | null>(CURRENT_USER_KEY, null);
    if (localUser) return localUser;
    try {
      const sessionData = sessionStorage.getItem(`agriconnect_${CURRENT_USER_KEY}`);
      if (sessionData) {
        return JSON.parse(sessionData) as User;
      }
    } catch (e) {
      console.error('Failed to load session user', e);
    }
    return null;
  },

  setCurrentUser(user: User | null, rememberMe?: boolean): void {
    const shouldRemember = rememberMe !== undefined ? rememberMe : this.isRememberMe();
    if (!user) {
      saveStorage(CURRENT_USER_KEY, null);
      try {
        sessionStorage.removeItem(`agriconnect_${CURRENT_USER_KEY}`);
      } catch {}
      return;
    }

    if (shouldRemember) {
      saveStorage(CURRENT_USER_KEY, user);
      try {
        sessionStorage.removeItem(`agriconnect_${CURRENT_USER_KEY}`);
      } catch {}
    } else {
      try {
        sessionStorage.setItem(`agriconnect_${CURRENT_USER_KEY}`, JSON.stringify(user));
      } catch {}
      saveStorage(CURRENT_USER_KEY, null);
    }
  },

  login(email: string, password = '', rememberMe = true): { success: boolean; user?: User; error?: string } {
    const users = this.getUsers();
    const cleanEmail = email.trim().toLowerCase();
    const found = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (found) {
      if (found.status === 'suspended') {
        return { success: false, error: 'This account has been suspended by administration.' };
      }
      if (found.email.toLowerCase() === 'admin@agriconnect.com' && password && password !== 'admin@agri') {
        return { success: false, error: 'Invalid Admin password. Use password: admin@agri' };
      }

      const isDemoPresetAccount =
        found.email.toLowerCase() === 'ramesh.farmer@agriconnect.com' ||
        found.email.toLowerCase() === 'priya.buyer@agriconnect.com' ||
        found.email.toLowerCase() === 'sukhwinder.farmer@agriconnect.com' ||
        found.email.toLowerCase() === 'sukhwinder@agriconnect.com' ||
        found.email.toLowerCase() === 'pushpithamullai@gmail.com' ||
        found.email.toLowerCase() === 'rocklandrowanm@gmail.com' ||
        found.email.toLowerCase() === 'jowanm1234@gmail.com';

      const userPassword = (found as any).password;
      const isPasswordValid =
        !password ||
        isDemoPresetAccount ||
        password === 'password123' ||
        password === 'agri@123' ||
        !userPassword ||
        userPassword === password ||
        userPassword === 'password123' ||
        userPassword === 'agri@123';

      if (!isPasswordValid && found.email.toLowerCase() !== 'admin@agriconnect.com') {
        return { success: false, error: 'Incorrect password. Please check your credentials or use "Forgot Password".' };
      }
      if (found.preferredLanguage) {
        localStorage.setItem('agriconnect_language', found.preferredLanguage);
      }
      this.setRememberMe(rememberMe, found.email, password);
      this.setCurrentUser(found, rememberMe);
      return { success: true, user: found };
    }

    // Auto-provision user if they type their personal Gmail/email so any person can log in and receive email
    if (cleanEmail.includes('@') && cleanEmail.includes('.')) {
      const displayName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const newUser: User = {
        id: `usr_${Date.now()}`,
        name: displayName,
        email: cleanEmail,
        role: cleanEmail.includes('farmer') ? 'farmer' : 'buyer',
        phone: '+91 98765 43210',
        location: 'Tamil Nadu, India',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
        password: password || 'password123',
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
      };
      const allUsers = [newUser, ...users];
      saveStorage(USERS_KEY, allUsers);

      // Sync to MongoDB Atlas in background
      fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      }).catch(() => {});

      this.setRememberMe(rememberMe, cleanEmail, password);
      this.setCurrentUser(newUser, rememberMe);
      return { success: true, user: newUser };
    }

    return { success: false, error: 'Invalid credentials. Please enter a valid email address.' };
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        message: 'Could not reach AgriConnect server to send Gmail. Please verify the server is running.',
      };
    }
  },

  async sendLoginNotification(user: User, method: string = 'Password Authentication'): Promise<{ success: boolean; message?: string; targetRecipient?: string; messageId?: string }> {
    if (!user || !user.email) return { success: false, message: 'No user email provided.' };
    const now = Date.now();
    if (user.email.toLowerCase() === lastNotifiedEmail.toLowerCase() && now - lastNotifiedTime < 3000) {
      return { success: true, message: 'Notification already sent.' };
    }
    lastNotifiedEmail = user.email;
    lastNotifiedTime = now;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/notify-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          role: user.role,
          method,
        }),
      });
      const data = await res.json();
      return data;
    } catch {
      return { success: false, message: 'Server offline or unreachable.' };
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

  loginWithGoogle(role: UserRole = 'farmer', googleProfile?: { name?: string; email?: string; picture?: string }, rememberMe = true): { success: boolean; user?: User; error?: string } {
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
    this.setRememberMe(rememberMe, found.email);
    this.setCurrentUser(found, rememberMe);
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
    // Clear session user from both localStorage and sessionStorage
    this.setCurrentUser(null);
  }
};
