import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, password?: string, rememberMe?: boolean) => { success: boolean; user?: User; error?: string };
  loginWithGoogle: (role?: UserRole, googleProfile?: { name?: string; email?: string; picture?: string }, rememberMe?: boolean) => { success: boolean; user?: User; error?: string };
  register: (userData: any) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  deleteAccount: (userId?: string) => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());

  useEffect(() => {
    const syncUser = () => {
      const latest = authService.getCurrentUser();
      if (latest) {
        setUser(latest);
      }
    };

    syncUser();

    // Fetch latest DB state from MongoDB Atlas to catch Admin verification updates immediately
    authService.fetchUsersFromMongoDB().then(() => {
      syncUser();
    });

    const handleFocus = () => syncUser();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const login = (email: string, password = '', rememberMe = false) => {
    const res = authService.login(email, password, rememberMe);
    if (res.success && res.user) {
      setUser(res.user);
    }
    return res;
  };

  const loginWithGoogle = (role: UserRole = 'farmer', googleProfile?: { name?: string; email?: string; picture?: string }, rememberMe = false) => {
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

  const deleteAccount = (userId?: string) => {
    const idToDelete = userId || user?.id;
    if (idToDelete) {
      authService.deleteAccount(idToDelete);
      setUser(null);
    }
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
