import React from 'react';
import { FlatList, StyleSheet, View, Pressable, Alert } from 'react-native';
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
import { Spacing, Radius } from '@/constants/theme';
import { Calendar, Sparkles, AlarmClock, AlarmClockOff } from 'lucide-react-native';
import { formatTime12h } from '@/utils/date';
import { taskService } from '@/services/task-service';
import { habitService } from '@/services/habit-service';
import { format, addMinutes } from 'date-fns';
import { PlannerSelectionModal } from '@/components/planner-selection-modal';
import { notificationService } from '@/services/notification-service';

export default function TodayScreen() {
  const queryClient = useQueryClient();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [isSelectionModalVisible, setSelectionModalVisible] = React.useState(false);
  const [isPlanningModalDismissed, setIsPlanningModalDismissed] = React.useState(false);
  const [notificationsAvailable, setNotificationsAvailable] = React.useState(false);

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
      if (err.message === 'USER_CANCELLED') {
        console.log('[TodayScreen] generateSchedule cancelled by user');
        return;
      }
      console.error('[TodayScreen] generateSchedule ERROR:', err);
    }
  });

  // Reset planning modal dismissal state when a new generation starts
  React.useEffect(() => {
    if (generateMutation.isPending) {
      setIsPlanningModalDismissed(false);
    }
  }, [generateMutation.isPending]);

  React.useEffect(() => {
    // Only attempt to check availability after a small delay to ensure native modules are initialized
    const timer = setTimeout(() => {
      notificationService.isAvailable().then(setNotificationsAvailable);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const clearMutation = useMutation({
    mutationFn: scheduleService.clearSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });

  const toggleReminderMutation = useMutation({
    mutationFn: async (block: any) => {
      if (!notificationsAvailable) {
        Alert.alert(
          "Reminders Unavailable",
          "The notification module is missing from this build. Please run 'npx expo run:android' to rebuild the app with notification support.",
          [{ text: "OK" }]
        );
        return;
      }

      if (block.reminderEnabled) {
        if (block.reminderId) await notificationService.cancelReminder(block.reminderId);
        return scheduleService.updateReminder(block.id, null, false);
      } else {
        const reminderId = await notificationService.scheduleReminder(block);
        if (reminderId) {
          return scheduleService.updateReminder(block.id, reminderId, true);
        }
      }
    },
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
          onPress={() => setSelectionModalVisible(true)}
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

                {/* Show reminder action for any block that is not Sleep and not already past/done */}
                {item.title !== 'Sleep' && !isCompleted && !isPast && (
                  <View style={styles.reminderActionContainer}>
                    <Button
                      title={item.reminderEnabled ? "Remove" : "Remind"}
                      variant={item.reminderEnabled ? "primary" : "outline"}
                      size="small"
                      onPress={() => toggleReminderMutation.mutate(item)}
                      icon={item.reminderEnabled
                        ? <AlarmClock size={14} color="#fff" />
                        : <AlarmClock size={14} color="#208AEF" />
                      }
                      style={styles.reminderButtonCompact}
                      textStyle={item.reminderEnabled ? { color: "#fff" } : { color: "#208AEF" }}
                    />
                  </View>
                )}
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
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 100 } // Safe padding for bottom tab bar and nav
        ]}
      />

      <PlannerSelectionModal
        visible={isSelectionModalVisible}
        onClose={() => setSelectionModalVisible(false)}
        tasks={tasks?.filter(t => t.status !== 'completed') || []}
        habits={habits?.filter(h => !h.completed) || []}
        loading={generateMutation.isPending}
        onConfirm={(taskIds, habitIds, routines) => {
          generateMutation.mutate({ taskIds, habitIds, routines });
          setSelectionModalVisible(false);
        }}
      />

      <Modal
        visible={generateMutation.isPending && !isPlanningModalDismissed}
        onClose={() => {
          setIsPlanningModalDismissed(true);
          scheduleService.cancelGeneration();
        }}
        title="Planning Your Day"
      >
        <LoadingState message="Orbit AI is organizing your tasks for maximum productivity..." />
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.two,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    alignItems: 'center',
  },
  listContent: {
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
  reminderActionContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    minWidth: 80,
  },
  reminderButtonCompact: {
    minHeight: 32,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.full,
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
