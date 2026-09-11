import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react-native';
import { taskService } from '@/services/task-service';
import { Screen } from '@/components/ui/screen';
import { TaskCard } from '@/components/ui/task-card';
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

export default function TasksScreen() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [isModalVisible, setModalVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const { data: tasks, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['tasks'],
    queryFn: taskService.getTasks,
  });

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
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onToggleComplete={() => toggleTaskMutation.mutate(item)}
            style={styles.card}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No tasks yet"
            description="Add tasks to your list to stay productive."
          />
        }
        contentContainerStyle={styles.listContent}
      />

      <Button
        icon={<Plus size={24} color="white" />}
        title="Add Task"
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
    paddingBottom: 100,
    paddingHorizontal: Spacing.two,
  },
  card: {
    marginBottom: Spacing.two,
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
