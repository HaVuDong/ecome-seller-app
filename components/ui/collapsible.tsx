import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  measure,
  runOnUI,
  useDerivedValue,
} from 'react-native-reanimated';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
}

export function Collapsible({ title, children }: CollapsibleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const colorScheme = useColorScheme();
  const rotation = useSharedValue(0);
  const height = useSharedValue(0);
  const opacity = useSharedValue(0);

  const toggleExpanded = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    rotation.value = withTiming(newExpanded ? 90 : 0, { duration: 200 });
    height.value = withTiming(newExpanded ? 1 : 0, { duration: 200 });
    opacity.value = withTiming(newExpanded ? 1 : 0, { duration: 200 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const contentStyle = useAnimatedStyle(() => {
    return {
      maxHeight: interpolate(height.value, [0, 1], [0, 1000]),
      opacity: opacity.value,
      overflow: 'hidden' as const,
    };
  });

  return (
    <ThemedView style={styles.container}>
      <Pressable 
        style={[
          styles.header,
          { borderBottomColor: Colors[colorScheme ?? 'light'].icon + '20' }
        ]} 
        onPress={toggleExpanded}
      >
        <ThemedText type="defaultSemiBold" style={styles.title}>
          {title}
        </ThemedText>
        <Animated.View style={animatedStyle}>
          <IconSymbol
            name="chevron.right"
            size={18}
            color={Colors[colorScheme ?? 'light'].icon}
          />
        </Animated.View>
      </Pressable>
      <Animated.View style={contentStyle}>
        <View style={styles.content}>
          {children}
        </View>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    marginVertical: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  title: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});

// Export aliases for compatibility
export const CollapsibleTrigger = Pressable;
export const CollapsibleContent = View;
