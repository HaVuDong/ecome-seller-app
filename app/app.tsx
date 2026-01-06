import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { LoginScreen } from '@/components/auth/LoginScreen';
import { RegisterScreen } from '@/components/auth/RegisterScreen';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { ProductList } from '@/components/products/ProductList';
import { AddProduct } from '@/components/products/AddProduct';
import { EditProduct } from '@/components/products/EditProduct';
import { OrdersList } from '@/components/orders/OrdersList';
import { OrderDetail } from '@/components/orders/OrderDetail';
import { Chat } from '@/components/chat/Chat';
import { Profile } from '@/components/profile/Profile';
import { useAuth } from '@/contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type Screen = 
  | 'dang-nhap' 
  | 'dang-ky' 
  | 'trang-chu' 
  | 'san-pham' 
  | 'them-san-pham' 
  | 'sua-san-pham'
  | 'don-hang' 
  | 'chi-tiet-don-hang' 
  | 'tro-chuyen' 
  | 'ho-so';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  stock: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  date: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  AddProduct: undefined;
  EditProduct: { productId: string };
  OrderDetail: { orderId: string };
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function ProfileTabScreen() {
  const navigation = useNavigation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' as never }],
              });
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  return <Profile onLogout={handleLogout} />;
}

function MainTabs() {
  const insets = useSafeAreaInsets();
  // Tự động điều chỉnh padding dựa trên safe area của điện thoại
  const bottomPadding = insets.bottom > 0 ? insets.bottom : 10;
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb',
          borderTopWidth: 1,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          height: 60 + bottomPadding,
          // Không cần marginBottom vì đã tính safe area
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={Dashboard}
        options={{
          tabBarLabel: 'Trang chủ',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProductsTab"
        component={ProductList}
        options={{
          tabBarLabel: 'Sản phẩm',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersList}
        options={{
          tabBarLabel: 'Đơn hàng',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bag-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ChatTab"
        component={Chat}
        options={{
          tabBarLabel: 'Trò chuyện',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileTabScreen}
        options={{
          tabBarLabel: 'Hồ sơ',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="AddProduct" component={AddProduct} />
        <Stack.Screen name="EditProduct" component={EditProduct} />
        <Stack.Screen name="OrderDetail" component={OrderDetail} />
      </Stack.Navigator>
    </>
  );
}
