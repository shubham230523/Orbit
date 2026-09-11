import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Radius, Spacing, Typography, Shadows } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'error';
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

export const Toast = ({
  message,
  type = 'info',
  visible,
  onHide,
  duration = 3000,
}: ToastProps) => {
  const colors = useTheme();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(visible ? 1 : 0),
      transform: [{ translateY: withSpring(visible ? 0 : 100) }],
    };
  });

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onHide();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide]);

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#2E7D32';
      case 'error':
        return '#C62828';
      default:
        return colors.text;
    }
  };

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View
        style={[
          styles.toast,
          { backgroundColor: getBackgroundColor() },
          Shadows.medium,
          animatedStyle,
        ]}
      >
        <Text style={[styles.text, { color: colors.background }]}>{message}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: Spacing.six,
    zIndex: 1000,
  },
  toast: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Radius.full,
    maxWidth: '90%',
  },
  text: {
    ...Typography.bodyBold,
    textAlign: 'center',
  },
});
