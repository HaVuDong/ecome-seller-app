import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import productService from '@/services/productService';
import categoryService, { CategoryResponse } from '@/services/categoryService';
import { useAuth } from '@/contexts/AuthContext';

interface EditProductProps {
  route: {
    params: {
      productId: string;
    };
  };
}

export function EditProduct({ route }: EditProductProps) {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { productId } = route.params;

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    categoryId: '',
    description: '',
    stock: '',
  });

  const [images, setImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadProduct();
    loadCategories();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      const product = await productService.getProductById(parseInt(productId));
      console.log('Loaded product:', product);
      console.log('Category ID:', product.category?.id);
      
      setFormData({
        name: product.name,
        price: product.price.toString(),
        categoryId: product.category?.id?.toString() || '',
        description: product.description || '',
        stock: product.stock.toString(),
      });
      
      console.log('FormData set to:', {
        name: product.name,
        categoryId: product.category?.id?.toString() || '',
        price: product.price.toString(),
        stock: product.stock.toString()
      });
      
      if (product.mainImage) {
        setImages([product.mainImage]);
      }
    } catch (error: any) {
      console.error('Load product error:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin sản phẩm');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setIsCategoriesLoading(true);
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error: any) {
      Alert.alert('Lỗi', 'Không thể tải danh mục');
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    console.log('=== HANDLE SUBMIT ===');
    console.log('formData:', JSON.stringify(formData, null, 2));
    console.log('categoryId value:', formData.categoryId);
    console.log('categoryId type:', typeof formData.categoryId);
    
    if (!user?.id) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
      return;
    }
    
    if (!formData.name || !formData.price || !formData.categoryId || !formData.stock) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      console.log('Validation failed:', {
        name: !!formData.name,
        price: !!formData.price,
        categoryId: !!formData.categoryId,
        stock: !!formData.stock
      });
      return;
    }

    const categoryId = parseInt(formData.categoryId);
    console.log('Parsed categoryId:', categoryId, 'isNaN:', isNaN(categoryId));
    
    if (isNaN(categoryId)) {
      Alert.alert('Lỗi', 'Vui lòng chọn danh mục');
      return;
    }

    const updateData = {
      categoryId: categoryId,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      mainImage: images[0] || '',
      isActive: true,
    };

    console.log('Update data:', JSON.stringify(updateData, null, 2));

    try {
      setIsSubmitting(true);
      // Backend kiểm tra quyền sở hữu từ JWT token
      const response = await productService.updateProduct(parseInt(productId), updateData);
      
      if (response.success) {
        console.log('Product updated successfully');
        Alert.alert('Thành công', 'Đã cập nhật sản phẩm');
        navigation.goBack();
      }
    } catch (error: any) {
      console.error('Update product error:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert('Lỗi', error.response?.data?.message || error.message || 'Không thể cập nhật sản phẩm');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = () => {
    const mockImage =
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop';
    setImages((prev) => [...prev, mockImage]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Chỉnh Sửa Sản Phẩm</Text>
            <Text style={styles.headerSubtitle}>Cập nhật thông tin sản phẩm</Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Images */}
        <View style={styles.card}>
          <Text style={styles.label}>Hình Ảnh Sản Phẩm</Text>
          <View style={styles.imagesGrid}>
            {images.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: image }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close" size={16} color="#ffffff" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 6 && (
              <TouchableOpacity style={styles.uploadButton} onPress={handleImageUpload}>
                <Ionicons name="cloud-upload-outline" size={24} color="#9ca3af" />
                <Text style={styles.uploadButtonText}>Tải Lên</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Product Details */}
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên Sản Phẩm</Text>
            <TextInput
              style={styles.input}
              placeholder="ví dụ: Tai Nghe Không Dây"
              value={formData.name}
              onChangeText={(value) => handleChange('name', value)}
            />
          </View>

          <View style={styles.rowInputs}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Giá ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={formData.price}
                onChangeText={(value) => handleChange('price', value)}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Tồn Kho</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={formData.stock}
                onChangeText={(value) => handleChange('stock', value)}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Danh Mục</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.categoryId}
                onValueChange={(value) => handleChange('categoryId', value)}
                style={styles.picker}
                enabled={!isCategoriesLoading}
              >
                <Picker.Item label="Chọn danh mục" value="" />
                {categories.map((category) => (
                  <Picker.Item 
                    key={category.id} 
                    label={category.name} 
                    value={category.id.toString()} 
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mô Tả</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Mô tả sản phẩm của bạn..."
              value={formData.description}
              onChangeText={(value) => handleChange('description', value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>Lưu Thay Đổi</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
        )}
      </KeyboardAvoidingView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
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
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    backgroundColor: '#dc2626',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButton: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  uploadButtonText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  inputGroup: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 10,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
