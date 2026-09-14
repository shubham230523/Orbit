import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { Card } from './card';
import { Badge } from './badge';
import { Button } from './button';

export interface MilestoneCardProps {
  title: string;
  status: 'todo' | 'completed';
  dueDate?: string;
  onAction?: () => void;
  isActioned?: boolean;
}

export const MilestoneCard = ({ title, status, dueDate, onAction, isActioned }: MilestoneCardProps) => {
  const colors = useTheme();

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            { color: colors.text },
            status === 'completed' && styles.completedText,
          ]}
        >
          {title}
        </Text>
        <Badge
          label={status}
          variant={status === 'completed' ? 'success' : 'secondary'}
        />
      </View>

      <View style={styles.footer}>
        {dueDate ? (
          <Text style={[styles.meta, { color: colors.textSecondary }]}>
            Due: {dueDate}
          </Text>
        ) : <View />}

        {!isActioned && status !== 'completed' && (
          <Button
            title="Convert to Task"
            size="small"
            variant="outline"
            onPress={onAction}
            style={styles.actionButton}
          />
        )}
        {isActioned && (
          <Badge label="Linked to Task" variant="primary" />
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...Typography.bodyBold,
    flex: 1,
    marginRight: Spacing.two,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  meta: {
    ...Typography.small,
  },
  actionButton: {
    height: 32,
    paddingHorizontal: Spacing.two,
  },
});
