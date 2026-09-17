import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Modal } from './ui/modal';
import { ThemedText } from './themed-text';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { TimePicker } from './ui/time-picker';
import { Spacing } from '@/constants/theme';
import { Task, Habit } from '@/types/domain';
import { RoutineTimes } from '@/services/ai/types';
import { format } from 'date-fns';

interface PlannerSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  tasks: Task[];
  habits: Habit[];
  onConfirm: (selectedTaskIds: string[], selectedHabitIds: string[], routines: RoutineTimes) => void;
  loading?: boolean;
}

export const PlannerSelectionModal = ({
  visible,
  onClose,
  tasks = [],
  habits = [],
  onConfirm,
  loading
}: PlannerSelectionModalProps) => {
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [selectedHabits, setSelectedHabits] = useState<Set<string>>(new Set());

  const [sleepTime, setSleepTime] = useState(() => {
    const d = new Date();
    d.setHours(22, 0, 0, 0);
    return d;
  });
  const [breakfastTime, setBreakfastTime] = useState(() => {
    const d = new Date();
    d.setHours(8, 0, 0, 0);
    return d;
  });
  const [lunchTime, setLunchTime] = useState(() => {
    const d = new Date();
    d.setHours(13, 0, 0, 0);
    return d;
  });
  const [dinnerTime, setDinnerTime] = useState(() => {
    const d = new Date();
    d.setHours(19, 0, 0, 0);
    return d;
  });

  useEffect(() => {
    if (visible) {
      console.log('[PlannerSelectionModal] Visible, items:', tasks.length, habits.length);
      setSelectedTasks(new Set(tasks.map(t => t.id)));
      setSelectedHabits(new Set(habits.map(h => h.id)));
    }
  }, [visible, tasks.length, habits.length]);

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
    const routines: RoutineTimes = {
      sleepStart: format(sleepTime, 'HH:mm'),
      breakfastStart: format(breakfastTime, 'HH:mm'),
      lunchStart: format(lunchTime, 'HH:mm'),
      dinnerStart: format(dinnerTime, 'HH:mm'),
    };
    console.log('[PlannerSelectionModal] Confirming with routines:', routines);
    onConfirm(Array.from(selectedTasks), Array.from(selectedHabits), routines);
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Plan Your Day">
      <View style={styles.container}>
        <View style={styles.actions}>
          <Button title="Select All" variant="ghost" size="small" onPress={handleSelectAll} />
          <Button title="Clear All" variant="ghost" size="small" onPress={handleDeselectAll} />
        </View>

        <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>Routine Settings</ThemedText>
            <View style={styles.routineGrid}>
              <View style={styles.routineItem}>
                <TimePicker label="Sleep" value={sleepTime} onChange={setSleepTime} />
              </View>
              <View style={styles.routineItem}>
                <TimePicker label="Breakfast" value={breakfastTime} onChange={setBreakfastTime} />
              </View>
              <View style={styles.routineItem}>
                <TimePicker label="Lunch" value={lunchTime} onChange={setLunchTime} />
              </View>
              <View style={styles.routineItem}>
                <TimePicker label="Dinner" value={dinnerTime} onChange={setDinnerTime} />
              </View>
            </View>
          </View>

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
          disabled={(selectedTasks.size === 0 && selectedHabits.size === 0) || loading}
          style={styles.confirmButton}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 550,
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
  routineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  routineItem: {
    width: '48%',
    marginBottom: Spacing.two,
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
