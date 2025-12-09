import React from 'react';
import { Platform, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';

export function HapticTab(props: BottomTabBarButtonProps) {
  const handlePress = () => {
    // Provide haptic feedback on tab press (iOS only by default)
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    props.onPress?.();
  };

  return (
    <Pressable
      {...props}
      onPress={handlePress}
      style={props.style}
    >
      {props.children}
    </Pressable>
  );
}