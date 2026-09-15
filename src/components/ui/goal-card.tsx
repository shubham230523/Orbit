import { StyleSheet, Text, View, Pressable, ViewStyle } from 'react-native';
import { Goal } from '@/types/domain';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Typography, Radius } from '@/constants/theme';
import { Card } from './card';
import { ProgressRing } from './progress-ring';
import { Calendar, Trash2 } from 'lucide-react-native';

export interface GoalCardProps {
  goal: Goal;
  progress: number; // 0 to 1
  onPress?: () => void;
  onLongPress?: () => void;
  onDelete?: () => void;
  style?: ViewStyle;
}

export const GoalCard = ({ goal, progress, onPress, onLongPress, onDelete, style }: GoalCardProps) => {
  const colors = useTheme();

  return (
    <Card
      elevated
      style={[
        {
          padding: 0,
          overflow: 'hidden',
          borderColor: 'rgba(0,0,0,0.05)',
          borderWidth: 1,
        },
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        android_ripple={{ color: colors.backgroundSelected }}
        style={styles.pressable}
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

          <View style={styles.rightSection}>
            <View style={styles.progressContainer}>
              <ProgressRing
                progress={progress}
                size={48}
                strokeWidth={4}
                color={colors.primary}
                trackColor={colors.backgroundSelected}
                showText
              />
            </View>
          </View>
        </View>

        {(goal.targetDate || onDelete) && (
          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              {goal.targetDate && (
                <>
                  <Calendar size={12} color={colors.textSecondary} />
                  <Text style={[styles.targetDate, { color: colors.textSecondary }]}>
                    Target: {goal.targetDate}
                  </Text>
                </>
              )}
            </View>
            {onDelete && (
              <Pressable
                onPress={onDelete}
                hitSlop={15}
                style={styles.deleteButton}
                testID="goal-card-delete-button"
              >
                <Trash2 size={12} color="#FF4D4D" />
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
            )}
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
    gap: 4,
  },
  title: {
    ...Typography.bodyBold,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  description: {
    ...Typography.body,
    fontSize: 14,
    opacity: 0.6,
    lineHeight: 20,
  },
  progressContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 24,
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: Spacing.two,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.3)',
    borderRadius: Radius.small,
    backgroundColor: 'rgba(255, 77, 77, 0.05)',
  },
  deleteText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF4D4D',
    textTransform: 'uppercase',
  },
  percentageText: {
    fontSize: 10,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
    paddingTop: Spacing.one,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  targetDate: {
    ...Typography.smallBold,
    fontSize: 12,
    opacity: 0.5,
  },
});
