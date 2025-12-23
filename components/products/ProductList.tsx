import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import type { RootStackParamList } from '@/app/app';
import productService, { ProductResponse } from '@/services/productService';

export function ProductList() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await productService.getAllProducts(0, 100);
      setProducts(response.content);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tải danh sách sản phẩm');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadProducts();
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await productService.searchProducts(searchQuery, 0, 100);
      setProducts(response.content);
    } catch (error: any) {
      Alert.alert('Lỗi', 'Không thể tìm kiếm sản phẩm');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleDelete = (productId: number) => {
    Alert.alert(
      'Xóa Sản Phẩm',
      'Bạn có chắc chắn muốn xóa sản phẩm này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await productService.deleteProduct(productId);
              Alert.alert('Thành công', 'Đã xóa sản phẩm');
              loadProducts();
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể xóa sản phẩm');
            }
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>Sản Phẩm</Text>
              <Text style={styles.subtitle}>{products.length} sản phẩm</Text>
            </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddProduct' as never)}
          >
            <Ionicons name="add" size={16} color="#ffffff" />
            <Text style={styles.addButtonText}>Thêm</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      <ScrollView style={styles.productsList} contentContainerStyle={styles.productsContent}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>Không có sản phẩm nào</Text>
            <Text style={styles.emptySubtext}>Thêm sản phẩm đầu tiên của bạn</Text>
          </View>
        ) : (
          products.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <Image 
                source={{ uri: product.mainImage || 'https://via.placeholder.com/80' }} 
                style={styles.productImage} 
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productCategory}>{product.category.name}</Text>
                <View style={styles.productFooter}>
                  <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
                  <Text style={styles.productStock}>Kho: {product.stock}</Text>
                </View>
              </View>
              <View style={styles.productActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => navigation.navigate('EditProduct', { productId: product.id.toString() })}
                >
                  <Ionicons name="create-outline" size={20} color="#2563eb" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(product.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#dc2626" />
                </TouchableOpacity>
              </View>
            </View>
          ))
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  searchIcon: {
    marginLeft: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#111827',
  },
  productsList: {
    flex: 1,
  },
  productsContent: {
    padding: 24,
    gap: 16,
    paddingBottom: 24,
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 13,
    color: '#6b7280',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  productStock: {
    fontSize: 13,
    color: '#6b7280',
  },
  productActions: {
    justifyContent: 'center',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
});
