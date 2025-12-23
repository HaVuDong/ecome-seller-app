import apiClient from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: 'CUSTOMER' | 'SELLER' | 'ADMIN';
  address?: string;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  role: string;
  status: string;
  address?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

class AuthService {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }

  async logout(): Promise<void> {
    // Gọi API logout để log hoặc invalidate token
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Nếu API lỗi, vẫn cho phép logout ở client
      console.error('Logout API error:', error);
    }
  }
}

export default new AuthService();
