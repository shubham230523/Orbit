import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle, Text } from 'react-native';
import { Check } from 'lucide-react-native';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface CheckboxProps {
  checked: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  style?: ViewStyle;
}

export const Checkbox = ({ checked, onValueChange, label, style }: CheckboxProps) => {
  const colors = useTheme();

  return (
    <Pressable
      onPress={() => onValueChange(!checked)}
      style={[styles.container, style]}
    >
      <View
        style={[
          styles.checkbox,
          {
            borderColor: colors.textSecondary,
            backgroundColor: checked ? colors.text : 'transparent',
          },
        ]}
      >
        {checked && <Check size={16} color={colors.background} strokeWidth={3} />}
      </View>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: Radius.small,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    ...Typography.body,
  },
});
