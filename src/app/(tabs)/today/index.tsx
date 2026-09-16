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

export default function TodayScreen() {
  const queryClient = useQueryClient();

  const { data: schedule, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['schedule'],
    queryFn: scheduleService.getSchedule,
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

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={error.message} onRetry={refetch} />;

  // Get current HH:MM string for comparison
  const now = new Date();
  const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const tasksQuery = queryClient.getQueryData(['tasks']) as any[];

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
          // Check associated task state
          const associatedTask = item.taskId && tasksQuery ? tasksQuery.find(t => t.id === item.taskId) : null;
          const isTaskCompleted = associatedTask ? associatedTask.status === 'completed' : false;

          // Determine if missed: if current day time is greater than task end time (or start time if no duration) and not completed
          const isMissed = item.type === 'TASK' && !isTaskCompleted && item.endTime < currentHHMM;

          return (
            <Card style={[styles.blockCard, isTaskCompleted && styles.completedBlockCard, isMissed && styles.missedBlockCard]}>
              <View style={styles.blockContent}>
                <View style={styles.timeColumn}>
                  <ThemedText type="small" style={[isTaskCompleted && styles.completedText, isMissed && styles.missedText]} numberOfLines={1} adjustsFontSizeToFit>{formatTime12h(item.startTime)}</ThemedText>
                  <ThemedText type="small" style={[{ opacity: 0.5 }, isTaskCompleted && styles.completedText, isMissed && styles.missedText]} numberOfLines={1} adjustsFontSizeToFit>{formatTime12h(item.endTime)}</ThemedText>
                </View>
                <View style={styles.titleColumn}>
                  <ThemedText type="bodyBold" style={[isTaskCompleted && styles.completedText, isMissed && styles.missedText]}>{item.title}</ThemedText>
                  {isTaskCompleted && (
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
    backgroundColor: '#FFEBEE',
    borderColor: '#FFCDD2',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#388E3C',
    opacity: 0.7,
  },
  missedText: {
    color: '#D32F2F',
    opacity: 0.8,
  },
  badgeCompleted: {
    color: '#2E7D32',
    fontWeight: 'bold',
    marginTop: 2,
  },
  badgeMissed: {
    color: '#C62828',
    fontWeight: 'bold',
    marginTop: 2,
  },
});
