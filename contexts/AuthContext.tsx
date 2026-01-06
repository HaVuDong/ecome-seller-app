import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService, { LoginRequest, RegisterRequest, User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user & token from AsyncStorage khi app khởi động
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem('token'),
        AsyncStorage.getItem('user'),
      ]);

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        
        // Kiểm tra role - chỉ cho phép SELLER trong app Ecome
        if (parsedUser.role !== 'SELLER') {
          console.log('User is not SELLER, clearing stored auth');
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          return;
        }
        
        setToken(storedToken);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error loading auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginRequest) => {
    try {
      const response = await authService.login(data);
      
      // Kiểm tra role - App Ecome chỉ dành cho SELLER
      if (response.user.role !== 'SELLER') {
        throw new Error('Tài khoản này không phải là tài khoản người bán. Vui lòng sử dụng app khách hàng.');
      }
      
      // Save to state
      setToken(response.token);
      setUser(response.user);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('token', response.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
    } catch (error: any) {
      // Nếu là lỗi role check, throw message đó
      if (error.message?.includes('người bán')) {
        throw error;
      }
      throw new Error(error.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await authService.register(data);
      
      // Save to state
      setToken(response.token);
      setUser(response.user);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('token', response.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Đăng ký thất bại');
    }
  };

  const logout = async () => {
    try {
      // Call API logout (nếu backend có endpoint)
      await authService.logout();
      
      // Clear state
      setToken(null);
      setUser(null);
      
      // Clear AsyncStorage
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const updatedUser = await authService.getCurrentUser();
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
