import React, { useState } from 'react';
import { FlatList, StyleSheet, View, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react-native';
import { goalService } from '@/services/goal-service';
import { Screen } from '@/components/ui/screen';
import { ThemedText } from '@/components/themed-text';
import { GoalCard } from '@/components/ui/goal-card';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';
import { TextInput } from '@/components/ui/text-input';
import { Spacing, Radius } from '@/constants/theme';
import { generateId } from '@/utils/id';
import { useAuthStore } from '@/store/use-auth-store';
import { toISO } from '@/utils/date';

import { useAIStore } from '@/store/use-ai-store';
import { AIProviderFactory } from '@/services/ai/ai-provider-factory';
import { AIProviderType } from '@/services/ai/types';
import { useRouter } from 'expo-router';
import { DatePicker } from '@/components/ui/date-picker';
import { getRandomCatchyMessage } from '@/utils/ai-messages';

export default function GoalsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [isModalVisible, setModalVisible] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [targetDate, setTargetDate] = useState<Date | null>(null);
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
      setTargetDate(null);
      setIsAnalyzing(false);
    },
    onError: (err) => {
      console.error('[GoalsScreen] createGoalMutation FAILED:', err);
      setIsAnalyzing(false);
      Alert.alert('Error', 'Failed to create goal: ' + err.message);
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: goalService.deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const handleCreateGoal = async () => {
    if (!newGoalTitle.trim() || !user) return;

    const { providerType, isModelDownloaded } = useAIStore.getState();
    const shouldAttemptAI = providerType === AIProviderType.REMOTE || (providerType === AIProviderType.LOCAL && isModelDownloaded);

    const baseGoal: Partial<Goal> = {
      id: generateId(),
      userId: user.id,
      title: newGoalTitle,
      status: 'active',
      priority: 'medium',
      targetDate: targetDate ? targetDate.toISOString().split('T')[0] : undefined,
      createdAt: toISO(new Date()),
      updatedAt: toISO(new Date()),
    };

    if (shouldAttemptAI) {
      setIsAnalyzing(true);
      try {
        const provider = AIProviderFactory.getProvider();
        const analysis = await provider.analyzeGoal(
          newGoalTitle,
          targetDate ? targetDate.toISOString().split('T')[0] : undefined
        );

        createGoalMutation.mutate({
          ...baseGoal,
          description: analysis.objective,
        });
        return;
      } catch (e) {
        console.warn('AI analysis failed, falling back to basic creation', e);
        setIsAnalyzing(false);
      }
    }

    createGoalMutation.mutate(baseGoal);
  };

  const handleDeletePress = (goal: Goal) => {
    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${goal.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteGoalMutation.mutate(goal.id),
        },
      ]
    );
  };

  const loadingMsg = getRandomCatchyMessage();

  if (isLoading) return <LoadingState message="Fetching goals..." />;
  if (isError) return <ErrorState message={error.message} onRetry={refetch} />;

  return (
    <Screen scrollable={false}>
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GoalCard
            goal={item}
            progress={0}
            onPress={() => router.push(`/goals/${item.id}/roadmap`)}
            onLongPress={() => handleDeletePress(item)}
            style={styles.card}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No goals yet"
            description="Create your first goal to get started."
            style={{ flex: 1 }}
          />
        }
        contentContainerStyle={[styles.listContent, goals?.length === 0 && { flex: 1 }]}
      />

      <Button
        icon={<Plus size={24} color="white" />}
        title=""
        onPress={() => setModalVisible(true)}
        style={styles.fab}
      />

      <Modal
        visible={isModalVisible}
        onClose={() => !isAnalyzing && setModalVisible(false)}
        title="Create New Goal"
      >
        <View style={styles.modalContent}>
          <TextInput
            label="What is your goal?"
            placeholder="e.g. Learn React Native"
            value={newGoalTitle}
            onChangeText={setNewGoalTitle}
            editable={!isAnalyzing}
            autoFocus
          />
          <DatePicker
            label="Target Date (Optional)"
            value={targetDate || new Date()}
            onChange={setTargetDate}
            disabled={isAnalyzing}
          />
          <Button
            title={isAnalyzing ? "Analyzing..." : 'Create Goal'}
            onPress={handleCreateGoal}
            loading={createGoalMutation.isPending || isAnalyzing}
            disabled={!newGoalTitle.trim()}
          />
          {isAnalyzing && (
            <ThemedText type="small" style={{ textAlign: 'center', marginTop: Spacing.two }}>
              {getRandomCatchyMessage()}
            </ThemedText>
          )}
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 100,
    paddingHorizontal: Spacing.four,
    flexGrow: 1,
  },
  card: {
    marginBottom: Spacing.three,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.four,
    right: Spacing.four,
    borderRadius: Radius.full,
    height: 56,
    width: 56,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    padding: 0,
  },
  modalContent: {
    gap: Spacing.four,
  },
});