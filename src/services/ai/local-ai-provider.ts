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
      duration: t.estimatedDuration || 60
    }));

    const rawPrompt = `Generate a realistic daily schedule for today.
    The active day MUST start at 05:00 AM.

    TASKS TO ORDER/SCHEDULE (Schedule each exactly once): ${JSON.stringify(simplifiedTasks)}

    STRICT CONSTRAINTS:
    - Order these tasks logically through the day starting from 05:00 AM.
    - Do NOT assign the same startTime and endTime to every task. Time must advance chronologically for each item.
    - Sleep must total 8 hours.
    - Include Breakfast, Lunch, and Dinner at appropriate times.
    - Include 10-minute breaks after tasks.

    JSON FORMAT: Output ONLY the JSON array inside {"schedule": [...]}. No text.`;

    const prompt = wrapInJsonInstruction(rawPrompt, PROMPT_SCHEMAS.SCHEDULER);
    console.log('[LocalAIProvider] Inference prompt sent');

    let parsed: any = null;
    try {
      const result = await this.executeInference(prompt);
      console.log('[LocalAIProvider] Inference result raw text length:', result.text.length);
      const cleaned = this.cleanJsonResponse(result.text);
      console.log('[LocalAIProvider] Cleaned JSON:', cleaned);
      parsed = SchedulerSchema.parse(JSON.parse(cleaned));
      console.log('[LocalAIProvider] Parsed schedule length:', parsed.schedule.length);
    } catch (e) {
      console.error('[LocalAIProvider] Failed to get or parse AI response, using fallback layout:', e);
    }

    // Process and guarantee a robust chronological schedule starting at 05:00 AM with sleep, meals, and breaks
    const finalSchedule: any[] = [];

    const toHHMM = (mins: number) => {
      const h = Math.floor(mins / 60) % 24;
      const m = mins % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    // 1. Initial Sleep: 00:00 to 05:00 (5 hours)
    finalSchedule.push({
      title: 'Sleep',
      startTime: '00:00',
      endTime: '05:00',
      type: 'BREAK',
      reason: 'Rest'
    });

    let currentMins = 5 * 60; // 05:00 AM
    let breakfastScheduled = false;
    let lunchScheduled = false;
    let dinnerScheduled = false;

    // Gather unique tasks in the order proposed by the AI, or original order if AI failed
    let orderedTasks: any[] = [];
    if (parsed && parsed.schedule && Array.isArray(parsed.schedule)) {
      const seenTaskIds = new Set<string>();
      for (const item of parsed.schedule) {
        if (item.taskId) {
          if (!seenTaskIds.has(item.taskId)) {
            seenTaskIds.add(item.taskId);
            const orig = tasks.find(t => t.id === item.taskId);
            orderedTasks.push({
              id: item.taskId,
              title: orig?.title || item.title || 'Task',
              duration: orig?.estimatedDuration || 60,
              reason: item.reason
            });
          }
        } else if (item.title && (item.type === 'TASK' || !item.type)) {
          orderedTasks.push({
            title: item.title,
            duration: 60,
            reason: item.reason
          });
        }
      }
    }

    // Fallback/Union with any tasks that weren't included
    if (orderedTasks.length === 0) {
      orderedTasks = tasks.map(t => ({
        id: t.id,
        title: t.title,
        duration: t.estimatedDuration || 60
      }));
    }

    // Allocate tasks and events into the waking hours window (05:00 to 21:00)
    for (const task of orderedTasks) {
      // Breakfast around 07:00 AM onwards
      if (!breakfastScheduled && currentMins >= 7 * 60) {
        if (currentMins + 30 <= 21 * 60) {
          finalSchedule.push({
            title: 'Breakfast',
            startTime: toHHMM(currentMins),
            endTime: toHHMM(currentMins + 30),
            type: 'BREAK',
            reason: 'Morning Meal'
          });
          currentMins += 30;
          breakfastScheduled = true;
        }
      }

      // Lunch around 12:30 PM onwards
      if (!lunchScheduled && currentMins >= 12.5 * 60) {
        if (currentMins + 45 <= 21 * 60) {
          finalSchedule.push({
            title: 'Lunch',
            startTime: toHHMM(currentMins),
            endTime: toHHMM(currentMins + 45),
            type: 'BREAK',
            reason: 'Midday Meal'
          });
          currentMins += 45;
          lunchScheduled = true;
        }
      }

      // Dinner around 18:30 PM onwards
      if (!dinnerScheduled && currentMins >= 18.5 * 60) {
        if (currentMins + 45 <= 21 * 60) {
          finalSchedule.push({
            title: 'Dinner',
            startTime: toHHMM(currentMins),
            endTime: toHHMM(currentMins + 45),
            type: 'BREAK',
            reason: 'Evening Meal'
          });
          currentMins += 45;
          dinnerScheduled = true;
        }
      }

      const duration = task.duration || 60;
      if (currentMins + duration <= 21 * 60) {
        finalSchedule.push({
          taskId: task.id,
          title: task.title,
          startTime: toHHMM(currentMins),
          endTime: toHHMM(currentMins + duration),
          type: 'TASK',
          reason: task.reason
        });
        currentMins += duration;

        // Add 10-minute break after 1 hour of work or per task
        if (currentMins + 10 <= 21 * 60) {
          finalSchedule.push({
            title: 'Break',
            startTime: toHHMM(currentMins),
            endTime: toHHMM(currentMins + 10),
            type: 'BREAK',
            reason: 'Short rest'
          });
          currentMins += 10;
        }
      } else {
        break; // Day is full
      }
    }

    // Ensure missing meals are included if few tasks
    if (!breakfastScheduled && currentMins + 30 <= 21 * 60) {
      finalSchedule.push({ title: 'Breakfast', startTime: toHHMM(currentMins), endTime: toHHMM(currentMins + 30), type: 'BREAK' });
      currentMins += 30;
    }
    if (!lunchScheduled && currentMins + 45 <= 21 * 60) {
      finalSchedule.push({ title: 'Lunch', startTime: toHHMM(currentMins), endTime: toHHMM(currentMins + 45), type: 'BREAK' });
      currentMins += 45;
    }
    if (!dinnerScheduled && currentMins + 45 <= 21 * 60) {
      finalSchedule.push({ title: 'Dinner', startTime: toHHMM(currentMins), endTime: toHHMM(currentMins + 45), type: 'BREAK' });
      currentMins += 45;
    }

    // Fill remaining time with Miscellaneous & Buffer
    if (currentMins < 21 * 60) {
      finalSchedule.push({
        title: 'Miscellaneous & Leisure',
        startTime: toHHMM(currentMins),
        endTime: '21:00',
        type: 'EVENT',
        reason: 'Free time / Buffer'
      });
    }

    // 2. Final Sleep: 21:00 to 23:59 (3 hours) -> Total 8 hours of sleep
    finalSchedule.push({
      title: 'Sleep',
      startTime: '21:00',
      endTime: '23:59',
      type: 'BREAK',
      reason: 'Rest'
    });

    return { schedule: finalSchedule };
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
      if (!cleaned.endsWith('}')) {
        // If it looks like it was in the middle of a schedule item
        if (cleaned.includes('{') && !cleaned.endsWith('}')) {
          cleaned += '}]}';
        } else {
          cleaned += ']}';
        }
      }
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
      temperature: 0.0 // Minimum temperature for maximum logic/stability
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
