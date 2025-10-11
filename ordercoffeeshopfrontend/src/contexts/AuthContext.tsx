import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getProfile, logout  } from '../services/apiService'; // Giả sử bạn có các hàm này
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
        // Gọi API để lấy thông tin người dùng hiện tại
        const response = await getProfile(); 
        if (response.data) {
          setUser(response.data);
        }
      } catch (error) {
        console.log("User is not authenticated");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserStatus();
  }, []);

  const login = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const logout = async () => {
    try {
      await logout(); // Gọi API logout để backend xóa cookie
    } catch (error) {
      console.error("Failed to decode token:", error);
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