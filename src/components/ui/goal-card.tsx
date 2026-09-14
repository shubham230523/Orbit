import { StyleSheet, Text, View, Pressable, ViewStyle } from 'react-native';
import { Goal } from '@/types/domain';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Typography } from '@/constants/theme';
import { Card } from './card';
import { ProgressRing } from './progress-ring';
import { Calendar } from 'lucide-react-native';

export interface GoalCardProps {
  goal: Goal;
  progress: number; // 0 to 1
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
}

export const GoalCard = ({ goal, progress, onPress, onLongPress, style }: GoalCardProps) => {
  const colors = useTheme();
  const hasExtra = !!(goal.description || goal.targetDate);

  return (
    <Card
      elevated
      style={[
        { padding: 0, overflow: 'hidden', borderColor: colors.backgroundSelected, borderWidth: 1 },
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        android_ripple={{ color: colors.backgroundSelected }}
        style={[styles.pressable, !hasExtra && { paddingVertical: Spacing.three }]}
      >
        <View style={styles.contentRow}>
          <View style={styles.mainInfo}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={3}>
              {goal.title}
            </Text>
            {goal.description && (
              <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
                {goal.description}
              </Text>
            )}
          </View>

          <View style={styles.progressContainer}>
            <ProgressRing
              progress={progress}
              size={48}
              strokeWidth={4}
              color={colors.primary}
              trackColor={colors.backgroundSelected}
            />
            <View style={StyleSheet.absoluteFillObject}>
              <View style={styles.percentageWrapper}>
                <Text style={[styles.percentageText, { color: colors.text }]}>
                  {Math.round(progress * 100)}%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {goal.targetDate && (
          <View style={styles.footer}>
            <Calendar size={12} color={colors.textSecondary} />
            <Text style={[styles.targetDate, { color: colors.textSecondary }]}>
              Target: {goal.targetDate}
            </Text>
          </View>
        )}
      </Pressable>
    </Card>
  );
};

const styles = StyleSheet.create({
  pressable: {
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.four,
  },
  mainInfo: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...Typography.bodyBold,
    fontSize: 18,
    lineHeight: 24,
  },
  description: {
    ...Typography.body,
    fontSize: 14,
    opacity: 0.5,
    marginTop: 0,
  },
  progressContainer: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.three,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  targetDate: {
    ...Typography.smallBold,
    fontSize: 12,
    opacity: 0.6,
  },
});
