/**
 * Theme configuration for Ecome Seller App
 * Professional blue theme for seller dashboard
 */

import { Platform } from 'react-native';

const tintColorLight = '#2563eb';
const tintColorDark = '#60a5fa';

export const Colors = {
  light: {
    text: '#111827',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',
    background: '#f9fafb',
    surface: '#ffffff',
    tint: tintColorLight,
    icon: '#6b7280',
    tabIconDefault: '#9ca3af',
    tabIconSelected: tintColorLight,
    border: '#e5e7eb',
    
    // Primary colors
    primary: '#2563eb',
    primaryDark: '#1d4ed8',
    primaryLight: '#dbeafe',
    
    // Status colors
    success: '#10b981',
    successLight: '#d1fae5',
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    error: '#ef4444',
    errorLight: '#fee2e2',
    info: '#3b82f6',
    infoLight: '#dbeafe',
  },
  dark: {
    text: '#f9fafb',
    textSecondary: '#d1d5db',
    textMuted: '#9ca3af',
    background: '#111827',
    surface: '#1f2937',
    tint: tintColorDark,
    icon: '#9ca3af',
    tabIconDefault: '#6b7280',
    tabIconSelected: tintColorDark,
    border: '#374151',
    
    // Primary colors
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    primaryLight: '#1e3a8a',
    
    // Status colors
    success: '#34d399',
    successLight: '#065f46',
    warning: '#fbbf24',
    warningLight: '#78350f',
    error: '#f87171',
    errorLight: '#991b1b',
    info: '#60a5fa',
    infoLight: '#1e3a8a',
  },
};

// Spacing system
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Border radius
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 9999,
};

// Font sizes
export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  display: 32,
};

// Shadows
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export default {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  Shadows,
  Fonts,
};
