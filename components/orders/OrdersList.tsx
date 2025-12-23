import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '@/app/app';
import orderService, { OrderResponse } from '@/services/orderService';

export function OrdersList() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const response = await orderService.getAllOrders(0, 100);
      setOrders(response.content);
    } catch (error: any) {
      console.error('Error loading orders:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách đơn hàng');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab = activeTab === 'all' || order.status.toLowerCase() === activeTab.toLowerCase();

    return matchesSearch && matchesTab;
  });

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'pending':
        return { bg: '#fef3c7', text: '#92400e' };
      case 'processing':
        return { bg: '#dbeafe', text: '#1e40af' };
      case 'shipped':
        return { bg: '#e9d5ff', text: '#6b21a8' };
      case 'delivered':
        return { bg: '#d1fae5', text: '#065f46' };
      case 'cancelled':
        return { bg: '#fee2e2', text: '#991b1b' };
      default:
        return { bg: '#f3f4f6', text: '#1f2937' };
    }
  };

  const getStatusCount = (status: string) => {
    if (status === 'all') return orders.length;
    return orders.filter((o) => o.status.toLowerCase() === status.toLowerCase()).length;
  };

  const getStatusLabel = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'pending': return 'Chờ xử lý';
      case 'processing': return 'Đang xử lý';
      case 'shipped': return 'Đã gửi';
      case 'delivered': return 'Đã giao';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Đơn hàng</Text>
          <Text style={styles.headerSubtitle}>{orders.length} đơn hàng</Text>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm đơn hàng..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.tabActive]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
              Tất cả ({getStatusCount('all')})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
            onPress={() => setActiveTab('pending')}
          >
            <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
              Chờ xử lý ({getStatusCount('pending')})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'processing' && styles.tabActive]}
            onPress={() => setActiveTab('processing')}
          >
            <Text style={[styles.tabText, activeTab === 'processing' && styles.tabTextActive]}>
              Đang xử lý ({getStatusCount('processing')})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Orders List */}
      <ScrollView 
        style={styles.ordersList} 
        contentContainerStyle={styles.ordersContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10b981']} />
        }
      >
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>Không có đơn hàng nào</Text>
          </View>
        ) : (
          filteredOrders.map((order) => {
            const statusColor = getStatusColor(order.status);
            const totalItems = order.orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
            
            return (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => navigation.navigate('OrderDetail', { orderId: order.id.toString() })}
              >
                <View style={styles.orderHeader}>
                  <View style={styles.orderHeaderLeft}>
                    <Text style={styles.orderId}>#{order.orderNumber || order.id}</Text>
                    <Text style={styles.orderCustomer}>{order.user?.fullName || 'Khách hàng'}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: statusColor.text }]}>
                      {getStatusLabel(order.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderDetails}>
                  <View style={styles.orderDetailRow}>
                    <Ionicons name="mail-outline" size={16} color="#6b7280" />
                    <Text style={styles.orderDetailText}>{order.user?.email || 'N/A'}</Text>
                  </View>
                  <View style={styles.orderDetailRow}>
                    <Ionicons name="cube-outline" size={16} color="#6b7280" />
                    <Text style={styles.orderDetailText}>{totalItems} sản phẩm</Text>
                  </View>
                  <View style={styles.orderDetailRow}>
                    <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                    <Text style={styles.orderDetailText}>
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderFooter}>
                  <Text style={styles.orderTotal}>
                    {order.totalAmount.toLocaleString('vi-VN')} đ
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
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
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: '#ffffff',
  },
  tabText: {
    fontSize: 12,
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#111827',
    fontWeight: '500',
  },
  ordersList: {
    flex: 1,
  },
  ordersContent: {
    padding: 16,
    paddingBottom: 16,
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  orderCustomer: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderDate: {
    fontSize: 14,
    color: '#9ca3af',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  orderDetails: {
    gap: 8,
    marginBottom: 12,
  },
  orderDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderDetailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9ca3af',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
});
