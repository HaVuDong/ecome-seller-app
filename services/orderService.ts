import apiClient from './api';

export interface OrderResponse {
  id: number;
  orderNumber: string;
  userId: number;
  totalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    fullName: string;
    email: string;
  };
  orderItems?: OrderItemResponse[];
}

export interface OrderItemResponse {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product?: {
    id: number;
    name: string;
    mainImage?: string;
  };
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

class OrderService {
  async getAllOrders(page = 0, size = 20): Promise<PageResponse<OrderResponse>> {
    const response = await apiClient.get('/orders', {
      params: { page, size, sortBy: 'createdAt', direction: 'DESC' },
    });
    return response.data;
  }

  async getOrderById(id: number): Promise<OrderResponse> {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  }

  async getOrdersBySeller(sellerId: number, page = 0, size = 20): Promise<PageResponse<OrderResponse>> {
    const response = await apiClient.get(`/orders/seller/${sellerId}`, {
      params: { page, size },
    });
    return response.data;
  }

  async updateOrderStatus(id: number, status: string): Promise<OrderResponse> {
    const response = await apiClient.put(`/orders/${id}/status`, { status });
    return response.data;
  }
}

export default new OrderService();
