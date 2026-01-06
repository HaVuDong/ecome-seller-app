import apiClient from './api';

export interface TopProduct {
  productId: number;
  productName: string;
  totalQuantitySold: number;
  totalRevenue: number;
  mainImage?: string;
}

export interface RecentOrder {
  orderId: number;
  orderCode: string;
  customerName: string;
  totalAmount: number;
  sellerAmount: number;
  shippingStatus: string;
  paymentStatus: string;
  createdAt: string;
}

export interface DashboardResponse {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  platformFee: number;
  netRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  averageRating: number;
  totalReviews: number;
  topProducts: TopProduct[];
  recentOrders: RecentOrder[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

class DashboardService {
  // Lấy thống kê dashboard của seller hiện tại (từ JWT)
  async getSellerDashboard(): Promise<ApiResponse<DashboardResponse>> {
    const response = await apiClient.get('/dashboard/seller');
    return response.data;
  }

  // Lấy dashboard với khoảng thời gian cụ thể
  async getSellerDashboardWithPeriod(startDate: string, endDate: string): Promise<ApiResponse<DashboardResponse>> {
    const response = await apiClient.get('/dashboard/seller', {
      params: { startDate, endDate },
    });
    return response.data;
  }

  // Helper để format số tiền
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }

  // Helper để format phần trăm
  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  // Tính tỷ lệ hoàn thành đơn hàng
  calculateCompletionRate(dashboard: DashboardResponse): number {
    if (dashboard.totalOrders === 0) return 0;
    return (dashboard.deliveredOrders / dashboard.totalOrders) * 100;
  }

  // Tính tỷ lệ hủy đơn
  calculateCancellationRate(dashboard: DashboardResponse): number {
    if (dashboard.totalOrders === 0) return 0;
    return (dashboard.cancelledOrders / dashboard.totalOrders) * 100;
  }
}

export default new DashboardService();
