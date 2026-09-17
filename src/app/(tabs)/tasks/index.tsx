import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react-native';
import { taskService } from '@/services/task-service';
import { scheduleService } from '@/services/schedule-service';
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

export default function TasksScreen() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [isModalVisible, setModalVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const { data: tasks, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['tasks'],
    queryFn: taskService.getTasks,
  });

  const { data: schedule } = useQuery({
    queryKey: ['schedule'],
    queryFn: scheduleService.getSchedule,
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

  const sortedTasks = React.useMemo(() => {
    if (!tasks) return [];
    return [...tasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tasks]);

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={error.message} onRetry={refetch} />;

  return (
    <Screen scrollable={false}>
      <FlatList
        data={sortedTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          // Calculate miss count based on scheduled blocks that have passed
          const taskBlocks = schedule?.filter(b => b.taskId === item.id) || [];

          let missCount = 0;
          if (item.status !== 'completed') {
            const now = new Date();
            const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            taskBlocks.forEach(block => {
              const isBlockPast = block.startTime < block.endTime
                ? currentHHMM >= block.endTime
                : (currentHHMM >= block.endTime && currentHHMM < block.startTime && currentHHMM < '05:00');
              if (isBlockPast) missCount++;
            });
          }

          const displayTitle = missCount > 0
            ? `${item.title} (Missed ${missCount} time${missCount > 1 ? 's' : ''})`
            : item.title;

          return (
            <TaskCard
              key={`task-${item.id}-${item.status}-${missCount}`}
              task={{ ...item, title: displayTitle } as any}
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
          { paddingBottom: 100 }
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
