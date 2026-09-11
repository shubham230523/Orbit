import { apiClient } from './api-client';
import { Goal, Roadmap, Milestone } from '@/types/domain';
import { AIProviderFactory } from './ai/ai-provider-factory';
import { AIProviderType } from './ai/types';

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

  async getRoadmap(goalId: string): Promise<{ roadmap: Roadmap; milestones: Milestone[] }> {
    const response = await apiClient.get<{ roadmap: Roadmap; milestones: Milestone[] }>(
      `/goals/${goalId}/roadmap`,
    );
    return response.data;
  },

  async generateRoadmap(goalId: string): Promise<{ roadmap: Roadmap; milestones: Milestone[] }> {
    const provider = AIProviderFactory.getProvider();

    if (provider.getType() === AIProviderType.REMOTE) {
      const response = await apiClient.post<{ roadmap: Roadmap; milestones: Milestone[] }>(
        `/goals/${goalId}/roadmap/generate`,
      );
      return response.data;
    } else {
      const goal = await this.getGoal(goalId);
      const aiResponse = await provider.generateRoadmap(goal.title, goal.description);

      // Save locally generated roadmap to backend
      const response = await apiClient.post<{ roadmap: Roadmap; milestones: Milestone[] }>(
        `/goals/${goalId}/roadmap/save`,
        aiResponse,
      );
      return response.data;
    }
  },
};
