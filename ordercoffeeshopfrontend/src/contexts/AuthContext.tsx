import { createContext, useContext, useState, useEffect, type ReactNode, useCallback, useMemo } from 'react';
import { getProfile, logout as logoutUser, updateUserStore } from '../services';
import type { User } from '../types/user';
import type { Store } from '../types/store';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
  fetchUser: () => void;
  updateStore: (storeId: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { useCart } from './CartContext';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { clearCart } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const userProfile = await getProfile();
      if (userProfile) {
        setUser(userProfile);
      } else {
        setUser(null);
      }
    } catch (error: any) {
      console.error("Authentication error:", error?.response?.data || error.message);
      setUser(null);
      if (error?.response?.status !== 401 && error?.response?.status !== 403) {
        try {
          await logoutUser();
        } catch (logoutError) {
          console.error("Failed to clear session:", logoutError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback((loggedInUser: User) => {
    setUser(loggedInUser);
    setIsLoading(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser(); // Call API logout for backend to clear cookie
    } catch (error) {
      console.error("Failed to logout:", error);
    }
    setUser(null);
    clearCart();
  }, [clearCart]);

  const updateStore = useCallback(async (storeId: number) => {
    if (!user) return;
    try {
      const updatedUser = await updateUserStore(storeId);
      setUser(updatedUser);
    } catch (error) {
      console.error("Failed to update store:", error);
      // Optionally handle the error in the UI
    }
  }, [user]);

  const value = useMemo(() => ({ user, login, logout, isLoading, fetchUser, updateStore }), [user, login, logout, isLoading, fetchUser, updateStore]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};