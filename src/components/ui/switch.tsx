import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/use-theme';

export interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  style?: ViewStyle;
}

export const Switch = ({ value, onValueChange, style }: SwitchProps) => {
  const colors = useTheme();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withSpring(value ? colors.text : colors.backgroundElement),
    };
  });

  const thumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: withSpring(value ? 20 : 2) }],
    };
  });

  return (
    <Pressable onPress={() => onValueChange(!value)} style={style}>
      <Animated.View style={[styles.track, animatedStyle]}>
        <Animated.View style={[styles.thumb, { backgroundColor: colors.background }, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  track: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
