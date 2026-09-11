import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Typography } from '@/constants/theme';
import { Button } from './button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorState = ({
  title = 'Something went wrong',
  message,
  onRetry,
  style,
}: ErrorStateProps) => {
  const colors = useTheme();

  return (
    <View style={[styles.container, style]} testID="ErrorState">
      <AlertCircle size={48} color="#C62828" />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      {onRetry && (
        <Button title="Retry" onPress={onRetry} variant="outline" style={styles.retryButton} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.six,
    gap: Spacing.two,
  },
  title: {
    ...Typography.h3,
    textAlign: 'center',
    marginTop: Spacing.two,
  },
  message: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
  retryButton: {
    minWidth: 120,
  },
});
