import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import chatService, { 
  ConversationResponse, 
  MessageResponse 
} from '../../services/chatService';

export function Chat() {
  // State cho danh sách cuộc hội thoại
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationResponse | null>(null);
  
  // State cho tin nhắn
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [messageInput, setMessageInput] = useState('');
  
  // State cho UI
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  
  // Ref cho ScrollView
  const scrollViewRef = useRef<ScrollView>(null);

  // Load danh sách cuộc hội thoại
  const loadConversations = useCallback(async () => {
    try {
      const response = await chatService.getConversations();
      setConversations(response.content || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      // Nếu lỗi, hiển thị thông báo
      Alert.alert('Lỗi', 'Không thể tải danh sách tin nhắn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load tin nhắn của cuộc hội thoại
  const loadMessages = useCallback(async (conversationId: number) => {
    setLoadingMessages(true);
    try {
      const response = await chatService.getMessages(conversationId);
      // Đảo ngược để tin nhắn mới nhất ở dưới
      setMessages((response.content || []).reverse());
      
      // Đánh dấu đã đọc
      await chatService.markAsRead(conversationId);
      
      // Scroll xuống cuối
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Lỗi', 'Không thể tải tin nhắn. Vui lòng thử lại.');
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // Gửi tin nhắn
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || sending) return;

    const messageContent = messageInput.trim();
    setMessageInput('');
    setSending(true);

    try {
      const newMessage = await chatService.sendMessage({
        receiverId: selectedConversation.otherUserId,
        content: messageContent,
      });
      
      // Thêm tin nhắn mới vào danh sách
      setMessages(prev => [...prev, newMessage]);
      
      // Scroll xuống cuối
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      // Cập nhật last message trong danh sách conversations
      setConversations(prev => 
        prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { ...conv, lastMessage: messageContent, lastMessageAt: new Date().toISOString() }
            : conv
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Lỗi', 'Không thể gửi tin nhắn. Vui lòng thử lại.');
      // Khôi phục tin nhắn nếu gửi thất bại
      setMessageInput(messageContent);
    } finally {
      setSending(false);
    }
  };

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadConversations();
  }, [loadConversations]);

  // Load conversations khi component mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load messages khi chọn conversation
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation, loadMessages]);

  // Auto refresh messages mỗi 10 giây khi đang trong chat
  useEffect(() => {
    if (!selectedConversation) return;
    
    const interval = setInterval(() => {
      loadMessages(selectedConversation.id);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [selectedConversation, loadMessages]);

  // Filter conversations theo search
  const filteredConversations = conversations.filter((conv) =>
    conv.otherUserName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ============================================================
  // RENDER CHAT DETAIL VIEW
  // ============================================================
  if (selectedConversation) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Chat Header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity
            onPress={() => {
              setSelectedConversation(null);
              setMessages([]);
              loadConversations(); // Refresh list khi quay lại
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <View style={styles.chatHeaderAvatar}>
            <Text style={styles.chatHeaderAvatarText}>
              {chatService.getAvatarInitials(selectedConversation.otherUserName)}
            </Text>
          </View>
          <View style={styles.chatHeaderInfo}>
            <Text style={styles.chatHeaderName}>{selectedConversation.otherUserName}</Text>
            <Text style={styles.chatHeaderStatus}>
              {selectedConversation.otherUserRole === 'CUSTOMER' ? 'Khách hàng' : 'Người bán'}
            </Text>
          </View>
        </View>

        {/* Messages */}
        {loadingMessages ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>Chưa có tin nhắn</Text>
            <Text style={styles.emptySubtext}>Hãy gửi tin nhắn đầu tiên!</Text>
          </View>
        ) : (
          <ScrollView 
            ref={scrollViewRef}
            style={styles.messagesContainer} 
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
          >
            {messages.map((message) => {
              const isMyMessage = message.isOwn === true;
              
              return (
                <View
                  key={message.id}
                  style={[
                    styles.messageRow,
                    isMyMessage ? styles.messageRowRight : styles.messageRowLeft,
                  ]}
                >
                  {/* Avatar cho tin nhắn của người khác */}
                  {!isMyMessage && (
                    <View style={styles.messageAvatar}>
                      <Text style={styles.messageAvatarText}>
                        {chatService.getAvatarInitials(message.senderName || selectedConversation.otherUserName)}
                      </Text>
                    </View>
                  )}
                  
                  <View
                    style={[
                      styles.messageBubble,
                      isMyMessage ? styles.messageBubbleMine : styles.messageBubbleOther,
                    ]}
                  >
                    {/* Tên người gửi cho tin nhắn của khách */}
                    {!isMyMessage && (
                      <Text style={styles.messageSenderName}>
                        {message.senderName || selectedConversation.otherUserName}
                      </Text>
                    )}
                    
                    <Text
                      style={[
                        styles.messageText,
                        isMyMessage ? styles.messageTextMine : styles.messageTextOther,
                      ]}
                    >
                      {message.content}
                    </Text>
                    
                    <View style={styles.messageFooter}>
                      <Text
                        style={[
                          styles.messageTime,
                          isMyMessage ? styles.messageTimeMine : styles.messageTimeOther,
                        ]}
                      >
                        {chatService.formatChatTime(message.createdAt)}
                      </Text>
                      {isMyMessage && (
                        <Ionicons 
                          name={message.status === 'READ' ? 'checkmark-done' : 'checkmark'} 
                          size={14} 
                          color="rgba(255,255,255,0.7)" 
                          style={styles.messageStatusIcon}
                        />
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nhập tin nhắn..."
            value={messageInput}
            onChangeText={setMessageInput}
            multiline
            editable={!sending}
          />
          <TouchableOpacity 
            style={[styles.sendButton, sending && styles.sendButtonDisabled]} 
            onPress={handleSendMessage}
            disabled={sending || !messageInput.trim()}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons name="send" size={20} color="#ffffff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ============================================================
  // RENDER CONVERSATION LIST VIEW
  // ============================================================
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : filteredConversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'Không tìm thấy cuộc trò chuyện' : 'Chưa có tin nhắn nào'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Tin nhắn từ khách hàng sẽ xuất hiện ở đây'}
            </Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.chatList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {filteredConversations.map((conversation) => (
              <TouchableOpacity
                key={conversation.id}
                style={styles.chatItem}
                onPress={() => setSelectedConversation(conversation)}
              >
                <View style={styles.chatAvatarContainer}>
                  <View style={styles.chatAvatar}>
                    <Text style={styles.chatAvatarText}>
                      {chatService.getAvatarInitials(conversation.otherUserName)}
                    </Text>
                  </View>
                  {conversation.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.chatContent}>
                  <View style={styles.chatTopRow}>
                    <Text style={[
                      styles.chatName,
                      conversation.unreadCount > 0 && styles.chatNameUnread
                    ]}>
                      {conversation.otherUserName}
                    </Text>
                    <Text style={styles.chatTime}>
                      {chatService.formatMessageTime(conversation.lastMessageAt)}
                    </Text>
                  </View>
                  <Text 
                    style={[
                      styles.chatMessage,
                      conversation.unreadCount > 0 && styles.chatMessageUnread
                    ]} 
                    numberOfLines={1}
                  >
                    {conversation.lastMessage || 'Chưa có tin nhắn'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
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
  // Loading & Empty states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  // Chat list
  chatList: {
    flex: 1,
    paddingBottom: 16,
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
    minWidth: 20,
    height: 20,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
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
    fontWeight: '500',
    color: '#111827',
  },
  chatNameUnread: {
    fontWeight: '700',
  },
  chatTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  chatMessage: {
    fontSize: 14,
    color: '#6b7280',
  },
  chatMessageUnread: {
    color: '#111827',
    fontWeight: '500',
  },
  // Chat detail header
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
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
  // Messages
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  messagesContent: {
    paddingVertical: 16,
    paddingBottom: 24,
  },
  // Message Row - kiểu Zalo/Messenger
  messageRow: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingHorizontal: 12,
    alignItems: 'flex-end',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  messageRowLeft: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    backgroundColor: '#dbeafe',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  messageAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
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
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  messageBubbleMine: {
    backgroundColor: '#2563eb',
    borderBottomRightRadius: 4,
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  messageBubbleOther: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18,
    borderBottomRightRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  messageBubbleSeller: {
    backgroundColor: '#2563eb',
  },
  messageBubbleCustomer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  messageSenderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  messageTextMine: {
    color: '#ffffff',
  },
  messageTextOther: {
    color: '#1f2937',
  },
  messageTextSeller: {
    color: '#ffffff',
  },
  messageTextCustomer: {
    color: '#111827',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
  },
  messageTimeMine: {
    color: 'rgba(255,255,255,0.7)',
  },
  messageTimeOther: {
    color: '#9ca3af',
  },
  messageTimeSeller: {
    color: '#bfdbfe',
  },
  messageTimeCustomer: {
    color: '#9ca3af',
  },
  messageStatusIcon: {
    marginLeft: 4,
  },
  // Input
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
  sendButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
});
