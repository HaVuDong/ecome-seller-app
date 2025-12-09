import React from 'react';
import { View, ViewProps } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export interface ThemedViewProps extends ViewProps {
  lightColor?: string;
  darkColor?: string;
}

export function ThemedView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const colorScheme = useColorScheme();
  const backgroundColor = lightColor || darkColor 
    ? (colorScheme === 'light' ? lightColor : darkColor)
    : Colors[colorScheme ?? 'light'].background;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}