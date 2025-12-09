import React from 'react';
import { Platform } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { Ionicons } from '@expo/vector-icons';

interface IconSymbolProps {
  name: string;
  size: number;
  color: string;
}

// Fallback mapping for platforms that don't support SF Symbols
const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'person.fill': 'person',
  'gear': 'settings-outline',
  'magnifyingglass': 'search',
  'heart.fill': 'heart',
  'star.fill': 'star',
  'bell.fill': 'notifications',
  'cart.fill': 'bag',
  'folder.fill': 'folder',
  'chevron.right': 'chevron-forward',
  'chevron.left.forwardslash.chevron.right': 'code-slash',
};

export function IconSymbol({ name, size, color }: IconSymbolProps) {
  // Use SF Symbols on iOS, fallback to Ionicons on other platforms
  if (Platform.OS === 'ios') {
    return (
      <SymbolView
        name={name}
        style={{ width: size, height: size }}
        tintColor={color}
        type="monochrome"
      />
    );
  }
  
  const iconName = iconMap[name] || 'help-circle';
  
  return (
    <Ionicons 
      name={iconName} 
      size={size} 
      color={color} 
    />
  );
}