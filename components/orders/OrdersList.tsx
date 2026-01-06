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
import { useAuth } from '@/contexts/AuthContext';
import orderService, { 
  OrderResponse, 
  PaymentStatus, 
  ShippingStatus,
  PAYMENT_STATUS_LABELS,
  SHIPPING_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  SHIPPING_STATUS_COLORS,
} from '@/services/orderService';

export function OrdersList() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadOrders();
    }
  }, [user?.id]);

  const loadOrders = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      // Sử dụng API mới - backend lấy seller từ JWT
      const response = await orderService.getMyOrders(0, 100);
      if (response.success) {
        setOrders(response.data.content);
      }
    } catch (error: any) {
      // Fallback to old API
      try {
        const response = await orderService.getOrdersBySeller(user.id, 0, 100);
        setOrders(response.content);
      } catch {
        console.error('Error loading orders:', error);
        Alert.alert('Lỗi', 'Không thể tải danh sách đơn hàng');
      }
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
      order.id?.toString().includes(searchQuery) ||
      order.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter theo tab (sử dụng shippingStatus thay vì status cũ)
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && order.shippingStatus?.toLowerCase() === activeTab.toLowerCase();
  });

  // Màu sắc cho trạng thái thanh toán
  const getPaymentStatusColor = (status: PaymentStatus) => {
    return PAYMENT_STATUS_COLORS[status] || '#6b7280';
  };

  // Màu sắc cho trạng thái vận chuyển
  const getShippingStatusColor = (status: ShippingStatus) => {
    return SHIPPING_STATUS_COLORS[status] || '#6b7280';
  };

  const getStatusCount = (status: string) => {
    if (status === 'all') return orders.length;
    return orders.filter((o) => o.shippingStatus?.toLowerCase() === status.toLowerCase()).length;
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

        {/* Tabs - Filter theo trạng thái vận chuyển */}
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
            style={[styles.tab, activeTab === 'shipped' && styles.tabActive]}
            onPress={() => setActiveTab('shipped')}
          >
            <Text style={[styles.tabText, activeTab === 'shipped' && styles.tabTextActive]}>
              Đang giao ({getStatusCount('shipped')})
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
            const paymentColor = getPaymentStatusColor(order.paymentStatus);
            const shippingColor = getShippingStatusColor(order.shippingStatus);
            const totalItems = order.orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
            
            return (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => navigation.navigate('OrderDetail', { orderId: order.id.toString() })}
              >
                <View style={styles.orderHeader}>
                  <View style={styles.orderHeaderLeft}>
                    <Text style={styles.orderId}>#{order.id}</Text>
                    <Text style={styles.orderCustomer}>{order.user?.fullName || 'Khách hàng'}</Text>
                  </View>
                  {/* Hiển thị 2 badge cho 2 trạng thái */}
                  <View style={styles.statusBadges}>
                    <View style={[styles.statusBadge, { backgroundColor: paymentColor + '20' }]}>
                      <Ionicons name="card-outline" size={12} color={paymentColor} />
                      <Text style={[styles.statusBadgeText, { color: paymentColor }]}>
                        {PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: shippingColor + '20' }]}>
                      <Ionicons name="car-outline" size={12} color={shippingColor} />
                      <Text style={[styles.statusBadgeText, { color: shippingColor }]}>
                        {SHIPPING_STATUS_LABELS[order.shippingStatus] || order.shippingStatus}
                      </Text>
                    </View>
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
                    {(order.finalAmount || order.totalAmount).toLocaleString('vi-VN')} đ
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusBadges: {
    flexDirection: 'column',
    gap: 4,
    alignItems: 'flex-end',
  },
  statusBadgeText: {
    fontSize: 11,
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
