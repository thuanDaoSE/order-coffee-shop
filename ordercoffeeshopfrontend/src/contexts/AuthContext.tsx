import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getProfile, logout as logoutUser } from '../services/authService'; // Giả sử bạn có các hàm này
import type { User } from '../types/user';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
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
        // Don't automatically logout on 401/403 errors as they're expected when not logged in
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

    checkUserStatus();
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
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  console.log("useAuth called");
  const context = useContext(AuthContext);
  console.log("useAuth context: ", context);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};