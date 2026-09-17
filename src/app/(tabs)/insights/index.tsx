import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { insightService } from '@/services/insight-service';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { ProgressRing } from '@/components/ui/progress-ring';
import { LoadingState } from '@/components/ui/loading-state';
import { Spacing } from '@/constants/theme';
import { Trophy, Flame, Target, Clock } from 'lucide-react-native';

export default function InsightsScreen() {
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['productivity-stats'],
    queryFn: insightService.getProductivityStats,
  });

  if (isLoading) return <LoadingState />;

  return (
    <Screen style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          <Card style={styles.statCard}>
            <View style={styles.statHeader}>
              <Trophy size={20} color="#FFD700" />
              <ThemedText type="smallBold" style={styles.statLabel}>Completion</ThemedText>
            </View>
            <View style={styles.statBody}>
              <ProgressRing
                progress={(stats?.completionRate || 0) / 100}
                size={80}
                showText
                color="#4CAF50"
              />
              <ThemedText type="small" style={styles.statDetail}>
                {stats?.tasksCompleted} / {stats?.totalTasks} Tasks
              </ThemedText>
            </View>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statHeader}>
              <Flame size={20} color="#FF5722" />
              <ThemedText type="smallBold" style={styles.statLabel}>Top Streak</ThemedText>
            </View>
            <View style={styles.streakBody}>
              <ThemedText type="h1" style={styles.streakValue}>
                {Math.max(0, ...Object.values(stats?.habitStreaks || {}), 0)}
              </ThemedText>
              <ThemedText type="small">Days Strong</ThemedText>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Habit Streaks</ThemedText>
          {Object.entries(stats?.habitStreaks || {}).map(([title, streak]) => (
            <Card key={title} style={styles.habitRow}>
              <ThemedText type="bodyBold">{title}</ThemedText>
              <View style={styles.streakBadge}>
                <Flame size={14} color="#FF5722" />
                <ThemedText type="smallBold">{streak}</ThemedText>
              </View>
            </Card>
          ))}
          {Object.keys(stats?.habitStreaks || {}).length === 0 && (
            <ThemedText type="body" style={styles.emptyText}>Start a habit to see streaks here.</ThemedText>
          )}
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Weekly Activity</ThemedText>
          <Card style={styles.chartCard}>
            <View style={styles.barContainer}>
              {stats?.weeklyActivity.map((day) => (
                <View key={day.day} style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      { height: Math.min(day.completed * 20, 100) || 5 }
                    ]}
                  />
                  <ThemedText type="small" style={styles.barLabel}>{day.day}</ThemedText>
                </View>
              ))}
            </View>
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.six,
  },
  grid: {
    flexDirection: 'row',
    gap: Spacing.four,
  },
  statCard: {
    flex: 1,
    padding: Spacing.three,
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  statLabel: {
    opacity: 0.6,
  },
  statBody: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  statDetail: {
    opacity: 0.7,
  },
  streakBody: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
  },
  streakValue: {
    color: '#FF5722',
  },
  section: {
    gap: Spacing.three,
  },
  sectionTitle: {
    marginBottom: Spacing.one,
  },
  habitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    backgroundColor: '#FFF3E0',
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chartCard: {
    padding: Spacing.four,
  },
  barContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  barWrapper: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  bar: {
    width: 20,
    backgroundColor: '#208AEF',
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    opacity: 0.6,
  },
  emptyText: {
    opacity: 0.5,
    textAlign: 'center',
    paddingVertical: Spacing.four,
  },
});
