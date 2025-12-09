import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '@/app/app';

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  status: string;
  total: number;
  date: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
}

export function OrdersList() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const orders: Order[] = [
    {
      id: 'ORD-001',
      customerName: 'John Smith',
      customerEmail: 'john@example.com',
      customerPhone: '+1 555-0001',
      customerAddress: '123 Main St, New York, NY 10001',
      status: 'pending',
      total: 125.0,
      date: '2025-12-02',
      items: [
        { productId: '1', productName: 'Wireless Headphones', quantity: 1, price: 89.99 },
        { productId: '2', productName: 'Phone Case', quantity: 1, price: 35.01 },
      ],
    },
    {
      id: 'ORD-002',
      customerName: 'Sarah Johnson',
      customerEmail: 'sarah@example.com',
      customerPhone: '+1 555-0002',
      customerAddress: '456 Oak Ave, Los Angeles, CA 90001',
      status: 'processing',
      total: 89.5,
      date: '2025-12-01',
      items: [{ productId: '3', productName: 'Leather Backpack', quantity: 1, price: 89.5 }],
    },
    {
      id: 'ORD-003',
      customerName: 'Mike Davis',
      customerEmail: 'mike@example.com',
      customerPhone: '+1 555-0003',
      customerAddress: '789 Pine Rd, Chicago, IL 60601',
      status: 'shipped',
      total: 245.0,
      date: '2025-11-30',
      items: [
        { productId: '2', productName: 'Smart Watch', quantity: 1, price: 199.99 },
        { productId: '4', productName: 'Screen Protector', quantity: 1, price: 45.01 },
      ],
    },
    {
      id: 'ORD-004',
      customerName: 'Emily Brown',
      customerEmail: 'emily@example.com',
      customerPhone: '+1 555-0004',
      customerAddress: '321 Elm St, Houston, TX 77001',
      status: 'delivered',
      total: 67.25,
      date: '2025-11-29',
      items: [{ productId: '5', productName: 'USB Cable', quantity: 3, price: 67.25 }],
    },
    {
      id: 'ORD-005',
      customerName: 'David Wilson',
      customerEmail: 'david@example.com',
      customerPhone: '+1 555-0005',
      customerAddress: '654 Maple Dr, Phoenix, AZ 85001',
      status: 'cancelled',
      total: 159.99,
      date: '2025-11-28',
      items: [{ productId: '6', productName: 'Bluetooth Speaker', quantity: 1, price: 159.99 }],
    },
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab = activeTab === 'all' || order.status === activeTab;

    return matchesSearch && matchesTab;
  });

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
      case 'cancelled':
        return { bg: '#fee2e2', text: '#991b1b' };
      default:
        return { bg: '#f3f4f6', text: '#1f2937' };
    }
  };

  const getStatusCount = (status: string) => {
    if (status === 'all') return orders.length;
    return orders.filter((o) => o.status === status).length;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
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
      <ScrollView style={styles.ordersList} contentContainerStyle={styles.ordersContent}>
        {filteredOrders.map((order) => {
          const statusColor = getStatusColor(order.status);
          return (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
            >
              <View style={styles.orderHeader}>
                <View style={styles.orderHeaderLeft}>
                  <Text style={styles.orderId}>{order.id}</Text>
                  <Text style={styles.orderCustomer}>{order.customerName}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                  <Text style={[styles.statusBadgeText, { color: statusColor.text }]}>
                    {order.status === 'pending' ? 'Chờ xử lý' : 
                     order.status === 'processing' ? 'Đang xử lý' : 
                     order.status === 'shipped' ? 'Đã gửi' : 
                     order.status === 'delivered' ? 'Đã giao' : 
                     order.status === 'cancelled' ? 'Đã hủy' : order.status}
                  </Text>
                </View>
              </View>
              <View style={styles.orderFooter}>
                <Text style={styles.orderDate}>{order.date}</Text>
                <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {filteredOrders.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Không tìm thấy đơn hàng</Text>
          </View>
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
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9ca3af',
  },
});
