import apiClient from './api';

/**
 * Chat Service - Tích hợp API Chat từ Backend
 * 
 * API Endpoints:
 * - GET /api/chat/conversations - Lấy danh sách cuộc hội thoại
 * - GET /api/chat/conversations/{id} - Lấy chi tiết cuộc hội thoại
 * - GET /api/chat/conversations/{id}/messages - Lấy tin nhắn
 * - POST /api/chat/conversations - Tạo/lấy cuộc hội thoại với user
 * - POST /api/chat/messages - Gửi tin nhắn
 * - PUT /api/chat/conversations/{id}/read - Đánh dấu đã đọc
 * - GET /api/chat/unread-count - Lấy số tin nhắn chưa đọc
 */

// ============================================================
// INTERFACES
// ============================================================

export interface ConversationResponse {
  id: number;
  otherUserId: number;
  otherUserName: string;
  otherUserAvatar: string | null;
  otherUserRole: 'CUSTOMER' | 'SELLER' | 'ADMIN';
  lastMessage: string | null;
  lastSenderId: number | null;
  lastMessageAt: string | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MessageResponse {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderAvatar: string | null;
  receiverId: number;
  receiverName: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'PRODUCT';
  imageUrl: string | null;
  productId: number | null;
  product: ProductInfo | null;
  status: 'SENT' | 'DELIVERED' | 'READ';
  readAt: string | null;
  createdAt: string;
  isOwn: boolean;
}

export interface ProductInfo {
  id: number;
  name: string;
  mainImage: string;
  price: number;
}

export interface SendMessageRequest {
  receiverId: number;
  content: string;
  messageType?: 'TEXT' | 'IMAGE' | 'PRODUCT';
  imageUrl?: string;
  productId?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface UnreadCount {
  unreadMessages: number;
  unreadConversations: number;
}

// ============================================================
// CHAT SERVICE CLASS
// ============================================================

class ChatService {
  
  /**
   * Lấy danh sách cuộc hội thoại
   */
  async getConversations(page: number = 0, size: number = 20): Promise<PageResponse<ConversationResponse>> {
    try {
      const response = await apiClient.get('/chat/conversations', {
        params: { page, size }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  /**
   * Lấy chi tiết cuộc hội thoại
   */
  async getConversation(conversationId: number): Promise<ConversationResponse> {
    try {
      const response = await apiClient.get(`/chat/conversations/${conversationId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  }

  /**
   * Tạo hoặc lấy cuộc hội thoại với user khác
   */
  async getOrCreateConversation(userId: number): Promise<ConversationResponse> {
    try {
      const response = await apiClient.post('/chat/conversations', { userId });
      return response.data.data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  /**
   * Lấy tin nhắn của cuộc hội thoại
   */
  async getMessages(conversationId: number, page: number = 0, size: number = 50): Promise<PageResponse<MessageResponse>> {
    try {
      const response = await apiClient.get(`/chat/conversations/${conversationId}/messages`, {
        params: { page, size }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  /**
   * Gửi tin nhắn mới
   */
  async sendMessage(request: SendMessageRequest): Promise<MessageResponse> {
    try {
      const response = await apiClient.post('/chat/messages', {
        receiverId: request.receiverId,
        content: request.content,
        messageType: request.messageType || 'TEXT',
        imageUrl: request.imageUrl,
        productId: request.productId,
      });
      return response.data.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Đánh dấu tin nhắn đã đọc
   */
  async markAsRead(conversationId: number): Promise<void> {
    try {
      await apiClient.put(`/chat/conversations/${conversationId}/read`);
    } catch (error) {
      console.error('Error marking as read:', error);
      throw error;
    }
  }

  /**
   * Lấy số tin nhắn chưa đọc
   */
  async getUnreadCount(): Promise<UnreadCount> {
    try {
      const response = await apiClient.get('/chat/unread-count');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  // ============================================================
  // HELPER METHODS
  // ============================================================

  /**
   * Format thời gian tin nhắn
   */
  formatMessageTime(dateString: string | null): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return date.toLocaleDateString('vi-VN');
  }

  /**
   * Format thời gian hiển thị trong chat
   */
  formatChatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Lấy avatar initials từ tên
   */
  getAvatarInitials(name: string): string {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}

export const chatService = new ChatService();
export default chatService;
