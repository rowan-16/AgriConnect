import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/authService';
import { cropService } from '../services/cropService';
import { orderService } from '../services/orderService';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, password?: string, rememberMe?: boolean) => Promise<{ success: boolean; user?: User; error?: string }>;
  loginWithGoogle: (role?: UserRole, googleProfile?: { name?: string; email?: string; picture?: string }, rememberMe?: boolean) => { success: boolean; user?: User; error?: string };
  register: (userData: any) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  deleteAccount: (userId?: string) => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());

  useEffect(() => {
    // 1. Fetch live users from MongoDB Atlas and sync current active user
    authService.fetchUsersFromMongoDB().then((users) => {
      const latest = authService.getCurrentUser();
      if (latest) {
        const matching = users.find(u => u.email.toLowerCase() === latest.email.toLowerCase() || u.id === latest.id);
        if (matching) {
          authService.setCurrentUser(matching);
          setUser(matching);
        }
      }
    });

    // 2. Fetch live crops and orders from MongoDB Atlas
    cropService.fetchCropsFromMongoDB();
    orderService.fetchOrdersFromMongoDB();

    // 3. Re-sync on window focus
    const handleFocus = () => {
      authService.fetchUsersFromMongoDB();
      cropService.fetchCropsFromMongoDB();
      orderService.fetchOrdersFromMongoDB();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    if (user) {
      authService.setCurrentUser(user);
    }
  }, [user]);

  const login = async (email: string, password = '', rememberMe = true) => {
    const res = await authService.login(email, password, rememberMe);
    if (res.success && res.user) {
      setUser(res.user);
    }
    return res;
  };

  const loginWithGoogle = (role: UserRole = 'farmer', googleProfile?: { name?: string; email?: string; picture?: string }, rememberMe = true) => {
    const res = authService.loginWithGoogle(role, googleProfile, rememberMe);
    if (res.success && res.user) {
      setUser(res.user);
    }
    return res;
  };

  const register = async (userData: any) => {
    const res = await authService.register(userData);
    if (res.success && res.user) {
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const deleteAccount = async (userId?: string): Promise<void> => {
    const idToDelete = userId || user?.id || (user as any)?._id || user?.email || authService.getCurrentUser()?.email;
    if (idToDelete) {
      await authService.deleteAccount(String(idToDelete));
    }
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = authService.updateProfile(user.id, updates);
    if (updated) {
      setUser(updated);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : 'buyer',
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        register,
        logout,
        deleteAccount,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
