import React from 'react';
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

import { AIProviderFactory } from '@/services/ai/ai-provider-factory';

export default function GoalRoadmapScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['roadmap', id],
    queryFn: () => goalService.getRoadmap(id),
    retry: false,
  });

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

  if (isLoading) return <LoadingState message="Fetching roadmap..." />;

  if (isError) {
    // If not found, show option to generate
    const isNotFound = error?.message === 'Roadmap not found' || (error as any).response?.status === 404;

    if (isNotFound) {
      return (
        <Screen>
          <View style={styles.header}>
            <ThemedText type="title">Roadmap</ThemedText>
          </View>
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

  return (
    <Screen scrollable={false}>
      <View style={styles.header}>
        <ThemedText type="title">{data?.roadmap.title}</ThemedText>
      </View>

      <FlatList
        data={data?.milestones}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MilestoneCard
            title={item.title}
            status={item.status}
            dueDate={item.dueDate || undefined}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.four,
  },
  listContent: {
    gap: Spacing.three,
    paddingBottom: 40,
  },
  generateButton: {
    marginTop: Spacing.four,
  },
});
