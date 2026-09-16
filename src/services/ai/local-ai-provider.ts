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
import { RoadmapSchema, GoalAnalysisSchema, SchedulerSchema, wrapInJsonInstruction, PROMPT_SCHEMAS } from './prompts';
import { SYSTEM_RULES } from './system-rules';

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
    console.log('[LocalAIProvider] Initialization step: LOADING');
    try {
      if (!this.adapter.isAvailable()) {
        console.warn('[LocalAIProvider] Native LlamaModule not found in this build. Orbit will run in MOCK mode.');
        this.status = LocalModelStatus.LOADED; // Set to LOADED to allow mock inference
        return;
      }

      console.log('[LocalAIProvider] Loading model from path:', this.storage.getModelPath());
      await this.adapter.loadModel(this.storage.getModelPath());
      this.status = LocalModelStatus.LOADED;
      console.log('[LocalAIProvider] Initialization step: LOADED (Success)');
    } catch (e) {
      console.error('[LocalAIProvider] Initialization FAILED:', e);
      this.status = LocalModelStatus.FAILED;
      throw e;
    }
  }

  async generateRoadmap(goalTitle: string, goalDescription?: string): Promise<RoadmapAIResponse> {
    const rawPrompt = `Create a step-by-step roadmap for: "${goalTitle}". Description: "${goalDescription || ''}". Break it down into 3-7 milestones.`;
    const prompt = wrapInJsonInstruction(rawPrompt, PROMPT_SCHEMAS.ROADMAP);
    const result = await this.executeInference(prompt);
    return RoadmapSchema.parse(JSON.parse(this.cleanJsonResponse(result.text)));
  }

  async analyzeGoal(goalTitle: string, targetDate?: string): Promise<GoalAnalysisAIResponse> {
    const today = new Date().toISOString().split('T')[0];
    const dateContext = targetDate ? `The user wants to achieve this by ${targetDate}. Today is ${today}.` : `Today is ${today}.`;
    const rawPrompt = `Analyze the goal: "${goalTitle}". ${dateContext} Extract objective, constraints, measurable outcomes, and category.`;
    const prompt = wrapInJsonInstruction(rawPrompt, PROMPT_SCHEMAS.GOAL_ANALYSIS);
    const result = await this.executeInference(prompt);
    const cleaned = this.cleanJsonResponse(result.text);
    console.log('[LocalAIProvider] Cleaned Analysis Result:', cleaned);
    return GoalAnalysisSchema.parse(JSON.parse(cleaned));
  }

  async generateSchedule(tasks: any[], availability: string): Promise<SchedulerAIResponse> {
    console.log('[LocalAIProvider] generateSchedule called with', tasks.length, 'tasks');

    // Simplify task data to save tokens and improve reliability
    const simplifiedTasks = tasks.map(t => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      duration: t.estimatedDuration || 30
    }));

    const rawPrompt = `Generate a high-level daily schedule for these tasks: ${JSON.stringify(simplifiedTasks)}.

    STRICT CONSTRAINTS:
    - Schedule each unique task ID exactly ONCE. Do not repeat tasks.
    - Start with Sleep (e.g., 00:00 to 07:00).
    - Include exactly 3 meal blocks (Breakfast, Lunch, Dinner).
    - Use 24-hour format (HH:MM) and stay between 00:00 and 23:59.
    - My work availability is: "${availability}".
    - Total items in 'schedule' array MUST NOT exceed 12 items.
    - Current time: ${new Date().getHours()}:${new Date().getMinutes()}.`;

    const prompt = wrapInJsonInstruction(rawPrompt, PROMPT_SCHEMAS.SCHEDULER);
    console.log('[LocalAIProvider] Inference prompt sent');
    const result = await this.executeInference(prompt);
    console.log('[LocalAIProvider] Inference result raw text length:', result.text.length);
    const cleaned = this.cleanJsonResponse(result.text);
    console.log('[LocalAIProvider] Cleaned JSON:', cleaned);
    try {
      const parsed = SchedulerSchema.parse(JSON.parse(cleaned));
      console.log('[LocalAIProvider] Parsed schedule length:', parsed.schedule.length);
      return parsed;
    } catch (e) {
      console.error('[LocalAIProvider] Failed to parse AI response:', e);
      throw e;
    }
  }

  private cleanJsonResponse(text: string): string {
    // 1. Strip markdown code blocks
    let cleaned = text.replace(/```json\n?|```/g, '').trim();

    // 2. Find first '{' and last '}' to isolate the JSON object if model added chatter
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    } else if (firstBrace !== -1 && lastBrace === -1) {
      console.warn('[LocalAIProvider] JSON appears truncated, attempting recovery');
      // Very basic recovery: add missing closing brackets/braces
      cleaned = cleaned.trim();
      if (!cleaned.endsWith('}')) cleaned += '}]}';
      else if (!cleaned.endsWith(']')) cleaned += ']}';
    }

    return cleaned;
  }

  private async executeInference(prompt: string, systemPrompt: string = SYSTEM_RULES) {
    console.log('[LocalAIProvider] executeInference with status:', this.status);
    if (this.status !== LocalModelStatus.LOADED) {
      console.error('[LocalAIProvider] Model not loaded. Current status:', this.status);
      throw new Error('Local model not loaded.');
    }
    const result = await this.adapter.infer({
      prompt,
      systemPrompt,
      temperature: 0.3 // Slightly higher for better completion flow
    });
    console.log('[LocalAIProvider] Inference result received, length:', result.text.length);
    return result;
  }

  async chat(message: string, context?: any): Promise<string> {
    const result = await this.executeInference(message);
    return result.text;
  }

  async research(topic: string): Promise<any> {
    const prompt = `Research topic: ${topic}. Return JSON.`;
    const result = await this.executeInference(prompt);
    return JSON.parse(this.cleanJsonResponse(result.text));
  }

  cancel(): void {
    this.adapter.cancel();
  }

  async shutdown(): Promise<void> {
    await this.adapter.unloadModel();
    this.status = LocalModelStatus.INSTALLED;
  }
}
