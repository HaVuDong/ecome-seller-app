/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '@/app/app';
import { useAuth } from '@/contexts/AuthContext';
import dashboardService, { DashboardResponse, TopProduct, RecentOrder } from '@/services/dashboardService';

const { width } = Dimensions.get('window');

export function Dashboard() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [user?.id])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData(true);
    setRefreshing(false);
  }, [user?.id]);

  const loadDashboardData = async (silent = false) => {
    if (!user) return;
    
    try {
      if (!silent) setIsLoading(true);
      const response = await dashboardService.getSellerDashboard();
      if (response.success) {
        setDashboard(response.data);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return { bg: '#fef3c7', text: '#92400e' };
      case 'PROCESSING': return { bg: '#dbeafe', text: '#1e40af' };
      case 'SHIPPED': return { bg: '#e9d5ff', text: '#6b21a8' };
      case 'DELIVERED': return { bg: '#d1fae5', text: '#065f46' };
      case 'CANCELLED': return { bg: '#fee2e2', text: '#991b1b' };
      default: return { bg: '#f3f4f6', text: '#1f2937' };
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Chờ xử lý',
      PROCESSING: 'Đang xử lý',
      SHIPPED: 'Đang giao',
      DELIVERED: 'Đã giao',
      CANCELLED: 'Đã hủy',
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={['#2563eb', '#1d4ed8', '#1e40af']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.welcomeText}>Xin chào,</Text>
              <Text style={styles.userName}>{user?.fullName || 'Seller'}</Text>
            </View>
            <TouchableOpacity style={styles.notificationBtn}>
              <Ionicons name="notifications-outline" size={24} color="#ffffff" />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationCount}>{dashboard?.pendingOrders || 0}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Revenue Card */}
          <View style={styles.revenueCard}>
            <View style={styles.revenueRow}>
              <View style={styles.revenueItem}>
                <Text style={styles.revenueLabel}>Tổng doanh thu</Text>
                <Text style={styles.revenueValue}>{formatCurrency(dashboard?.totalRevenue || 0)}</Text>
              </View>
              <View style={styles.revenueDivider} />
              <View style={styles.revenueItem}>
                <Text style={styles.revenueLabel}>Thực nhận</Text>
                <Text style={styles.revenueValueGreen}>{formatCurrency(dashboard?.netRevenue || 0)}</Text>
              </View>
            </View>
            <View style={styles.platformFeeRow}>
              <Ionicons name="information-circle-outline" size={14} color="#9ca3af" />
              <Text style={styles.platformFeeText}>
                Phí sàn: {formatCurrency(dashboard?.platformFee || 0)} (5%)
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <TouchableOpacity 
              style={styles.statCard}
              onPress={() => navigation.navigate('ProductsTab' as never)}
            >
              <View style={[styles.statIcon, { backgroundColor: '#eff6ff' }]}>
                <Ionicons name="cube-outline" size={22} color="#2563eb" />
              </View>
              <Text style={styles.statValue}>{dashboard?.totalProducts || 0}</Text>
              <Text style={styles.statTitle}>Sản phẩm</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.statCard}
              onPress={() => navigation.navigate('OrdersTab' as never)}
            >
              <View style={[styles.statIcon, { backgroundColor: '#f0fdf4' }]}>
                <Ionicons name="bag-handle-outline" size={22} color="#16a34a" />
              </View>
              <Text style={styles.statValue}>{dashboard?.totalOrders || 0}</Text>
              <Text style={styles.statTitle}>Đơn hàng</Text>
            </TouchableOpacity>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="star-outline" size={22} color="#f59e0b" />
              </View>
              <Text style={styles.statValue}>{dashboard?.averageRating?.toFixed(1) || '0.0'}</Text>
              <Text style={styles.statTitle}>Đánh giá</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#fce7f3' }]}>
                <Ionicons name="chatbubble-outline" size={22} color="#ec4899" />
              </View>
              <Text style={styles.statValue}>{dashboard?.totalReviews || 0}</Text>
              <Text style={styles.statTitle}>Nhận xét</Text>
            </View>
          </View>

          {/* Order Status Overview */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Trạng thái đơn hàng</Text>
            <View style={styles.orderStatusGrid}>
              <View style={styles.orderStatusItem}>
                <View style={[styles.orderStatusIcon, { backgroundColor: '#fef3c7' }]}>
                  <Text style={styles.orderStatusCount}>{dashboard?.pendingOrders || 0}</Text>
                </View>
                <Text style={styles.orderStatusLabel}>Chờ xử lý</Text>
              </View>
              <View style={styles.orderStatusItem}>
                <View style={[styles.orderStatusIcon, { backgroundColor: '#dbeafe' }]}>
                  <Text style={styles.orderStatusCount}>{dashboard?.processingOrders || 0}</Text>
                </View>
                <Text style={styles.orderStatusLabel}>Đang xử lý</Text>
              </View>
              <View style={styles.orderStatusItem}>
                <View style={[styles.orderStatusIcon, { backgroundColor: '#e9d5ff' }]}>
                  <Text style={styles.orderStatusCount}>{dashboard?.shippedOrders || 0}</Text>
                </View>
                <Text style={styles.orderStatusLabel}>Đang giao</Text>
              </View>
              <View style={styles.orderStatusItem}>
                <View style={[styles.orderStatusIcon, { backgroundColor: '#d1fae5' }]}>
                  <Text style={styles.orderStatusCount}>{dashboard?.deliveredOrders || 0}</Text>
                </View>
                <Text style={styles.orderStatusLabel}>Hoàn thành</Text>
              </View>
            </View>
          </View>

          {/* Top Products */}
          {dashboard?.topProducts && dashboard.topProducts.length > 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Sản phẩm bán chạy</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ProductsTab' as never)}>
                  <Text style={styles.seeAllText}>Xem tất cả</Text>
                </TouchableOpacity>
              </View>
              {dashboard.topProducts.slice(0, 5).map((product: TopProduct, index: number) => (
                <View key={product.productId} style={styles.topProductItem}>
                  <View style={styles.topProductRank}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>
                  <Image
                    source={{ uri: product.mainImage || 'https://via.placeholder.com/50' }}
                    style={styles.topProductImage}
                  />
                  <View style={styles.topProductInfo}>
                    <Text style={styles.topProductName} numberOfLines={1}>
                      {product.productName}
                    </Text>
                    <Text style={styles.topProductSales}>
                      Đã bán: {product.totalQuantitySold} | {formatCurrency(product.totalRevenue)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Recent Orders */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Đơn hàng gần đây</Text>
              <TouchableOpacity onPress={() => navigation.navigate('OrdersTab' as never)}>
                <Text style={styles.seeAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            {!dashboard?.recentOrders || dashboard.recentOrders.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="bag-outline" size={48} color="#d1d5db" />
                <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
              </View>
            ) : (
              dashboard.recentOrders.slice(0, 5).map((order: RecentOrder) => {
                const statusColors = getStatusColor(order.shippingStatus);
                return (
                  <TouchableOpacity
                    key={order.orderId}
                    style={styles.orderItem}
                    onPress={() => navigation.navigate('OrderDetail', { orderId: order.orderId.toString() })}
                  >
                    <View style={styles.orderItemLeft}>
                      <Text style={styles.orderCode}>#{order.orderCode}</Text>
                      <Text style={styles.orderCustomer}>{order.customerName}</Text>
                      <Text style={styles.orderDate}>
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </Text>
                    </View>
                    <View style={styles.orderItemRight}>
                      <Text style={styles.orderAmount}>{formatCurrency(order.sellerAmount)}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                        <Text style={[styles.statusText, { color: statusColors.text }]}>
                          {getStatusLabel(order.shippingStatus)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.primaryAction}
              onPress={() => navigation.navigate('AddProduct' as never)}
            >
              <LinearGradient
                colors={['#2563eb', '#1d4ed8']}
                style={styles.primaryActionGradient}
              >
                <Ionicons name="add-circle-outline" size={24} color="#ffffff" />
                <Text style={styles.primaryActionText}>Thêm sản phẩm mới</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={() => navigation.navigate('OrdersTab' as never)}
            >
              <Ionicons name="list-outline" size={24} color="#2563eb" />
              <Text style={styles.secondaryActionText}>Quản lý đơn hàng</Text>
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
    backgroundColor: '#2563eb',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  headerGradient: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 80,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {},
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationCount: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  revenueCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
  },
  revenueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  revenueItem: {
    flex: 1,
  },
  revenueLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  revenueValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  revenueValueGreen: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#86efac',
  },
  revenueDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 16,
  },
  platformFeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    gap: 6,
  },
  platformFeeText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  content: {
    marginTop: -50,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 44) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  orderStatusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  orderStatusItem: {
    alignItems: 'center',
    flex: 1,
  },
  orderStatusIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  orderStatusCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  orderStatusLabel: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
  },
  topProductItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  topProductRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  topProductImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f3f4f6',
  },
  topProductInfo: {
    flex: 1,
  },
  topProductName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  topProductSales: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9ca3af',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  orderItemLeft: {
    flex: 1,
  },
  orderCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  orderCustomer: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  orderDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  orderItemRight: {
    alignItems: 'flex-end',
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryAction: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  primaryActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  primaryActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#2563eb',
    paddingVertical: 14,
    gap: 8,
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
});
