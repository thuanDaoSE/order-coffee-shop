import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getProfile, logout as logoutUser } from '../services/authService'; // Giả sử bạn có các hàm này
import type { User } from '../types/user';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
  fetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { useCart } from './CartContext';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { clearCart } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const response = await getProfile();
      if (response?.data) {
        setUser(response.data);
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
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = (loggedInUser: User) => {
    setUser(loggedInUser);
    setIsLoading(false);
  };

  const logout = async () => {
    try {
      await logoutUser(); // Gọi API logout để backend xóa cookie
    } catch (error) {
      console.error("Failed to logout:", error);
    }
    setUser(null);
    clearCart();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, fetchUser }}>
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