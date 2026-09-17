import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react-native';
import { taskService } from '@/services/task-service';
import { Screen } from '@/components/ui/screen';
import { ThemedText } from '@/components/themed-text';
import { TaskCard } from '@/components/ui/task-card';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TasksScreen() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [isModalVisible, setModalVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const { data: tasks, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['tasks'],
    queryFn: taskService.getTasks,
  });

  const insets = useSafeAreaInsets();

  const createTaskMutation = useMutation({
    mutationFn: taskService.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setModalVisible(false);
      setNewTaskTitle('');
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: (task: any) =>
      taskService.updateTask({ ...task, status: task.status === 'completed' ? 'todo' : 'completed' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });

  const handleCreateTask = () => {
    if (!newTaskTitle.trim() || !user) return;

    createTaskMutation.mutate({
      id: generateId(),
      userId: user.id,
      title: newTaskTitle,
      status: 'todo',
      priority: 'medium',
      createdAt: toISO(new Date()),
      updatedAt: toISO(new Date()),
    });
  };

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={error.message} onRetry={refetch} />;

  return (
    <Screen scrollable={false}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          // Determine if missed: check if there's a schedule block for this task that has already passed its end time
          const scheduleBlocks = queryClient.getQueryData(['schedule']) as any[];
          const associatedBlock = scheduleBlocks ? scheduleBlocks.find(b => b.taskId === item.id) : null;

          let displayStatus = item.status;
          if (associatedBlock && item.status !== 'completed') {
            const now = new Date();
            const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            // Reusing logic: Past if current >= end (normal) or special crossover rule
            const isBlockPast = associatedBlock.startTime < associatedBlock.endTime
              ? currentHHMM >= associatedBlock.endTime
              : (currentHHMM >= associatedBlock.endTime && currentHHMM < associatedBlock.startTime && currentHHMM < '05:00');

            if (isBlockPast) {
              displayStatus = 'blocked'; // Use blocked status or represent visually as missed
            }
          }

          const enhancedTask = {
            ...item,
            status: displayStatus === 'blocked' && item.status !== 'completed' ? 'blocked' : item.status,
            title: displayStatus === 'blocked' && item.status !== 'completed' ? `${item.title} (Missed)` : item.title
          };

          return (
            <TaskCard
              task={enhancedTask as any}
              onToggleComplete={() => toggleTaskMutation.mutate(item)}
              onDelete={() => deleteTaskMutation.mutate(item.id)}
              style={styles.card}
            />
          );
        }}
        ListEmptyComponent={
          <EmptyState
            title="No tasks yet"
            description="Add tasks to your list to stay productive."
            style={{ flex: 1 }}
          />
        }
        contentContainerStyle={[
          styles.listContent,
          tasks?.length === 0 && { flex: 1 },
          { paddingBottom: insets.bottom + 100 }
        ]}
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
        title="Create New Task"
      >
        <View style={styles.modalContent}>
          <TextInput
            label="What needs to be done?"
            placeholder="e.g. Research React Native"
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            autoFocus
          />
          <Button
            title="Create Task"
            onPress={handleCreateTask}
            loading={createTaskMutation.isPending}
            disabled={!newTaskTitle.trim()}
          />
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: Spacing.two,
    gap: Spacing.three,
    flexGrow: 1,
  },
  card: {
    // marginBottom: Spacing.two, // Handled by gap
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
