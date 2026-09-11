import React from 'react';
import {
  Modal as RNModal,
  StyleSheet,
  View,
  Pressable,
  Text,
  ViewStyle,
} from 'react-native';
import { X } from 'lucide-react-native';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Modal = ({ visible, onClose, title, children, style }: ModalProps) => {
  const colors = useTheme();

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.content, { backgroundColor: colors.background }, style]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            {title ? (
              <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            ) : (
              <View />
            )}
            <Pressable onPress={onClose} hitSlop={10}>
              <X color={colors.textSecondary} size={24} />
            </Pressable>
          </View>
          <View style={styles.body}>{children}</View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  content: {
    width: '100%',
    maxWidth: 500,
    borderRadius: Radius.xlarge,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc', // Add to theme colors later
  },
  title: {
    ...Typography.h3,
  },
  body: {
    padding: Spacing.three,
  },
});
