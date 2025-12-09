import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../app/app';

export function Dashboard() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const stats = [
    {
      title: 'Tổng Doanh Thu',
      value: '$12,458',
      icon: 'cash-outline',
      change: '+12.5%',
      bgColor: '#eff6ff',
      iconColor: '#2563eb',
    },
    {
      title: 'Tổng Đơn Hàng',
      value: '156',
      icon: 'bag-outline',
      change: '+8.2%',
      bgColor: '#f0fdf4',
      iconColor: '#16a34a',
    },
    {
      title: 'Doanh Thu Hôm Nay',
      value: '$842',
      icon: 'trending-up-outline',
      change: '+15.3%',
      bgColor: '#faf5ff',
      iconColor: '#9333ea',
    },
    {
      title: 'Sản Phẩm',
      value: '48',
      icon: 'cube-outline',
      change: '+2',
      bgColor: '#fff7ed',
      iconColor: '#ea580c',
    },
  ];

  const recentOrders = [
    { id: '#ORD-001', customer: 'John Smith', amount: '$125.00', status: 'pending' },
    { id: '#ORD-002', customer: 'Sarah Johnson', amount: '$89.50', status: 'processing' },
    { id: '#ORD-003', customer: 'Mike Davis', amount: '$245.00', status: 'shipped' },
    { id: '#ORD-004', customer: 'Emily Brown', amount: '$67.25', status: 'delivered' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: '#fef3c7', text: '#92400e' };
      case 'processing':
        return { bg: '#dbeafe', text: '#1e40af' };
      case 'shipped':
        return { bg: '#e9d5ff', text: '#6b21a8' };
      case 'delivered':
        return { bg: '#d1fae5', text: '#065f46' };
      default:
        return { bg: '#f3f4f6', text: '#1f2937' };
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bảng Điều Khiển</Text>
        <Text style={styles.subtitle}>Chào mừng trở lại! Đây là tổng quan cửa hàng của bạn</Text>
      </View>

      <View style={styles.content}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.bgColor }]}>
                <Ionicons name={stat.icon as any} size={20} color={stat.iconColor} />
              </View>
              <Text style={styles.statTitle}>{stat.title}</Text>
              <View style={styles.statRow}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statChange}>{stat.change}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Recent Orders */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Đơn Hàng Gần Đây</Text>
            <TouchableOpacity onPress={() => navigation.navigate('OrdersTab' as never)}>
              <Text style={styles.linkText}>Xem Tất Cả</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.ordersList}>
            {recentOrders.map((order, index) => {
              const statusColors = getStatusColor(order.status);
              return (
                <TouchableOpacity
                  key={order.id}
                  style={[styles.orderItem, index < recentOrders.length - 1 && styles.orderBorder]}
                  onPress={() => navigation.navigate('OrderDetail', { orderId: order.id.replace('#', '') })}
                >
                  <View style={styles.orderLeft}>
                    <Text style={styles.orderId}>{order.id}</Text>
                    <Text style={styles.orderCustomer}>{order.customer}</Text>
                  </View>
                  <View style={styles.orderRight}>
                    <Text style={styles.orderAmount}>{order.amount}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                      <Text style={[styles.statusText, { color: statusColors.text }]}>
                        {order.status}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
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
});
