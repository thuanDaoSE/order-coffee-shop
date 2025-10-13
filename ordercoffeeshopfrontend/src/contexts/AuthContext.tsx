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
        // Call the API to get the current user's information
        const response = await getProfile();
        if (response.data) {
          setUser(response.data);
        } else {
          // If getProfile returns no data but doesn't throw, it's still an invalid state
          setUser(null);
        }
      } catch (error) {
        console.log("User is not authenticated, attempting to clear session.");
        // This will call the backend to clear the cookie and set user to null
        try {
          await logoutUser(); // Clear cookie on backend
        } catch (logoutError) {
          console.error("Failed to clear session on server:", logoutError);
        }
        setUser(null); // Clear user in frontend
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