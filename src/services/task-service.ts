import { apiClient } from './api-client';
import { Task } from '@/types/domain';

export const taskService = {
  async getTasks(): Promise<Task[]> {
    const response = await apiClient.get<Task[]>('/tasks');
    return response.data;
  },

  async createTask(task: Partial<Task>): Promise<Task> {
    const response = await apiClient.post<Task>('/tasks', task);
    return response.data;
  },

  async updateTask(task: Task): Promise<void> {
    await apiClient.put(`/tasks/${task.id}`, task);
  },

  async deleteTask(id: string): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  },
};
