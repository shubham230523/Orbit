import { Task } from '@/types/domain';

export enum AIProviderType {
  LOCAL = 'LOCAL',
  REMOTE = 'REMOTE',
}

export enum LocalModelStatus {
  NOT_INSTALLED = 'NOT_INSTALLED',
  DOWNLOADING = 'DOWNLOADING',
  PAUSED = 'PAUSED',
  VERIFYING = 'VERIFYING',
  INSTALLED = 'INSTALLED',
  LOADING = 'LOADING',
  LOADED = 'LOADED',
  UNLOADING = 'UNLOADING',
  FAILED = 'FAILED',
}

export interface ModelMetadata {
  name: string;
  version: string;
  size: number;
  format: 'GGUF';
}

export interface AIChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface RoadmapMilestone {
  title: string;
  description: string;
  estimatedWeeks: number;
}

export interface RoadmapAIResponse {
  milestones: RoadmapMilestone[];
}

export interface GoalAnalysisAIResponse {
  objective: string;
  constraints: string[];
  measurableOutcomes: string[];
  estimatedDurationWeeks: number;
  category: string;
}

export interface ScheduledTask {
  taskId: string;
  startTime: string;
  endTime: string;
  reason: string;
}

export interface SchedulerAIResponse {
  schedule: ScheduledTask[];
}

export interface AIProvider {
  getType(): AIProviderType;
  getStatus(): LocalModelStatus | 'ONLINE';
  initialize(): Promise<void>;
  generateRoadmap(goalTitle: string, goalDescription?: string): Promise<RoadmapAIResponse>;
  analyzeGoal(goalTitle: string): Promise<GoalAnalysisAIResponse>;
  generateSchedule(tasks: Task[], availability: string): Promise<SchedulerAIResponse>;
  chat(message: string, context?: any): Promise<string>;
  research(topic: string): Promise<any>;
  cancel(): void;
  shutdown(): Promise<void>;
}
