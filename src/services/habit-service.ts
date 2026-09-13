import { v4 as uuidv4 } from 'uuid';
import { runQuery, runExecute } from '@/db/client';
import { Habit, HabitEntry } from '@/types/domain';
import { useAuthStore } from '@/store/use-auth-store';

export const habitService = {
  async getHabitsWithStatus(date: string): Promise<(Habit & { completed: boolean })[]> {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return [];

    const rows = await runQuery<any>(
      `SELECT h.*, (SELECT e.completed FROM habit_entries e WHERE e.habitId = h.id AND e.date = ?) as completed
       FROM habits h WHERE h.userId = ? ORDER BY h.createdAt DESC`,
      [date, userId]
    );

    return rows.map(row => ({
      ...row,
      completed: row.completed === 1
    }));
  },

  async createHabit(habit: Partial<Habit>): Promise<Habit> {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Not authenticated');

    const id = uuidv4();
    const now = new Date().toISOString();

    const newHabit: Habit = {
      id,
      userId,
      title: habit.title || '',
      frequency: habit.frequency || 'DAILY',
      createdAt: now,
    };

    await runExecute(
      'INSERT INTO habits (id, userId, title, frequency, createdAt) VALUES (?, ?, ?, ?, ?)',
      [newHabit.id, newHabit.userId, newHabit.title, newHabit.frequency, newHabit.createdAt]
    );

    return newHabit;
  },

  async logHabit(habitId: string, date: string, completed: boolean): Promise<HabitEntry> {
    const id = uuidv4();
    const completedInt = completed ? 1 : 0;

    // Use INSERT OR REPLACE to handle the UNIQUE(habitId, date) constraint
    await runExecute(
      'INSERT OR REPLACE INTO habit_entries (id, habitId, date, completed) VALUES (?, ?, ?, ?)',
      [id, habitId, date, completedInt]
    );

    return {
      id,
      habitId,
      date,
      completed,
    };
  },

  async getHabitEntries(habitId: string): Promise<HabitEntry[]> {
    const rows = await runQuery<any>(
      'SELECT * FROM habit_entries WHERE habitId = ?',
      [habitId]
    );

    return rows.map(row => ({
      ...row,
      completed: row.completed === 1
    }));
  }
};
