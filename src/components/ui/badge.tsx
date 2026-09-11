import React from 'react';
import { StyleSheet, Text, View, ViewStyle, TextStyle } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge = ({ label, variant = 'primary', style, textStyle }: BadgeProps) => {
  const colors = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          container: { backgroundColor: colors.backgroundSelected },
          text: { color: colors.textSecondary },
        };
      case 'success':
        return {
          container: { backgroundColor: '#E8F5E9' },
          text: { color: '#2E7D32' },
        };
      case 'warning':
        return {
          container: { backgroundColor: '#FFF3E0' },
          text: { color: '#EF6C00' },
        };
      case 'error':
        return {
          container: { backgroundColor: '#FFEBEE' },
          text: { color: '#C62828' },
        };
      case 'primary':
      default:
        return {
          container: { backgroundColor: colors.text },
          text: { color: colors.background },
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View style={[styles.container, variantStyles.container, style]}>
      <Text style={[styles.text, variantStyles.text, textStyle]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    ...Typography.small,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
