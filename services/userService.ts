import apiClient from './api';

export interface UserStats {
  totalOrders: number;
  totalProducts: number;
  averageRating: number;
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

class UserService {
  // Lấy thông tin user hiện tại (đang đăng nhập)
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }

  // Lấy user theo ID
  async getUserById(id: number): Promise<User> {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  }

  // Lấy user theo email
  async getUserByEmail(email: string): Promise<User> {
    const response = await apiClient.get(`/users/email/${email}`);
    return response.data;
  }

  // Cập nhật thông tin user
  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  }

  // Lấy thống kê của seller (sẽ cần backend hỗ trợ API này)
  async getUserStats(userId: number): Promise<UserStats> {
    // TODO: Backend cần tạo API endpoint này
    // Tạm thời trả về dữ liệu giả
    return {
      totalOrders: 0,
      totalProducts: 0,
      averageRating: 0,
    };
  }
}

export default new UserService();
