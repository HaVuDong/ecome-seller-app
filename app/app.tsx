import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { LoginScreen } from '@/components/LoginScreen';
import { RegisterScreen } from '@/components/RegisterScreen';
import { Dashboard } from '@/components/Dashboard';
import { ProductList } from '@/components/ProductList';
import { AddProduct } from '@/components/AddProduct';
import { EditProduct } from '@/components/EditProduct';
import { OrdersList } from '@/components/OrdersList';
import { OrderDetail } from '@/components/OrderDetail';
import { Chat } from '@/components/Chat';
import { Profile } from '@/components/Profile';

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

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb',
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
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
        options={{
          tabBarLabel: 'Hồ sơ',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      >
        {() => <Profile onLogout={() => {}} />}
      </Tab.Screen>
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
