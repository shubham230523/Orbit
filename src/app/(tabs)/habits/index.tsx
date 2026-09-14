import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react-native';
import { habitService } from '@/services/habit-service';
import { Screen } from '@/components/ui/screen';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';
import { TextInput } from '@/components/ui/text-input';
import { Spacing, Radius } from '@/constants/theme';
import { generateId } from '@/utils/id';
import { useAuthStore } from '@/store/use-auth-store';
import { toISO, formatDate } from '@/utils/date';

export default function HabitsScreen() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [isModalVisible, setModalVisible] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const { data: habits, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['habits', today],
    queryFn: () => habitService.getHabitsWithStatus(today),
  });

  const createHabitMutation = useMutation({
    mutationFn: habitService.createHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      setModalVisible(false);
      setNewHabitTitle('');
    },
  });

  const logHabitMutation = useMutation({
    mutationFn: ({ habitId, completed }: { habitId: string; completed: boolean }) =>
      habitService.logHabit(habitId, today, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  const handleCreateHabit = () => {
    if (!newHabitTitle.trim() || !user) return;

    createHabitMutation.mutate({
      id: generateId(),
      userId: user.id,
      title: newHabitTitle,
      frequency: 'DAILY',
      createdAt: toISO(new Date()),
    });
  };

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={error.message} onRetry={refetch} />;

  return (
    <Screen scrollable={false}>
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.habitCard}>
            <Checkbox
              checked={item.completed}
              onValueChange={(val) => logHabitMutation.mutate({ habitId: item.id, completed: val })}
              label={item.title}
            />
          </Card>
        )}
        ListEmptyComponent={
          <EmptyState
            title="No habits tracked"
            description="Consistency is key. Start your first habit today."
            style={{ flex: 1 }}
          />
        }
        contentContainerStyle={[styles.listContent, habits?.length === 0 && { flex: 1 }]}
      />

      <Button
        icon={<Plus size={24} color="white" />}
        title=""
        onPress={() => setModalVisible(true)}
        style={styles.fab}
      />

      <Modal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        title="New Habit"
      >
        <View style={styles.modalContent}>
          <TextInput
            label="What habit do you want to build?"
            placeholder="e.g. Morning Meditation"
            value={newHabitTitle}
            onChangeText={setNewHabitTitle}
            autoFocus
          />
          <Button
            title="Create Habit"
            onPress={handleCreateHabit}
            loading={createHabitMutation.isPending}
            disabled={!newHabitTitle.trim()}
          />
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 100,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    flexGrow: 1,
  },
  habitCard: {
    padding: Spacing.three,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.four,
    right: Spacing.four,
    borderRadius: Radius.full,
    height: 56,
    width: 56,
    elevation: 5,
    padding: 0,
  },
  modalContent: {
    gap: Spacing.four,
  },
});
