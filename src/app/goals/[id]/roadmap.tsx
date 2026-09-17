import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalService } from '@/services/goal-service';
import { Screen } from '@/components/ui/screen';
import { ThemedText } from '@/components/themed-text';
import { MilestoneCard } from '@/components/ui/milestone-card';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Spacing } from '@/constants/theme';
import { Sparkles } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AIProviderFactory } from '@/services/ai/ai-provider-factory';
import { taskService } from '@/services/task-service';
import { useAuthStore } from '@/store/use-auth-store';
import { toISO } from '@/utils/date';
import { getRandomCatchyMessage } from '@/utils/ai-messages';

export default function GoalRoadmapScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: goal } = useQuery({
    queryKey: ['goal', id],
    queryFn: () => goalService.getGoal(id),
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['roadmap', id],
    queryFn: () => goalService.getRoadmap(id),
    retry: false,
  });

  const { data: existingTasks } = useQuery({
    queryKey: ['tasks', 'goal', id],
    queryFn: () => taskService.getTasks(),
    select: (tasks) => tasks.filter(t => t.goalId === id)
  });

  const [convertingIds, setConvertingIds] = useState<Set<string>>(new Set());

  const [convertedIds, setConvertedIds] = useState<Set<string>>(new Set());

  const generateMutation = useMutation({
    mutationFn: async () => {
      console.log('[RoadmapScreen] Starting generation for goal:', id);
      return goalService.generateRoadmap(id);
    },
    onSuccess: () => {
      console.log('[RoadmapScreen] Generation successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['roadmap', id] });
    },
    onError: (err) => {
      console.error('[RoadmapScreen] Generation failed:', err);
    }
  });

  const convertToTaskMutation = useMutation({
    mutationFn: async (milestone: any) => {
      setConvertingIds(prev => new Set(prev).add(milestone.id));
      console.log('[RoadmapScreen] Converting milestone to task:', milestone.title);
      return taskService.createTask({
        title: milestone.title,
        description: milestone.description,
        goalId: id,
        priority: 'medium',
        status: 'todo',
      });
    },
    onSuccess: (_, milestone) => {
      console.log('[RoadmapScreen] Task created successfully');
      setConvertedIds(prev => new Set(prev).add(milestone.id));
      setConvertingIds(prev => {
        const next = new Set(prev);
        next.delete(milestone.id);
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (err, milestone) => {
      setConvertingIds(prev => {
        const next = new Set(prev);
        next.delete(milestone.id);
        return next;
      });
    }
  });

  if (isLoading || !goal) return <LoadingState message={getRandomCatchyMessage()} />;

  if (isError) {
    // If not found, show option to generate
    const isNotFound = error?.message === 'Roadmap not found' || (error as any).response?.status === 404;

    if (isNotFound) {
      return (
        <Screen>
          <EmptyState
            title="No roadmap yet"
            description="Let AI create a step-by-step plan for you."
            icon={<Sparkles size={48} color="gold" />}
            style={{ flex: 1 }}
          />
          <Button
            title="Generate Roadmap"
            onPress={() => generateMutation.mutate()}
            loading={generateMutation.isPending}
            style={styles.generateButton}
          />
        </Screen>
      );
    }
    return <ErrorState message={error?.message || 'Error'} onRetry={refetch} />;
  }

  const insets = useSafeAreaInsets();

  return (
    <Screen scrollable={false}>
      <View style={styles.goalHeader}>
        <ThemedText type="smallBold" style={styles.goalLabel}>Goal</ThemedText>
        <ThemedText type="title">{goal.title}</ThemedText>
      </View>

      <FlatList
        data={data?.milestones}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isAlreadyTask = existingTasks?.some(t => t.title.toLowerCase() === item.title.toLowerCase());
          const isBeingConverted = convertingIds.has(item.id);
          const isJustConverted = convertedIds.has(item.id);

          return (
            <MilestoneCard
              title={item.title}
              status={item.status}
              dueDate={item.dueDate || undefined}
              onAction={() => convertToTaskMutation.mutate(item)}
              isActioned={isAlreadyTask || isJustConverted}
              loading={isBeingConverted}
            />
          );
        }}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom, 40) + Spacing.four }
        ]}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  goalHeader: {
    marginBottom: Spacing.six,
    paddingHorizontal: Spacing.four,
  },
  goalLabel: {
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
    color: '#208AEF',
    marginBottom: Spacing.one,
  },
  listContent: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  generateButton: {
    marginTop: Spacing.four,
  },
});
