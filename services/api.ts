import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Cấu hình API Base URL
// Tự động detect platform và dùng URL phù hợp:
// - Web Browser: http://localhost:8080/api
// - Android/iOS thiết bị thật: http://172.21.7.162:8080/api (IP máy tính)
// - Android Emulator: http://10.0.2.2:8080/api
// - iOS Simulator: http://localhost:8080/api

const LOCAL_IP = '172.21.7.162'; // Thay bằng IP máy tính của bạn

const getApiBaseUrl = () => {
  if (Platform.OS === 'web') {
    // Web browser: dùng localhost
    return 'http://localhost:8080/api';
  }
  
  if (Platform.OS === 'android') {
    // Android thiết bị thật: dùng IP máy tính
    // Nếu dùng emulator, thay bằng: return 'http://10.0.2.2:8080/api';
    return `http://${LOCAL_IP}:8080/api`;
  }
  
  // iOS thiết bị thật: dùng IP máy tính
  // iOS simulator: dùng localhost
  return `http://${LOCAL_IP}:8080/api`;
};

const API_BASE_URL = getApiBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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
