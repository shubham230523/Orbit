import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleService } from '@/services/schedule-service';
import { Screen } from '@/components/ui/screen';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';
import { Spacing } from '@/constants/theme';
import { Calendar, Sparkles } from 'lucide-react-native';
import { formatTime12h } from '@/utils/date';
import { taskService } from '@/services/task-service';
import { habitService } from '@/services/habit-service';
import { format } from 'date-fns';

export default function TodayScreen() {
  const queryClient = useQueryClient();
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const { data: schedule, isLoading: isScheduleLoading, isError: isScheduleError, error: scheduleError, refetch: refetchSchedule } = useQuery({
    queryKey: ['schedule'],
    queryFn: scheduleService.getSchedule,
  });

  const { data: tasks, isLoading: isTasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: taskService.getTasks,
  });

  const { data: habits, isLoading: isHabitsLoading } = useQuery({
    queryKey: ['habits', todayStr],
    queryFn: () => habitService.getHabitsWithStatus(todayStr),
  });

  const generateMutation = useMutation({
    mutationFn: scheduleService.generateSchedule,
    onMutate: async () => {
      // Optimistically clear the schedule from the UI cache
      await queryClient.cancelQueries({ queryKey: ['schedule'] });
      queryClient.setQueryData(['schedule'], []);
    },
    onSuccess: (data) => {
      console.log('[TodayScreen] generateSchedule SUCCESS, items:', data.length);
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
    onError: (err) => {
      console.error('[TodayScreen] generateSchedule ERROR:', err);
    }
  });

  const clearMutation = useMutation({
    mutationFn: scheduleService.clearSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });

  if (isScheduleLoading || isTasksLoading || isHabitsLoading) return <LoadingState />;
  if (isScheduleError) return <ErrorState message={scheduleError.message} onRetry={refetchSchedule} />;

  // Get current HH:MM string for comparison
  const now = new Date();
  const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // Helper to determine if a time block is in the past, accounting for midnight crossover (Sleep)
  const checkIfPast = (start: string, end: string, current: string) => {
    if (start < end) {
      return current >= end;
    }
    // Crossover case (e.g., 21:00 - 05:00)
    // In our 5 AM start cycle, this is only "past" if we've passed the end time (5 AM)
    // but haven't reached the start time (9 PM) AND we consider the very early morning window.
    // Effectively, at 7:53 AM, it's future relative to tonight.
    return current >= end && current < start && current < '05:00';
  };

  return (
    <Screen scrollable={false}>
      <View style={styles.header}>
        <Button
          title="Clear"
          variant="ghost"
          size="small"
          onPress={() => clearMutation.mutate()}
          disabled={clearMutation.isPending || schedule?.length === 0}
        />
        <Button
          title="Plan Day"
          variant="outline"
          size="small"
          icon={<Sparkles size={16} color="gold" />}
          onPress={() => generateMutation.mutate()}
          loading={generateMutation.isPending}
        />
      </View>

      <FlatList
        data={schedule}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          // Check associated task or habit state
          const associatedTask = item.taskId && tasks ? tasks.find(t => t.id === item.taskId) : null;
          const associatedHabit = item.habitId && habits ? habits.find(h => h.id === item.habitId) : null;

          const isCompleted = associatedTask ? associatedTask.status === 'completed' : (associatedHabit ? associatedHabit.completed : false);

          // Determine if past using helper logic
          const isPast = checkIfPast(item.startTime, item.endTime, currentHHMM);

          // Determine if missed: if it's a TASK/HABIT that is past and NOT completed
          const isMissed = (item.type === 'TASK' || item.type === 'HABIT') && isPast && !isCompleted;

          return (
            <Card style={[
              styles.blockCard,
              isCompleted && styles.completedBlockCard,
              isMissed && styles.missedBlockCard,
              (isPast && !isMissed && !isCompleted) && styles.pastBlockCard
            ]}>
              <View style={styles.blockContent}>
                <View style={styles.timeColumn}>
                  <ThemedText type="small" style={[isCompleted && styles.completedText, isMissed && styles.missedText, (isPast && !isMissed && !isCompleted) && styles.pastText]} numberOfLines={1} adjustsFontSizeToFit>{formatTime12h(item.startTime)}</ThemedText>
                  <ThemedText type="small" style={[{ opacity: 0.5 }, isCompleted && styles.completedText, isMissed && styles.missedText, (isPast && !isMissed && !isCompleted) && styles.pastText]} numberOfLines={1} adjustsFontSizeToFit>{formatTime12h(item.endTime)}</ThemedText>
                </View>
                <View style={styles.titleColumn}>
                  <ThemedText type="bodyBold" style={[isCompleted && styles.completedText, isMissed && styles.missedText, (isPast && !isMissed && !isCompleted) && styles.pastText]}>{item.title}</ThemedText>
                  {isCompleted && (
                    <ThemedText type="small" style={styles.badgeCompleted}>✓ Done</ThemedText>
                  )}
                  {isMissed && (
                    <ThemedText type="small" style={styles.badgeMissed}>✕ Missed</ThemedText>
                  )}
                </View>
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            title="Your day is clear"
            description="No tasks scheduled for today."
            icon={<Calendar size={48} color="gray" />}
          />
        }
        contentContainerStyle={styles.listContent}
      />

      <Modal
        visible={generateMutation.isPending}
        onClose={() => {}}
        title="Planning Your Day"
      >
        <LoadingState message="Orbit AI is organizing your tasks for maximum productivity..." />
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.four,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 40,
    paddingHorizontal: Spacing.two,
  },
  blockCard: {
    marginBottom: Spacing.two,
    padding: Spacing.two,
  },
  blockContent: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  timeColumn: {
    width: 90,
    alignItems: 'flex-end',
  },
  titleColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  completedBlockCard: {
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
  },
  missedBlockCard: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
    opacity: 0.6,
  },
  pastBlockCard: {
    backgroundColor: '#FAFAFA',
    borderColor: '#EEEEEE',
    opacity: 0.5,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#388E3C',
    opacity: 0.7,
  },
  missedText: {
    color: '#757575',
    textDecorationLine: 'line-through',
  },
  pastText: {
    color: '#9E9E9E',
  },
  badgeCompleted: {
    color: '#2E7D32',
    fontWeight: 'bold',
    marginTop: 2,
  },
  badgeMissed: {
    color: '#757575',
    fontWeight: 'bold',
    marginTop: 2,
  },
});
