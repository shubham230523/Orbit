import {
  AIProvider,
  AIProviderType,
  GoalAnalysisAIResponse,
  LocalModelStatus,
  RoadmapAIResponse,
  SchedulerAIResponse,
} from './types';
import { PlatformAIAdapter } from './platform-ai-adapter';
import { ModelStorage } from './model-storage';
import { RoadmapSchema, GoalAnalysisSchema, SchedulerSchema, wrapInJsonInstruction } from './prompts';

export class LocalAIProvider implements AIProvider {
  private status: LocalModelStatus = LocalModelStatus.NOT_INSTALLED;

  constructor(
    private adapter: PlatformAIAdapter,
    private storage: ModelStorage,
  ) {
    this.checkInitialStatus();
  }

  getType(): AIProviderType {
    return AIProviderType.LOCAL;
  }

  getStatus(): LocalModelStatus {
    return this.status;
  }

  private async checkInitialStatus() {
    if (await this.storage.exists()) {
      this.status = LocalModelStatus.INSTALLED;
    }
  }

  async initialize(): Promise<void> {
    if (!(await this.storage.exists())) {
      throw new Error('Model not downloaded.');
    }
    this.status = LocalModelStatus.LOADING;
    try {
      await this.adapter.loadModel(this.storage.getModelPath());
      this.status = LocalModelStatus.LOADED;
    } catch (e) {
      this.status = LocalModelStatus.FAILED;
      throw e;
    }
  }

  async generateRoadmap(goalTitle: string, goalDescription?: string): Promise<RoadmapAIResponse> {
    const rawPrompt = `Create a step-by-step roadmap for: "${goalTitle}". Description: "${goalDescription || ''}". Break it down into 3-7 milestones.`;
    const prompt = wrapInJsonInstruction(rawPrompt, JSON.stringify(RoadmapSchema.shape));
    const result = await this.executeInference(prompt);
    return RoadmapSchema.parse(JSON.parse(result.text));
  }

  async analyzeGoal(goalTitle: string): Promise<GoalAnalysisAIResponse> {
    const rawPrompt = `Analyze the goal: "${goalTitle}". Extract objective, constraints, measurable outcomes, and category.`;
    const prompt = wrapInJsonInstruction(rawPrompt, JSON.stringify(GoalAnalysisSchema.shape));
    const result = await this.executeInference(prompt);
    return GoalAnalysisSchema.parse(JSON.parse(result.text));
  }

  async generateSchedule(tasks: any[], availability: string): Promise<SchedulerAIResponse> {
    const rawPrompt = `Generate an optimal schedule for these tasks: ${JSON.stringify(tasks)}. My availability: "${availability}".`;
    const prompt = wrapInJsonInstruction(rawPrompt, JSON.stringify(SchedulerSchema.shape));
    const result = await this.executeInference(prompt);
    return SchedulerSchema.parse(JSON.parse(result.text));
  }

  private async executeInference(prompt: string) {
    if (this.status !== LocalModelStatus.LOADED) {
      throw new Error('Local model not loaded.');
    }
    return this.adapter.infer(prompt);
  }

  async chat(message: string, context?: any): Promise<string> {
    const result = await this.executeInference(message);
    return result.text;
  }

  async research(topic: string): Promise<any> {
    const prompt = `Research topic: ${topic}. Return JSON.`;
    const result = await this.executeInference(prompt);
    return JSON.parse(result.text);
  }

  cancel(): void {
    this.adapter.cancel();
  }

  async shutdown(): Promise<void> {
    await this.adapter.unloadModel();
    this.status = LocalModelStatus.INSTALLED;
  }
}
