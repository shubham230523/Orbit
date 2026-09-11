import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { Card } from './card';
import { Badge } from './badge';

export interface MilestoneCardProps {
  title: string;
  status: 'todo' | 'completed';
  dueDate?: string;
}

export const MilestoneCard = ({ title, status, dueDate }: MilestoneCardProps) => {
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
      {dueDate && (
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          Due: {dueDate}
        </Text>
      )}
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
  meta: {
    ...Typography.small,
    marginTop: Spacing.one,
  },
});
