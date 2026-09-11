import { apiClient } from './api-client';
import { ScheduleBlock } from '@/types/domain';

export const scheduleService = {
  async getSchedule(): Promise<ScheduleBlock[]> {
    const response = await apiClient.get<ScheduleBlock[]>('/schedule');
    return response.data;
  },

  async generateSchedule(): Promise<ScheduleBlock[]> {
    const response = await apiClient.post<ScheduleBlock[]>('/schedule/generate');
    return response.data;
  },
};
