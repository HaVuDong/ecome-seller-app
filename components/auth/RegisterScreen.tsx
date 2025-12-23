import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';

export function RegisterScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const { register } = useAuth();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.address) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin (Địa chỉ là bắt buộc cho Seller)');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setIsLoading(true);
      await register({
        email: formData.email,
        password: formData.password,
        fullName: formData.name,
        phone: formData.phone,
        address: formData.address,
        role: 'SELLER',
      });
      navigation.navigate('Main' as never);
    } catch (error: any) {
      Alert.alert('Đăng ký thất bại', error.message || 'Không thể tạo tài khoản');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="storefront" size={32} color="#ffffff" />
            </View>
            <Text style={styles.title}>Tạo Tài Khoản</Text>
            <Text style={styles.subtitle}>Bắt đầu bán hàng trên nền tảng của chúng tôi</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Họ và Tên</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nguyễn Văn A"
                  value={formData.name}
                  onChangeText={(value) => handleChange('name', value)}
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="nguoiban@example.com"
                  value={formData.email}
                  onChangeText={(value) => handleChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số Điện Thoại</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="+84 (90) 123-4567"
                  value={formData.phone}
                  onChangeText={(value) => handleChange('phone', value)}
                  keyboardType="phone-pad"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Địa chỉ *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="location-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Địa chỉ cửa hàng của bạn"
                  value={formData.address}
                  onChangeText={(value) => handleChange('address', value)}
                  placeholderTextColor="#9ca3af"
                  multiline
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mật Khẩu</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  value={formData.password}
                  onChangeText={(value) => handleChange('password', value)}
                  secureTextEntry
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Xác Nhận Mật Khẩu</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleChange('confirmPassword', value)}
                  secureTextEntry
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]} 
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Đăng Ký</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
              <Text style={styles.linkText}>Đăng Nhập</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#2563eb',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#111827',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
    marginTop: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  linkText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#dc2626',
  },
});
