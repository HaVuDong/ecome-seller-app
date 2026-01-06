import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import orderService, { 
  OrderResponse, 
  PaymentStatus, 
  ShippingStatus,
  PAYMENT_STATUS_LABELS,
  SHIPPING_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  SHIPPING_STATUS_COLORS,
} from '@/services/orderService';

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
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('PENDING');
  const [shippingStatus, setShippingStatus] = useState<ShippingStatus>('PENDING');

  useEffect(() => {
    loadOrderDetail();
  }, [orderId]);

  const loadOrderDetail = async () => {
    try {
      setIsLoading(true);
      const data = await orderService.getOrderById(Number(orderId));
      setOrder(data);
      setPaymentStatus(data.paymentStatus || 'PENDING');
      setShippingStatus(data.shippingStatus || 'PENDING');
    } catch (error: any) {
      console.error('Error loading order detail:', error);
      Alert.alert('Lỗi', 'Không thể tải chi tiết đơn hàng');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  // Cập nhật trạng thái thanh toán
  const handlePaymentStatusChange = async (newStatus: PaymentStatus) => {
    if (!order) return;
    
    try {
      await orderService.updatePaymentStatus(order.id, newStatus);
      setPaymentStatus(newStatus);
      Alert.alert('Thành công', 'Đã cập nhật trạng thái thanh toán');
      loadOrderDetail();
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái thanh toán');
    }
  };

  // Cập nhật trạng thái vận chuyển
  const handleShippingStatusChange = async (newStatus: ShippingStatus) => {
    if (!order) return;
    
    try {
      await orderService.updateShippingStatus(order.id, newStatus);
      setShippingStatus(newStatus);
      Alert.alert('Thành công', 'Đã cập nhật trạng thái vận chuyển');
      loadOrderDetail();
    } catch (error: any) {
      console.error('Error updating shipping status:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái vận chuyển');
    }
  };

  if (isLoading || !order) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Đang tải chi tiết...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const paymentColor = PAYMENT_STATUS_COLORS[paymentStatus] || '#6b7280';
  const shippingColor = SHIPPING_STATUS_COLORS[shippingStatus] || '#6b7280';
  const totalItems = order.orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Đơn hàng #{order.id}</Text>
              <Text style={styles.headerDate}>
                {new Date(order.createdAt).toLocaleString('vi-VN')}
              </Text>
            </View>
            {/* Hiển thị 2 badge trạng thái */}
            <View style={styles.statusBadges}>
              <View style={[styles.statusBadge, { backgroundColor: paymentColor + '20' }]}>
                <Ionicons name="card-outline" size={12} color={paymentColor} />
                <Text style={[styles.statusBadgeText, { color: paymentColor }]}>
                  {PAYMENT_STATUS_LABELS[paymentStatus]}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: shippingColor + '20' }]}>
                <Ionicons name="car-outline" size={12} color={shippingColor} />
                <Text style={[styles.statusBadgeText, { color: shippingColor }]}>
                  {SHIPPING_STATUS_LABELS[shippingStatus]}
                </Text>
              </View>
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
                <Text style={styles.customerAvatarText}>
                  {order.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.customerDetails}>
                <Text style={styles.customerName}>{order.user?.fullName || 'Khách hàng'}</Text>
                <View style={styles.contactItem}>
                  <Ionicons name="mail-outline" size={16} color="#6b7280" />
                  <Text style={styles.contactText}>{order.user?.email || 'N/A'}</Text>
                </View>
                <View style={styles.contactItem}>
                  <Ionicons name="location-outline" size={16} color="#6b7280" />
                  <Text style={styles.contactText}>{order.shippingAddress || 'Chưa có địa chỉ'}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sản phẩm đặt hàng ({totalItems} sản phẩm)</Text>
          {order.orderItems?.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              {item.product?.mainImage && (
                <Image source={{ uri: item.product.mainImage }} style={styles.itemImage} />
              )}
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.product?.name || 'Sản phẩm'}</Text>
                <Text style={styles.itemQuantity}>SL: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>{item.price.toLocaleString('vi-VN')} đ</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Phương thức thanh toán</Text>
              <Text style={styles.priceValue}>{order.paymentMethod || 'N/A'}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Phí vận chuyển</Text>
              <Text style={styles.priceValue}>{(order.shippingFee || 0).toLocaleString('vi-VN')} đ</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Giảm giá</Text>
              <Text style={styles.priceValue}>-{(order.discountAmount || 0).toLocaleString('vi-VN')} đ</Text>
            </View>
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>{(order.finalAmount || order.totalAmount).toLocaleString('vi-VN')} đ</Text>
            </View>
          </View>
        </View>

        {/* Update Payment Status */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="card-outline" size={20} color="#10b981" />
            <Text style={styles.cardTitle}>Trạng thái thanh toán</Text>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={paymentStatus}
              onValueChange={(itemValue) => handlePaymentStatusChange(itemValue as PaymentStatus)}
              style={styles.picker}
            >
              <Picker.Item label="Chờ thanh toán" value="PENDING" />
              <Picker.Item label="Đã thanh toán" value="PAID" />
              <Picker.Item label="Thanh toán thất bại" value="FAILED" />
              <Picker.Item label="Đã hoàn tiền" value="REFUNDED" />
              <Picker.Item label="Đã hủy" value="CANCELLED" />
            </Picker>
          </View>
        </View>

        {/* Update Shipping Status */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="car-outline" size={20} color="#007bff" />
            <Text style={styles.cardTitle}>Trạng thái vận chuyển</Text>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={shippingStatus}
              onValueChange={(itemValue) => handleShippingStatusChange(itemValue as ShippingStatus)}
              style={styles.picker}
            >
              <Picker.Item label="Chờ xử lý" value="PENDING" />
              <Picker.Item label="Đang chuẩn bị hàng" value="PROCESSING" />
              <Picker.Item label="Đã giao cho vận chuyển" value="SHIPPED" />
              <Picker.Item label="Đang vận chuyển" value="IN_TRANSIT" />
              <Picker.Item label="Đã giao hàng" value="DELIVERED" />
              <Picker.Item label="Đã hủy" value="CANCELLED" />
              <Picker.Item label="Đã trả hàng" value="RETURNED" />
            </Picker>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
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
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
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
