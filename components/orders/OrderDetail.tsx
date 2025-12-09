import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

interface OrderDetailProps {
  route: {
    params: {
      orderId: string;
    };
  };
}

export function OrderDetail({ route }: OrderDetailProps) {
  const navigation = useNavigation();
  const { orderId } = route.params;
  const [orderStatus, setOrderStatus] = useState('processing');

  // Mock order data - in real app, would fetch by orderId
  const order = {
    id: orderId,
    customerName: 'John Smith',
    customerEmail: 'john@example.com',
    customerPhone: '+1 555-0001',
    customerAddress: '123 Main St, Apt 4B, New York, NY 10001',
    status: orderStatus,
    total: 125.0,
    subtotal: 115.0,
    shipping: 10.0,
    date: '2025-12-02 10:30 AM',
    items: [
      {
        id: '1',
        name: 'Wireless Headphones',
        quantity: 1,
        price: 89.99,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop',
      },
      {
        id: '2',
        name: 'Phone Case',
        quantity: 1,
        price: 25.01,
        image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=100&h=100&fit=crop',
      },
    ],
  };

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

  const statusColor = getStatusColor(order.status);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Đơn hàng #{order.id}</Text>
            <Text style={styles.headerDate}>{order.date}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
            <Text style={[styles.statusBadgeText, { color: statusColor.text }]}>
              {order.status}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Customer Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thông tin khách hàng</Text>
          <View style={styles.customerInfo}>
            <View style={styles.customerHeader}>
              <View style={styles.customerAvatar}>
                <Text style={styles.customerAvatarText}>JS</Text>
              </View>
              <View style={styles.customerDetails}>
                <Text style={styles.customerName}>{order.customerName}</Text>
                <View style={styles.contactItem}>
                  <Ionicons name="mail-outline" size={16} color="#6b7280" />
                  <Text style={styles.contactText}>{order.customerEmail}</Text>
                </View>
                <View style={styles.contactItem}>
                  <Ionicons name="call-outline" size={16} color="#6b7280" />
                  <Text style={styles.contactText}>{order.customerPhone}</Text>
                </View>
                <View style={styles.contactItem}>
                  <Ionicons name="location-outline" size={16} color="#6b7280" />
                  <Text style={styles.contactText}>{order.customerAddress}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sản phẩm đặt hàng</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>SL: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tạm tính</Text>
              <Text style={styles.priceValue}>${order.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Phí vận chuyển</Text>
              <Text style={styles.priceValue}>${order.shipping.toFixed(2)}</Text>
            </View>
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>${order.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Update Status */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cập nhật trạng thái đơn hàng</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={orderStatus}
              onValueChange={(itemValue) => setOrderStatus(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Chờ xử lý" value="pending" />
              <Picker.Item label="Đang xử lý" value="processing" />
              <Picker.Item label="Đã gửi hàng" value="shipped" />
              <Picker.Item label="Đã giao hàng" value="delivered" />
              <Picker.Item label="Đã hủy" value="cancelled" />
            </Picker>
          </View>
          <TouchableOpacity style={styles.updateButton}>
            <Text style={styles.updateButtonText}>Cập nhật trạng thái</Text>
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Chat' as never)}
          >
            <Text style={styles.actionButtonText}>Liên hệ khách hàng</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>In hóa đơn</Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  customerInfo: {
    gap: 12,
  },
  customerHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  customerAvatar: {
    width: 40,
    height: 40,
    backgroundColor: '#dbeafe',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  customerDetails: {
    flex: 1,
    gap: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  orderItem: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#9ca3af',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    alignSelf: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  priceBreakdown: {
    gap: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  totalRow: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 12,
  },
  picker: {
    height: 50,
  },
  updateButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
});
