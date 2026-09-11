import { apiClient } from './api-client';
import { ScheduleBlock } from '@/types/domain';
import { AIProviderFactory } from './ai/ai-provider-factory';
import { AIProviderType } from './ai/types';
import { taskService } from './task-service';

export const scheduleService = {
  async getSchedule(): Promise<ScheduleBlock[]> {
    const response = await apiClient.get<ScheduleBlock[]>('/schedule');
    return response.data;
  },

  async generateSchedule(): Promise<ScheduleBlock[]> {
    const provider = AIProviderFactory.getProvider();

    if (provider.getType() === AIProviderType.REMOTE) {
      const response = await apiClient.post<ScheduleBlock[]>('/schedule/generate');
      return response.data;
    } else {
      const tasks = await taskService.getTasks();
      const aiResponse = await provider.generateSchedule(tasks, '9 AM to 5 PM');

      // Save locally generated schedule to backend
      const response = await apiClient.post<ScheduleBlock[]>('/schedule/save', aiResponse);
      return response.data;
    }
  },
};
