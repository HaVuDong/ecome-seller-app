import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '@/app/app';
import { useAuth } from '@/contexts/AuthContext';
import orderService, { OrderResponse } from '@/services/orderService';
import productService from '@/services/productService';

export function Dashboard() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState<OrderResponse[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    todayRevenue: 0,
    totalProducts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const [ordersData, productsData] = await Promise.all([
        orderService.getOrdersBySeller(user.id, 0, 5),
        productService.getAllProducts(0, 100),
      ]);
      
      setRecentOrders(ordersData.content);
      
      // Tính toán stats
      const totalRevenue = ordersData.content.reduce((sum, order) => 
        order.status === 'DELIVERED' ? sum + order.totalAmount : sum, 0
      );
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayRevenue = ordersData.content
        .filter(order => {
          const orderDate = new Date(order.createdAt);
          orderDate.setHours(0, 0, 0, 0);
          return orderDate.getTime() === today.getTime() && order.status === 'DELIVERED';
        })
        .reduce((sum, order) => sum + order.totalAmount, 0);
      
      setStats({
        totalRevenue,
        totalOrders: ordersData.totalElements,
        todayRevenue,
        totalProducts: productsData.totalElements,
      });
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statsConfig = [
    {
      title: 'Tổng Doanh Thu',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: 'cash-outline',
      bgColor: '#eff6ff',
      iconColor: '#2563eb',
    },
    {
      title: 'Tổng Đơn Hàng',
      value: stats.totalOrders.toString(),
      icon: 'bag-outline',
      bgColor: '#f0fdf4',
      iconColor: '#16a34a',
    },
    {
      title: 'Doanh Thu Hôm Nay',
      value: `$${stats.todayRevenue.toFixed(2)}`,
      icon: 'trending-up-outline',
      bgColor: '#faf5ff',
      iconColor: '#9333ea',
    },
    {
      title: 'Sản Phẩm',
      value: stats.totalProducts.toString(),
      icon: 'cube-outline',
      bgColor: '#fff7ed',
      iconColor: '#ea580c',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { bg: '#fef3c7', text: '#92400e' };
      case 'PROCESSING':
        return { bg: '#dbeafe', text: '#1e40af' };
      case 'SHIPPED':
        return { bg: '#e9d5ff', text: '#6b21a8' };
      case 'DELIVERED':
        return { bg: '#d1fae5', text: '#065f46' };
      default:
        return { bg: '#f3f4f6', text: '#1f2937' };
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Chờ',
      PROCESSING: 'Đang xử lý',
      SHIPPED: 'Đang giao',
      DELIVERED: 'Đã giao',
      CANCELLED: 'Đã hủy',
    };
    return labels[status] || status;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Bảng Điều Khiển</Text>
          <Text style={styles.subtitle}>Chào mừng trở lại! Đây là tổng quan cửa hàng của bạn</Text>
        </View>

      <View style={styles.content}>
        {/* Stats Grid */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : (
          <View style={styles.statsGrid}>
            {statsConfig.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: stat.bgColor }]}>
                  <Ionicons name={stat.icon as any} size={20} color={stat.iconColor} />
                </View>
                <Text style={styles.statTitle}>{stat.title}</Text>
                <View style={styles.statRow}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Recent Orders */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Đơn Hàng Gần Đây</Text>
            <TouchableOpacity onPress={() => navigation.navigate('OrdersTab' as never)}>
              <Text style={styles.linkText}>Xem Tất Cả</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.ordersList}>
            {recentOrders.length === 0 ? (
              <View style={styles.emptyOrders}>
                <Text style={styles.emptyOrdersText}>Chưa có đơn hàng nào</Text>
              </View>
            ) : (
              recentOrders.map((order, index) => {
                const statusColors = getStatusColor(order.status);
                return (
                  <TouchableOpacity
                    key={order.id}
                    style={[styles.orderItem, index < recentOrders.length - 1 && styles.orderBorder]}
                    onPress={() => navigation.navigate('OrderDetail', { orderId: order.id.toString() })}
                  >
                    <View style={styles.orderLeft}>
                      <Text style={styles.orderId}>#{order.orderNumber}</Text>
                      <Text style={styles.orderCustomer}>{order.user?.fullName || 'Khách hàng'}</Text>
                    </View>
                    <View style={styles.orderRight}>
                      <Text style={styles.orderAmount}>${order.totalAmount.toFixed(2)}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                        <Text style={[styles.statusText, { color: statusColors.text }]}>
                          {getStatusLabel(order.status)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={() => navigation.navigate('AddProduct' as never)}
          >
            <Ionicons name="cube-outline" size={24} color="#ffffff" />
            <Text style={styles.primaryActionText}>Thêm Sản Phẩm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryAction}
            onPress={() => navigation.navigate('OrdersTab' as never)}
          >
            <Ionicons name="bag-outline" size={24} color="#2563eb" />
            <Text style={styles.secondaryActionText}>Xem Đơn Hàng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
    paddingBottom: 16,
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  content: {
    padding: 24,
    gap: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  statChange: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  linkText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  ordersList: {
    padding: 0,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  orderBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  orderLeft: {
    flex: 1,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  orderCustomer: {
    fontSize: 13,
    color: '#6b7280',
  },
  orderRight: {
    alignItems: 'flex-end',
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  primaryAction: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  primaryActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryAction: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2563eb',
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyOrders: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyOrdersText: {
    fontSize: 14,
    color: '#9ca3af',
  },
});
