import {
  AIProvider,
  AIProviderType,
  LocalModelStatus,
  RoadmapAIResponse,
  GoalAnalysisAIResponse,
  SchedulerAIResponse
} from '@/services/ai/types';
import { Task } from '@/types/domain';

export class TestAIProvider implements AIProvider {
  private roadmapResponse: RoadmapAIResponse = { milestones: [] };
  private goalAnalysisResponse: GoalAnalysisAIResponse = {
    objective: 'Test Objective',
    constraints: [],
    measurableOutcomes: [],
    estimatedDurationWeeks: 4,
    category: 'Test'
  };
  private schedulerResponse: SchedulerAIResponse = { schedule: [] };
  private chatResponse: string = 'Test Chat Response';

  getType(): AIProviderType {
    return AIProviderType.LOCAL;
  }

  getStatus(): LocalModelStatus | 'ONLINE' {
    return LocalModelStatus.LOADED;
  }

  async initialize(): Promise<void> {
    return Promise.resolve();
  }

  setRoadmapResponse(response: RoadmapAIResponse) {
    this.roadmapResponse = response;
  }

  async generateRoadmap(_goalTitle: string, _goalDescription?: string): Promise<RoadmapAIResponse> {
    return Promise.resolve(this.roadmapResponse);
  }

  async analyzeGoal(_goalTitle: string): Promise<GoalAnalysisAIResponse> {
    return Promise.resolve(this.goalAnalysisResponse);
  }

  async generateSchedule(_tasks: Task[], _availability: string): Promise<SchedulerAIResponse> {
    return Promise.resolve(this.schedulerResponse);
  }

  async chat(_message: string, _context?: any): Promise<string> {
    return Promise.resolve(this.chatResponse);
  }

  async research(_topic: string): Promise<any> {
    return Promise.resolve({});
  }

  cancel(): void {}

  async shutdown(): Promise<void> {
    return Promise.resolve();
  }
}
