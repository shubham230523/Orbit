import { apiClient } from './api-client';
import { Habit, HabitEntry } from '@/types/domain';

export const habitService = {
  async getHabits(): Promise<Habit[]> {
    const response = await apiClient.get<Habit[]>('/habits');
    return response.data;
  },

  async createHabit(habit: Partial<Habit>): Promise<Habit> {
    const response = await apiClient.post<Habit>('/habits', habit);
    return response.data;
  },

  async logHabit(habitId: string, date: string, completed: boolean): Promise<HabitEntry> {
    const response = await apiClient.post<HabitEntry>(`/habits/${habitId}/log`, { date, completed });
    return response.data;
  },
};
