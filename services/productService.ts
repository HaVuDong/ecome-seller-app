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
  sellerId: number;
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

  async createProduct(data: ProductRequest): Promise<ProductResponse> {
    const response = await apiClient.post('/products', data);
    return response.data;
  }

  async updateProduct(id: number, data: ProductRequest): Promise<ProductResponse> {
    const response = await apiClient.put(`/products/${id}`, data);
    return response.data;
  }

  async deleteProduct(id: number): Promise<void> {
    await apiClient.delete(`/products/${id}`);
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
