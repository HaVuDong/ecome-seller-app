import apiClient from './api';

export interface CategoryResponse {
  id: number;
  name: string;
  icon?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

class CategoryService {
  async getAllCategories(): Promise<CategoryResponse[]> {
    const response = await apiClient.get('/categories');
    return response.data;
  }

  async getCategoryById(id: number): Promise<CategoryResponse> {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  }
}

export default new CategoryService();
