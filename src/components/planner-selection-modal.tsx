import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Modal } from './ui/modal';
import { ThemedText } from './themed-text';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { Spacing } from '@/constants/theme';
import { Task, Habit } from '@/types/domain';

interface PlannerSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  tasks: Task[];
  habits: Habit[];
  onConfirm: (selectedTaskIds: string[], selectedHabitIds: string[]) => void;
  loading?: boolean;
}

export const PlannerSelectionModal = ({
  visible,
  onClose,
  tasks,
  habits,
  onConfirm,
  loading
}: PlannerSelectionModalProps) => {
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [selectedHabits, setSelectedHabits] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (visible) {
      // Default to select all
      setSelectedTasks(new Set(tasks.map(t => t.id)));
      setSelectedHabits(new Set(habits.map(h => h.id)));
    }
  }, [visible, tasks, habits]);

  const toggleTask = (id: string) => {
    const next = new Set(selectedTasks);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedTasks(next);
  };

  const toggleHabit = (id: string) => {
    const next = new Set(selectedHabits);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedHabits(next);
  };

  const handleSelectAll = () => {
    setSelectedTasks(new Set(tasks.map(t => t.id)));
    setSelectedHabits(new Set(habits.map(h => h.id)));
  };

  const handleDeselectAll = () => {
    setSelectedTasks(new Set());
    setSelectedHabits(new Set());
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selectedTasks), Array.from(selectedHabits));
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Select for Today">
      <View style={styles.container}>
        <View style={styles.actions}>
          <Button title="Select All" variant="ghost" size="small" onPress={handleSelectAll} />
          <Button title="Clear All" variant="ghost" size="small" onPress={handleDeselectAll} />
        </View>

        <ScrollView style={styles.scrollList}>
          {habits.length > 0 && (
            <View style={styles.section}>
              <ThemedText type="smallBold" style={styles.sectionTitle}>Habits</ThemedText>
              {habits.map(habit => (
                <Checkbox
                  key={habit.id}
                  checked={selectedHabits.has(habit.id)}
                  onValueChange={() => toggleHabit(habit.id)}
                  label={habit.title}
                  style={styles.item}
                />
              ))}
            </View>
          )}

          {tasks.length > 0 && (
            <View style={styles.section}>
              <ThemedText type="smallBold" style={styles.sectionTitle}>Tasks</ThemedText>
              {tasks.map(task => (
                <Checkbox
                  key={task.id}
                  checked={selectedTasks.has(task.id)}
                  onValueChange={() => toggleTask(task.id)}
                  label={task.title}
                  style={styles.item}
                />
              ))}
            </View>
          )}

          {tasks.length === 0 && habits.length === 0 && (
            <ThemedText type="body" style={styles.empty}>No pending items to schedule.</ThemedText>
          )}
        </ScrollView>

        <Button
          title="Generate Schedule"
          onPress={handleConfirm}
          loading={loading}
          disabled={selectedTasks.size === 0 && selectedHabits.size === 0}
          style={styles.confirmButton}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 400,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  scrollList: {
    marginBottom: Spacing.four,
  },
  section: {
    marginBottom: Spacing.four,
  },
  sectionTitle: {
    opacity: 0.6,
    marginBottom: Spacing.two,
    textTransform: 'uppercase',
  },
  item: {
    paddingVertical: Spacing.one,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: Spacing.four,
    opacity: 0.6,
  },
  confirmButton: {
    marginTop: Spacing.two,
  },
});
