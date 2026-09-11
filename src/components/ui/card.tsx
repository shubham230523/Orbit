import React from 'react';
import { StyleSheet, Text, View, ViewStyle, TextStyle } from 'react-native';
import { Colors, Radius, Spacing, Typography, Shadows } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface CardProps {
  children?: React.ReactNode;
  title?: string;
  description?: string;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  elevated?: boolean;
}

export const Card = ({
  children,
  title,
  description,
  style,
  titleStyle,
  descriptionStyle,
  elevated = false,
}: CardProps) => {
  const colors = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.backgroundElement },
        elevated && Shadows.small,
        style,
      ]}
    >
      {title && (
        <Text style={[styles.title, { color: colors.text }, titleStyle]}>{title}</Text>
      )}
      {description && (
        <Text style={[styles.description, { color: colors.textSecondary }, descriptionStyle]}>
          {description}
        </Text>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.three,
    borderRadius: Radius.large,
    gap: Spacing.two,
  },
  title: {
    ...Typography.h3,
  },
  description: {
    ...Typography.body,
  },
});
