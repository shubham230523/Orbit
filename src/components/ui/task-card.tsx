import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { CheckCircle2, Circle, Clock, Trash2 } from 'lucide-react-native';
import { Task } from '@/types/domain';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { Card } from './card';

export interface TaskCardProps {
  task: Task & { goalTitle?: string };
  onPress?: () => void;
  onToggleComplete?: () => void;
  onDelete?: () => void;
}

export const TaskCard = ({ task, onPress, onToggleComplete, onDelete }: TaskCardProps) => {
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
                task.status === 'blocked' && { color: '#9E9E9E', opacity: 0.6 }
              ]}
              numberOfLines={2}
            >
              {task.title}
            </Text>

            {task.dueDate && (
              <View style={styles.footer}>
                <View style={styles.meta}>
                  <Clock size={12} color={colors.textSecondary} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                    {task.dueDate}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {onDelete && (
            <Pressable onPress={onDelete} hitSlop={10}>
              <Trash2 size={20} color="#D32F2F" opacity={0.6} />
            </Pressable>
          )}
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
    width: 6,
    height: '100%',
  },
  mainRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  content: {
    flex: 1,
    gap: 4,
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
    opacity: 0.5,
    marginBottom: 2,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  metaText: {
    ...Typography.small,
    fontSize: 11,
  },
});
