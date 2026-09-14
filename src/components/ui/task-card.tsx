import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { CheckCircle2, Circle, Clock } from 'lucide-react-native';
import { Task } from '@/types/domain';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { Card } from './card';
import { Badge } from './badge';

export interface TaskCardProps {
  task: Task & { goalTitle?: string };
  onPress?: () => void;
  onToggleComplete?: () => void;
}

export const TaskCard = ({ task, onPress, onToggleComplete }: TaskCardProps) => {
  const colors = useTheme();

  return (
    <Card style={styles.card}>
      <Pressable onPress={onPress} style={styles.container}>
        {task.goalTitle && <View style={[styles.goalIndicator, { backgroundColor: colors.primary }]} />}

        <View style={styles.mainRow}>
          <Pressable onPress={onToggleComplete} hitSlop={10} testID="task-toggle">
            {task.status === 'completed' ? (
              <CheckCircle2 size={24} color="#2E7D32" />
            ) : (
              <Circle size={24} color={colors.textSecondary} />
            )}
          </Pressable>

          <View style={styles.content}>
            {task.goalTitle && (
              <Text style={[styles.goalTitle, { color: colors.primary }]} numberOfLines={1}>
                {task.goalTitle}
              </Text>
            )}
            <Text
              style={[
                styles.title,
                { color: colors.text },
                task.status === 'completed' && styles.completedText,
              ]}
              numberOfLines={2}
            >
              {task.title}
            </Text>

            <View style={styles.footer}>
              <View style={styles.badgeRow}>
                <Badge
                  label={task.priority}
                  variant={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'secondary'}
                />
              </View>

              {task.dueDate && (
                <View style={styles.meta}>
                  <Clock size={14} color={colors.textSecondary} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                    {task.dueDate}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Pressable>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  container: {
    flexDirection: 'row',
  },
  goalIndicator: {
    width: 4,
    height: '100%',
  },
  mainRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    gap: Spacing.three,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...Typography.bodyBold,
    fontSize: 16,
    lineHeight: 22,
  },
  goalTitle: {
    ...Typography.smallBold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.6,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.one,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.one,
    alignItems: 'center',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  metaText: {
    ...Typography.small,
  },
});
