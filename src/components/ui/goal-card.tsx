import { StyleSheet, Text, View, Pressable, ViewStyle } from 'react-native';
import { Goal } from '@/types/domain';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { Card } from './card';
import { ProgressBar } from './progress-bar';

export interface GoalCardProps {
  goal: Goal;
  progress: number; // 0 to 1
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
}

export const GoalCard = ({ goal, progress, onPress, onLongPress, style }: GoalCardProps) => {
  const colors = useTheme();

  return (
    <Card
      elevated
      style={[
        { borderColor: colors.backgroundSelected, borderWidth: 1, padding: 0 },
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        android_ripple={{ color: colors.backgroundSelected }}
        style={styles.pressable}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {goal.title}
          </Text>
          <View style={styles.percentageContainer}>
            <Text style={styles.percentage}>{Math.round(progress * 100)}%</Text>
          </View>
        </View>

        {goal.description && (
          <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
            {goal.description}
          </Text>
        )}

        <View style={styles.progressWrapper}>
          <ProgressBar progress={progress} color="#208AEF" height={6} />
        </View>

        {goal.targetDate && (
          <View style={styles.footer}>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Target: {goal.targetDate}</Text>
            </View>
          </View>
        )}
      </Pressable>
    </Card>
  );
};

const styles = StyleSheet.create({
  pressable: {
    padding: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  title: {
    ...Typography.h3,
    fontSize: 18,
    flex: 1,
  },
  percentageContainer: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    backgroundColor: 'rgba(32, 138, 239, 0.1)',
    borderRadius: Radius.small,
  },
  percentage: {
    ...Typography.small,
    fontWeight: '700',
    color: '#208AEF',
  },
  description: {
    ...Typography.small,
    marginBottom: Spacing.three,
    opacity: 0.8,
  },
  progressWrapper: {
    marginBottom: Spacing.two,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: Spacing.one,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.one,
    alignItems: 'center',
  },
  metaLabel: {
    ...Typography.small,
    fontSize: 12,
  },
  metaValue: {
    ...Typography.small,
    fontSize: 12,
    fontWeight: '600',
  },
});
