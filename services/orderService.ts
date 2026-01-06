import apiClient from './api';

// Các trạng thái thanh toán
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED';

// Các trạng thái vận chuyển
export type ShippingStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';

export interface OrderResponse {
  id: number;
  userId: number;
  totalAmount: number;
  finalAmount: number;
  shippingFee: number;
  discountAmount: number;
  platformFee?: number;
  sellerAmount?: number;
  paymentStatus: PaymentStatus;
  shippingStatus: ShippingStatus;
  paymentMethod: string;
  shippingAddress: string;
  shippingPhone: string;
  shippingName: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    fullName: string;
    email: string;
    phone?: string;
  };
  seller?: {
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

// API Response wrapper từ backend mới
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface RevenueResponse {
  totalRevenue: number;
  totalOrders: number;
  platformFee: number;
  netRevenue: number;
  periodStart?: string;
  periodEnd?: string;
}

// Label hiển thị cho trạng thái thanh toán
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  FAILED: 'Thất bại',
  REFUNDED: 'Đã hoàn tiền',
  CANCELLED: 'Đã hủy',
};

// Label hiển thị cho trạng thái vận chuyển
export const SHIPPING_STATUS_LABELS: Record<ShippingStatus, string> = {
  PENDING: 'Chờ xử lý',
  PROCESSING: 'Đang chuẩn bị',
  SHIPPED: 'Đã giao cho vận chuyển',
  IN_TRANSIT: 'Đang vận chuyển',
  DELIVERED: 'Đã giao hàng',
  CANCELLED: 'Đã hủy',
  RETURNED: 'Đã trả hàng',
};

// Màu sắc cho các trạng thái
export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  PENDING: '#FFA500',
  PAID: '#28a745',
  FAILED: '#dc3545',
  REFUNDED: '#6c757d',
  CANCELLED: '#dc3545',
};

export const SHIPPING_STATUS_COLORS: Record<ShippingStatus, string> = {
  PENDING: '#FFA500',
  PROCESSING: '#17a2b8',
  SHIPPED: '#007bff',
  IN_TRANSIT: '#6f42c1',
  DELIVERED: '#28a745',
  CANCELLED: '#dc3545',
  RETURNED: '#6c757d',
};

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

  // Lấy đơn hàng của seller hiện tại (từ JWT token)
  async getMyOrders(page = 0, size = 20): Promise<ApiResponse<PageResponse<OrderResponse>>> {
    const response = await apiClient.get('/orders/seller/my-orders', {
      params: { page, size },
    });
    return response.data;
  }

  // Lấy doanh thu của seller hiện tại (từ JWT token)
  async getMyRevenue(startDate?: string, endDate?: string): Promise<ApiResponse<RevenueResponse>> {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await apiClient.get('/orders/seller/my-revenue', { params });
    return response.data;
  }

  // Lấy đơn hàng của seller (public - cần sellerId)
  async getOrdersBySeller(sellerId: number, page = 0, size = 20): Promise<PageResponse<OrderResponse>> {
    const response = await apiClient.get(`/orders/seller/${sellerId}`, {
      params: { page, size },
    });
    return response.data;
  }

  // Tính doanh thu của seller (public)
  async getSellerRevenue(sellerId: number, startDate?: string, endDate?: string): Promise<{ revenue: number }> {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await apiClient.get(`/orders/seller/${sellerId}/revenue`, { params });
    return response.data;
  }

  // Lọc theo trạng thái thanh toán
  async getOrdersByPaymentStatus(paymentStatus: PaymentStatus, page = 0, size = 20): Promise<PageResponse<OrderResponse>> {
    const response = await apiClient.get(`/orders/payment-status/${paymentStatus}`, {
      params: { page, size },
    });
    return response.data;
  }

  // Lọc theo trạng thái vận chuyển
  async getOrdersByShippingStatus(shippingStatus: ShippingStatus, page = 0, size = 20): Promise<PageResponse<OrderResponse>> {
    const response = await apiClient.get(`/orders/shipping-status/${shippingStatus}`, {
      params: { page, size },
    });
    return response.data;
  }

  // Cập nhật trạng thái thanh toán
  async updatePaymentStatus(id: number, paymentStatus: PaymentStatus): Promise<ApiResponse<OrderResponse>> {
    const response = await apiClient.put(`/orders/${id}/payment-status`, null, {
      params: { paymentStatus },
    });
    return response.data;
  }

  // Cập nhật trạng thái vận chuyển
  async updateShippingStatus(id: number, shippingStatus: ShippingStatus): Promise<ApiResponse<OrderResponse>> {
    const response = await apiClient.put(`/orders/${id}/shipping-status`, null, {
      params: { shippingStatus },
    });
    return response.data;
  }

  // Hủy đơn hàng
  async cancelOrder(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.put(`/orders/${id}/cancel`);
    return response.data;
  }
}

export default new OrderService();
