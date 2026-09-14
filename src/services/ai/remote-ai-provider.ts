import { apiClient } from '../api-client';
import {
  AIProvider,
  AIProviderType,
  GoalAnalysisAIResponse,
  RoadmapAIResponse,
  SchedulerAIResponse,
} from './types';

export class RemoteAIProvider implements AIProvider {
  getType(): AIProviderType {
    return AIProviderType.REMOTE;
  }

  getStatus(): 'ONLINE' {
    return 'ONLINE';
  }

  async initialize(): Promise<void> {
    // No-op for remote
  }

  async generateRoadmap(goalTitle: string, goalDescription?: string): Promise<RoadmapAIResponse> {
    throw new Error('RemoteAIProvider delegates high-level tasks to backend service.');
  }

  async analyzeGoal(goalTitle: string, targetDate?: string): Promise<GoalAnalysisAIResponse> {
    const response = await apiClient.post<GoalAnalysisAIResponse>('/ai/analyze-goal', {
      title: goalTitle,
      targetDate,
    });
    return response.data;
  }

  async generateSchedule(tasks: any[], availability: string): Promise<SchedulerAIResponse> {
    throw new Error('RemoteAIProvider delegates scheduling to backend service.');
  }

  async chat(message: string, context?: any): Promise<string> {
    const response = await apiClient.post<{ reply: string }>('/ai/chat', { message });
    return response.data.reply;
  }

  async research(topic: string): Promise<any> {
    const response = await apiClient.post('/ai/research', { topic });
    return response.data;
  }

  cancel(): void {
    // Axios cancellation could be implemented here
  }

  async shutdown(): Promise<void> {
    // No-op for remote
  }
}
