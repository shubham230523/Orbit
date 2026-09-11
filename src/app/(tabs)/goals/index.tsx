import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react-native';
import { goalService } from '@/services/goal-service';
import { Screen } from '@/components/ui/screen';
import { GoalCard } from '@/components/ui/goal-card';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';
import { TextInput } from '@/components/ui/text-input';
import { Spacing } from '@/constants/theme';
import { generateId } from '@/utils/id';
import { useAuthStore } from '@/store/use-auth-store';
import { toISO } from '@/utils/date';

import { useAIStore } from '@/store/use-ai-store';
import { AIProviderFactory } from '@/services/ai/ai-provider-factory';

export default function GoalsScreen() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [isModalVisible, setModalVisible] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: goals, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['goals'],
    queryFn: goalService.getGoals,
  });

  const createGoalMutation = useMutation({
    mutationFn: goalService.createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setModalVisible(false);
      setNewGoalTitle('');
      setIsAnalyzing(false);
    },
  });

  const handleCreateGoal = async () => {
    if (!newGoalTitle.trim() || !user) return;

    setIsAnalyzing(true);
    try {
      const provider = AIProviderFactory.getProvider();
      const analysis = await provider.analyzeGoal(newGoalTitle);

      createGoalMutation.mutate({
        id: generateId(),
        userId: user.id,
        title: newGoalTitle,
        description: analysis.objective,
        status: 'active',
        priority: 'medium',
        createdAt: toISO(new Date()),
        updatedAt: toISO(new Date()),
      });
    } catch (e) {
      console.warn('AI analysis failed, falling back to basic creation', e);
      createGoalMutation.mutate({
        id: generateId(),
        userId: user.id,
        title: newGoalTitle,
        status: 'active',
        priority: 'medium',
        createdAt: toISO(new Date()),
        updatedAt: toISO(new Date()),
      });
    }
  };

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={error.message} onRetry={refetch} />;

  return (
    <Screen scrollable={false}>
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GoalCard goal={item} progress={0} style={styles.card} />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No goals yet"
            description="Create your first goal to get started."
          />
        }
        contentContainerStyle={styles.listContent}
      />

      <Button
        icon={<Plus size={24} color="white" />}
        title="Add Goal"
        onPress={() => setModalVisible(true)}
        style={styles.fab}
      />

      <Modal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        title="Create New Goal"
      >
        <View style={styles.modalContent}>
          <TextInput
            label="What is your goal?"
            placeholder="e.g. Learn React Native"
            value={newGoalTitle}
            onChangeText={setNewGoalTitle}
            autoFocus
          />
          <Button
            title={isAnalyzing ? 'Analyzing with AI...' : 'Create Goal'}
            onPress={handleCreateGoal}
            loading={createGoalMutation.isPending || isAnalyzing}
            disabled={!newGoalTitle.trim()}
          />
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 100,
  },
  card: {
    marginBottom: Spacing.three,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.four,
    right: Spacing.four,
    borderRadius: 30,
    height: 60,
    width: 150,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContent: {
    gap: Spacing.four,
  },
});