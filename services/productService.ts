import apiClient from './api';

export interface ProductResponse {
  id: number;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  mainImage?: string;
  rating?: number;
  soldCount: number;
  isActive: boolean;
  createdAt: string;
  seller: {
    id: number;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  category: {
    id: number;
    name: string;
    icon?: string;
  };
}

export interface ProductRequest {
  categoryId: number;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  mainImage?: string;
  isActive?: boolean;
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

class ProductService {
  async getAllProducts(page = 0, size = 20): Promise<PageResponse<ProductResponse>> {
    const response = await apiClient.get('/products', {
      params: { page, size, sortBy: 'createdAt', direction: 'DESC' },
    });
    return response.data;
  }

  async getProductById(id: number): Promise<ProductResponse> {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  }

  async getProductsByCategory(categoryId: number, page = 0, size = 20): Promise<PageResponse<ProductResponse>> {
    const response = await apiClient.get(`/products/category/${categoryId}`, {
      params: { page, size },
    });
    return response.data;
  }

  async searchProducts(keyword: string, page = 0, size = 20): Promise<PageResponse<ProductResponse>> {
    const response = await apiClient.get('/products/search', {
      params: { keyword, page, size },
    });
    return response.data;
  }

  // Tìm kiếm nâng cao với filters
  async searchProductsAdvanced(params: {
    keyword?: string;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: 'ASC' | 'DESC';
  }): Promise<ApiResponse<PageResponse<ProductResponse>>> {
    const response = await apiClient.get('/products/search/advanced', { params });
    return response.data;
  }

  // Tạo sản phẩm - Backend lấy seller từ JWT
  async createProduct(data: ProductRequest): Promise<ApiResponse<ProductResponse>> {
    const response = await apiClient.post('/products', data);
    return response.data;
  }

  async createProductWithImage(data: ProductRequest, file?: File | null): Promise<ApiResponse<ProductResponse>> {
    const formData = new FormData();
    formData.append('product', JSON.stringify(data));
    if (file) {
      formData.append('file', file as any);
    }
    const response = await apiClient.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  // Cập nhật sản phẩm - Backend kiểm tra quyền từ JWT
  async updateProduct(id: number, data: ProductRequest): Promise<ApiResponse<ProductResponse>> {
    const response = await apiClient.put(`/products/${id}`, data);
    return response.data;
  }

  // Xóa sản phẩm - Backend kiểm tra quyền từ JWT  
  async deleteProduct(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  }

  // Lấy sản phẩm của seller hiện tại (từ JWT)
  async getMyProducts(page = 0, size = 20): Promise<ApiResponse<PageResponse<ProductResponse>>> {
    const response = await apiClient.get('/products/my-products', {
      params: { page, size },
    });
    return response.data;
  }

  // Lấy sản phẩm của seller khác (public)
  async getProductsBySeller(sellerId: number, page = 0, size = 20): Promise<PageResponse<ProductResponse>> {
    const response = await apiClient.get(`/products/seller/${sellerId}`, {
      params: { page, size },
    });
    return response.data;
  }

  // Top sản phẩm bán chạy
  async getTopSellingProducts(): Promise<ProductResponse[]> {
    const response = await apiClient.get('/products/top-selling');
    return response.data;
  }

  // Sản phẩm mới nhất
  async getNewestProducts(): Promise<ProductResponse[]> {
    const response = await apiClient.get('/products/newest');
    return response.data;
  }

  async uploadImage(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
}

export default new ProductService();
