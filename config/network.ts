/**
 * ============================================================
 * NETWORK CONFIGURATION - CẤU HÌNH MẠNG
 * ============================================================
 * 
 * � Backend đã deploy lên Render!
 * URL: https://backend-ecome-03zq.onrender.com
 * 
 * Để chuyển về local development, đổi USE_PRODUCTION = false
 */

// ============================================================
// 👇 CHUYỂN ĐỔI GIỮA PRODUCTION VÀ LOCAL 👇
// ============================================================
export const USE_PRODUCTION = true; // true = Render, false = Local
// ============================================================

// Production URL (Render)
export const PRODUCTION_URL = 'https://backend-ecome-03zq.onrender.com';

// Local development
export const LOCAL_IP = '10.102.61.162';
export const API_PORT = '8080';

export const getApiUrl = () => {
  if (USE_PRODUCTION) {
    return `${PRODUCTION_URL}/api`;
  }
  return `http://${LOCAL_IP}:${API_PORT}/api`;
};

// URL để test kết nối backend
export const getHealthCheckUrl = () => {
  if (USE_PRODUCTION) {
    return `${PRODUCTION_URL}/api/categories`;
  }
  return `http://${LOCAL_IP}:${API_PORT}/api/categories`;
};

// Log IP khi app khởi động (debug)
export const logNetworkConfig = () => {
  console.log('========================================');
  console.log('📡 NETWORK CONFIG');
  console.log('========================================');
  console.log(`🌐 Mode: ${USE_PRODUCTION ? 'PRODUCTION (Render)' : 'LOCAL'}`);
  console.log(`🔗 API URL: ${getApiUrl()}`);
  console.log(`🧪 Test URL: ${getHealthCheckUrl()}`);
  console.log('========================================');
  if (USE_PRODUCTION) {
    console.log('✅ Đang sử dụng backend trên Render');
    console.log('⚠️  Nếu lỗi, kiểm tra backend đang active trên Render');
  } else {
    console.log('⚠️  Nếu lỗi Network Error:');
    console.log('   1. Kiểm tra Backend đang chạy');
    console.log('   2. Điện thoại cùng WiFi với máy tính');
    console.log('   3. Chạy "ipconfig" để lấy IP mới');
    console.log('   4. Sửa IP trong config/network.ts');
  }
  console.log('========================================');
};
