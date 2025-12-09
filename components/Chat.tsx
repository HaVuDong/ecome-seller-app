import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface ChatRoom {
  id: string;
  customerName: string;
  customerAvatar: string;
  lastMessage: string;
  time: string;
  unread: number;
}

interface Message {
  id: string;
  text: string;
  sender: 'customer' | 'seller';
  time: string;
}

export function Chat() {
  const navigation = useNavigation();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');

  const chatRooms: ChatRoom[] = [
    {
      id: '1',
      customerName: 'Nguyễn Văn A',
      customerAvatar: 'NA',
      lastMessage: 'Đơn hàng của tôi khi nào sẽ đến?',
      time: '2 phút trước',
      unread: 2,
    },
    {
      id: '2',
      customerName: 'Trần Thị B',
      customerAvatar: 'TB',
      lastMessage: 'Cảm ơn bạn đã giúp đỡ!',
      time: '1 giờ trước',
      unread: 0,
    },
    {
      id: '3',
      customerName: 'Lê Văn C',
      customerAvatar: 'LC',
      lastMessage: 'Sản phẩm này có màu xanh không?',
      time: '3 giờ trước',
      unread: 1,
    },
  ];

  const messages: Message[] = [
    {
      id: '1',
      text: 'Chào bạn, tôi đã đặt hàng hôm qua',
      sender: 'customer',
      time: '10:30 SA',
    },
    {
      id: '2',
      text: 'Xin chào! Vâng, tôi có thể thấy đơn hàng #ORD-001 của bạn',
      sender: 'seller',
      time: '10:32 SA',
    },
    {
      id: '3',
      text: 'Đơn hàng của tôi khi nào sẽ đến?',
      sender: 'customer',
      time: '10:33 SA',
    },
    {
      id: '4',
      text: 'Đơn hàng của bạn hiện đang được xử lý và sẽ được giao trong vòng 24 giờ. Dự kiến giao hàng trong 3-5 ngày làm việc.',
      sender: 'seller',
      time: '10:35 SA',
    },
  ];

  const filteredChats = chatRooms.filter((chat) =>
    chat.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Handle send message
      setMessageInput('');
    }
  };

  if (selectedChat) {
    const currentChat = chatRooms.find((c) => c.id === selectedChat);

    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Chat Header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity
            onPress={() => setSelectedChat(null)}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <View style={styles.chatHeaderAvatar}>
            <Text style={styles.chatHeaderAvatarText}>
              {currentChat?.customerAvatar}
            </Text>
          </View>
          <View style={styles.chatHeaderInfo}>
            <Text style={styles.chatHeaderName}>{currentChat?.customerName}</Text>
            <Text style={styles.chatHeaderStatus}>Trực tuyến</Text>
          </View>
        </View>

        {/* Messages */}
        <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageWrapper,
                message.sender === 'seller' ? styles.messageWrapperSeller : styles.messageWrapperCustomer,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  message.sender === 'seller' ? styles.messageBubbleSeller : styles.messageBubbleCustomer,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.sender === 'seller' ? styles.messageTextSeller : styles.messageTextCustomer,
                  ]}
                >
                  {message.text}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    message.sender === 'seller' ? styles.messageTimeSeller : styles.messageTimeCustomer,
                  ]}
                >
                  {message.time}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nhập tin nhắn..."
            value={messageInput}
            onChangeText={setMessageInput}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Ionicons name="send" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tin nhắn</Text>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm cuộc trò chuyện..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Chat List */}
      <ScrollView style={styles.chatList}>
        {filteredChats.map((chat) => (
          <TouchableOpacity
            key={chat.id}
            style={styles.chatItem}
            onPress={() => setSelectedChat(chat.id)}
          >
            <View style={styles.chatAvatarContainer}>
              <View style={styles.chatAvatar}>
                <Text style={styles.chatAvatarText}>{chat.customerAvatar}</Text>
              </View>
              {chat.unread > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{chat.unread}</Text>
                </View>
              )}
            </View>
            <View style={styles.chatContent}>
              <View style={styles.chatTopRow}>
                <Text style={styles.chatName}>{chat.customerName}</Text>
                <Text style={styles.chatTime}>{chat.time}</Text>
              </View>
              <Text style={styles.chatMessage} numberOfLines={1}>
                {chat.lastMessage}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  chatAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  chatAvatar: {
    width: 48,
    height: 48,
    backgroundColor: '#dbeafe',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  chatContent: {
    flex: 1,
  },
  chatTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  chatTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  chatMessage: {
    fontSize: 14,
    color: '#6b7280',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  chatHeaderAvatar: {
    width: 40,
    height: 40,
    backgroundColor: '#dbeafe',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  chatHeaderAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  chatHeaderStatus: {
    fontSize: 12,
    color: '#16a34a',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  messagesContent: {
    padding: 16,
  },
  messageWrapper: {
    marginBottom: 16,
  },
  messageWrapperSeller: {
    alignItems: 'flex-end',
  },
  messageWrapperCustomer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  messageBubbleSeller: {
    backgroundColor: '#2563eb',
  },
  messageBubbleCustomer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  messageText: {
    fontSize: 14,
    marginBottom: 4,
  },
  messageTextSeller: {
    color: '#ffffff',
  },
  messageTextCustomer: {
    color: '#111827',
  },
  messageTime: {
    fontSize: 10,
  },
  messageTimeSeller: {
    color: '#bfdbfe',
  },
  messageTimeCustomer: {
    color: '#9ca3af',
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 12,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    backgroundColor: '#2563eb',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
