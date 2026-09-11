import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  style?: ViewStyle;
  color?: string;
}

export const ProgressBar = ({ progress, height = 8, style, color }: ProgressBarProps) => {
  const colors = useTheme();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${Math.min(Math.max(progress, 0), 1) * 100}%`,
    };
  });

  return (
    <View
      style={[
        styles.container,
        { height, backgroundColor: colors.backgroundElement, borderRadius: height / 2 },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            backgroundColor: color || colors.text,
            borderRadius: height / 2,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
