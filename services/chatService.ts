import apiClient from './api';

// ⚠️ LƯU Ý: Backend chưa có API Chat
// File này được tạo sẵn để chuẩn bị khi backend có API

export interface ChatRoom {
  id: string;
  customerId: number;
  customerName: string;
  customerAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  chatRoomId: string;
  senderId: number;
  senderType: 'CUSTOMER' | 'SELLER';
  message: string;
  createdAt: string;
  isRead: boolean;
}

export interface SendMessageRequest {
  chatRoomId: string;
  message: string;
}

class ChatService {
  // TODO: Khi backend có API, uncomment và sử dụng
  
  // async getChatRooms(): Promise<ChatRoom[]> {
  //   const response = await apiClient.get('/chat/rooms');
  //   return response.data;
  // }

  // async getMessages(chatRoomId: string): Promise<Message[]> {
  //   const response = await apiClient.get(`/chat/rooms/${chatRoomId}/messages`);
  //   return response.data;
  // }

  // async sendMessage(data: SendMessageRequest): Promise<Message> {
  //   const response = await apiClient.post(`/chat/messages`, data);
  //   return response.data;
  // }

  // async markAsRead(messageId: string): Promise<void> {
  //   await apiClient.put(`/chat/messages/${messageId}/read`);
  // }

  // Temporary mock data cho demo
  getMockChatRooms(): ChatRoom[] {
    return [
      {
        id: '1',
        customerId: 1,
        customerName: 'Nguyễn Văn A',
        customerAvatar: 'NA',
        lastMessage: 'Đơn hàng của tôi khi nào sẽ đến?',
        lastMessageTime: '2 phút trước',
        unreadCount: 2,
      },
      {
        id: '2',
        customerId: 2,
        customerName: 'Trần Thị B',
        customerAvatar: 'TB',
        lastMessage: 'Cảm ơn bạn đã giúp đỡ!',
        lastMessageTime: '1 giờ trước',
        unreadCount: 0,
      },
      {
        id: '3',
        customerId: 3,
        customerName: 'Lê Văn C',
        customerAvatar: 'LC',
        lastMessage: 'Sản phẩm này có màu xanh không?',
        lastMessageTime: '3 giờ trước',
        unreadCount: 1,
      },
    ];
  }

  getMockMessages(chatRoomId: string): Message[] {
    return [
      {
        id: '1',
        chatRoomId,
        senderId: 1,
        senderType: 'CUSTOMER',
        message: 'Chào bạn, tôi đã đặt hàng hôm qua',
        createdAt: new Date().toISOString(),
        isRead: true,
      },
      {
        id: '2',
        chatRoomId,
        senderId: 2,
        senderType: 'SELLER',
        message: 'Xin chào! Vâng, tôi có thể thấy đơn hàng của bạn',
        createdAt: new Date().toISOString(),
        isRead: true,
      },
    ];
  }
}

export default new ChatService();
