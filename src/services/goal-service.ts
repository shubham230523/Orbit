import { apiClient } from './api-client';
import { Goal } from '@/types/domain';

export const goalService = {
  async getGoals(): Promise<Goal[]> {
    const response = await apiClient.get<Goal[]>('/goals');
    return response.data;
  },

  async getGoal(id: string): Promise<Goal> {
    const response = await apiClient.get<Goal>(`/goals/${id}`);
    return response.data;
  },

  async createGoal(goal: Partial<Goal>): Promise<Goal> {
    const response = await apiClient.post<Goal>('/goals', goal);
    return response.data;
  },

  async updateGoal(goal: Goal): Promise<void> {
    await apiClient.put(`/goals/${goal.id}`, goal);
  },

  async deleteGoal(id: string): Promise<void> {
    await apiClient.delete(`/goals/${id}`);
  },
};
