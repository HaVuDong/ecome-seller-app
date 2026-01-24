import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl, logNetworkConfig } from '../config/network';

/**
 * API Configuration
 * 
 * 🟢 Sử dụng cấu hình từ config/network.ts
 * Đổi USE_PRODUCTION = true/false để chuyển giữa Render và Local
 */

const API_BASE_URL = getApiUrl();

// Log config khi khởi động (chỉ 1 lần)
logNetworkConfig();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s cho Render free tier cold start
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Thêm token vào mọi request
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    console.log('Token exists:', !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Xử lý errors
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.method?.toUpperCase(), response.config.url, 'Status:', response.status);
    return response;
  },
  async (error) => {
    console.error('API Error:', error.config?.method?.toUpperCase(), error.config?.url);
    console.error('Error status:', error.response?.status);
    console.error('Error message:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 401) {
      // Token hết hạn hoặc invalid → logout
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // Có thể dispatch logout action ở đây
    }
    return Promise.reject(error);
  }
);

export default apiClient;
