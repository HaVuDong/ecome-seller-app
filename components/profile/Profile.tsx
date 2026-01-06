import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import dashboardService from '@/services/dashboardService';
import { EditProfile } from './EditProfile';
import { useNavigation } from '@react-navigation/native';

interface UserStats {
  totalOrders: number;
  totalProducts: number;
  averageRating: number;
}

interface ProfileProps {
  onLogout: () => void;
}

export function Profile({ onLogout }: ProfileProps) {
  const { user: authUser, refreshUser, logout } = useAuth();
  const navigation = useNavigation();
  const [stats, setStats] = useState<UserStats>({ totalOrders: 0, totalProducts: 0, averageRating: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        await refreshUser();
        
        // Load stats từ dashboard API
        try {
          const dashboardResponse = await dashboardService.getSellerDashboard();
          if (dashboardResponse.success && dashboardResponse.data) {
            const { totalOrders, totalProducts, averageRating } = dashboardResponse.data;
            setStats({
              totalOrders: totalOrders || 0,
              totalProducts: totalProducts || 0,
              averageRating: averageRating || 0,
            });
          }
        } catch (dashboardError) {
          console.error('Error loading dashboard stats:', dashboardError);
        }
      } catch (error: any) {
        console.error('Error loading user data:', error);
        Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const menuItems = [
    {
      icon: 'person-outline' as const,
      label: 'Chỉnh sửa Hồ sơ',
      onPress: () => setShowEditProfile(true),
    },
    {
      icon: 'storefront-outline' as const,
      label: 'Cài đặt Cửa hàng',
      onPress: () => {},
    },
    {
      icon: 'notifications-outline' as const,
      label: 'Thông báo',
      onPress: () => {},
    },
    {
      icon: 'shield-outline' as const,
      label: 'Quyền riêng tư & Bảo mật',
      onPress: () => {},
    },
    {
      icon: 'help-circle-outline' as const,
      label: 'Trợ giúp & Hỗ trợ',
      onPress: () => {},
    },
  ];

  // Show EditProfile screen
  if (showEditProfile) {
    return (
      <EditProfile
        onBack={() => setShowEditProfile(false)}
        onSave={async () => {
          setShowEditProfile(false);
          try {
            await refreshUser();
          } catch (error) {
            console.error('Error refreshing user:', error);
          }
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Hồ sơ & Cài đặt</Text>
          </View>

        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#10b981" />
              <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
          ) : (
            <>
              {/* Profile Card */}
              <View style={styles.card}>
                <View style={styles.profileSection}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                      {authUser?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>{authUser?.fullName || 'Người dùng'}</Text>
                    <Text style={styles.profileId}>ID: #{authUser?.id || '---'}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.contactInfo}>
                  <View style={styles.contactItem}>
                    <Ionicons name="mail-outline" size={20} color="#6b7280" />
                    <Text style={styles.contactText}>{authUser?.email || 'Chưa có email'}</Text>
                  </View>
                  <View style={styles.contactItem}>
                    <Ionicons name="call-outline" size={20} color="#6b7280" />
                    <Text style={styles.contactText}>{authUser?.phone || 'Chưa có số điện thoại'}</Text>
                  </View>
                  <View style={styles.contactItem}>
                    <Ionicons name="location-outline" size={20} color="#6b7280" />
                    <Text style={styles.contactText}>{authUser?.address || 'Chưa có địa chỉ'}</Text>
                  </View>
                </View>
              </View>

              {/* Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.totalOrders}</Text>
                  <Text style={styles.statLabel}>Đơn hàng</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.totalProducts}</Text>
                  <Text style={styles.statLabel}>Sản phẩm</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.averageRating.toFixed(1)}</Text>
                  <Text style={styles.statLabel}>Đánh giá</Text>
                </View>
              </View>
            </>
          )}

          {/* Menu Items */}
          <View style={styles.card}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index !== menuItems.length - 1 && styles.menuItemBorder,
                ]}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name={item.icon} size={20} color="#6b7280" />
                  <Text style={styles.menuItemText}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout */}
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={async () => {
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' as never }],
              });
            }}
          >
            <Ionicons name="log-out-outline" size={20} color="#2f2929ff" />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>

          {/* Version */}
          <Text style={styles.version}>Phiên bản 1.0.0</Text>
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
  scrollView: {
    flex: 1,
    paddingBottom: 16,
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
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    marginBottom: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#2563eb',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  profileId: {
    fontSize: 14,
    color: '#6b7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginBottom: 16,
  },
  contactInfo: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#111827',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#dc2626',
  },
  version: {
    textAlign: 'center',
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
});
