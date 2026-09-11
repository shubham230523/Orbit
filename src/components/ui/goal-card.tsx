import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Goal } from '@/types/domain';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { Card } from './card';
import { ProgressBar } from './progress-bar';

export interface GoalCardProps {
  goal: Goal;
  progress: number; // 0 to 1
  onPress?: () => void;
}

export const GoalCard = ({ goal, progress, onPress }: GoalCardProps) => {
  const colors = useTheme();

  return (
    <Card style={styles.card}>
      <Pressable onPress={onPress}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {goal.title}
          </Text>
          <Text style={[styles.percentage, { color: colors.text }]}>
            {Math.round(progress * 100)}%
          </Text>
        </View>

        {goal.description && (
          <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
            {goal.description}
          </Text>
        )}

        <ProgressBar progress={progress} style={styles.progressBar} />

        <View style={styles.footer}>
          <Text style={[styles.meta, { color: colors.textSecondary }]}>
            Target: {goal.targetDate || 'No date'}
          </Text>
        </View>
      </Pressable>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  title: {
    ...Typography.bodyBold,
    flex: 1,
  },
  percentage: {
    ...Typography.small,
    fontWeight: '700',
  },
  description: {
    ...Typography.small,
    marginBottom: Spacing.two,
  },
  progressBar: {
    marginBottom: Spacing.two,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  meta: {
    ...Typography.small,
  },
});
