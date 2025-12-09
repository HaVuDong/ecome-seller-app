import React from 'react';
import { Text, TextProps } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export interface ThemedTextProps extends TextProps {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
}

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const colorScheme = useColorScheme();
  const color = lightColor || darkColor 
    ? (colorScheme === 'light' ? lightColor : darkColor)
    : Colors[colorScheme ?? 'light'].text;

  return (
    <Text
      style={[
        { color },
        type === 'default' ? { fontSize: 16, lineHeight: 24 } : undefined,
        type === 'title' ? { fontSize: 32, fontWeight: 'bold', lineHeight: 32 } : undefined,
        type === 'defaultSemiBold' ? { fontSize: 16, lineHeight: 24, fontWeight: '600' } : undefined,
        type === 'subtitle' ? { fontSize: 20, fontWeight: 'bold' } : undefined,
        type === 'link' ? { fontSize: 16, lineHeight: 24, color: Colors[colorScheme ?? 'light'].tint } : undefined,
        style,
      ]}
      {...rest}
    />
  );
}