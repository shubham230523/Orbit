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
    const rawPrompt = `Create a step-by-step roadmap for: "${goalTitle}". Description: "${goalDescription || ''}".
    Break it down into 3-7 milestones.
    IMPORTANT: Every milestone title MUST be unique and descriptive.`;
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

  async generateSchedule(tasks: any[], availability: string, habits?: any[]): Promise<SchedulerAIResponse> {
    console.log('[LocalAIProvider] generateSchedule called with', tasks.length, 'tasks and', habits?.length || 0, 'habits');

    // Simplify task data to save tokens and improve reliability
    const simplifiedTasks = tasks.map(t => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      duration: t.estimatedDuration || 60
    }));

    const simplifiedHabits = habits?.map(h => ({
      id: h.id,
      title: h.title,
      duration: 15 // Default 15 mins for habits
    })) || [];

    const rawPrompt = `Generate a realistic daily schedule for today.
    The active day MUST start at 05:00 AM.

    TASKS TO ORDER/SCHEDULE: ${JSON.stringify(simplifiedTasks)}
    HABITS TO INCLUDE: ${JSON.stringify(simplifiedHabits)}

    STRICT CONSTRAINTS:
    - Order tasks and habits logically through the day starting from 05:00 AM.
    - Each Task and Habit MUST appear exactly once if it fits.
    - Do NOT assign the same startTime and endTime to items. Time must advance chronologically.
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

      let rawJson = JSON.parse(cleaned);

      // Auto-wrap if AI returns array or single object directly instead of {schedule: []}
      if (Array.isArray(rawJson)) {
        rawJson = { schedule: rawJson };
      } else if (rawJson && typeof rawJson === 'object' && !rawJson.schedule) {
        rawJson = { schedule: [rawJson] };
      }

      // Normalize types to uppercase to avoid Zod enum mismatches (e.g. 'Habit' -> 'HABIT')
      if (rawJson.schedule && Array.isArray(rawJson.schedule)) {
        rawJson.schedule = rawJson.schedule.map((item: any) => ({
          ...item,
          type: typeof item.type === 'string' ? item.type.toUpperCase() : item.type
        }));
      }

      parsed = SchedulerSchema.parse(rawJson);
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

    let currentMins = 5 * 60; // 05:00 AM
    let breakfastScheduled = false;
    let lunchScheduled = false;
    let dinnerScheduled = false;

    // Gather unique tasks and habits in the order proposed by the AI, or original order if AI failed
    let orderedItems: any[] = [];
    if (parsed && parsed.schedule && Array.isArray(parsed.schedule)) {
      const seenIds = new Set<string>();
      for (const item of parsed.schedule) {
        if (item.taskId) {
          if (!seenIds.has(item.taskId)) {
            seenIds.add(item.taskId);
            // Check if it's a task or a habit
            const origTask = tasks.find(t => t.id === item.taskId);
            const origHabit = habits?.find(h => h.id === item.taskId);

            if (origTask) {
              orderedItems.push({
                id: item.taskId,
                title: origTask.title,
                duration: origTask.estimatedDuration || 60,
                type: 'TASK',
                reason: item.reason
              });
            } else if (origHabit) {
              orderedItems.push({
                id: item.taskId,
                title: origHabit.title,
                duration: 15,
                type: 'EVENT',
                reason: item.reason
              });
            }
          }
        } else if (item.title && (item.type === 'TASK' || !item.type)) {
          orderedItems.push({
            title: item.title,
            duration: 60,
            type: 'TASK',
            reason: item.reason
          });
        }
      }
    }

    // Fallback/Union with any tasks that weren't included
    if (orderedItems.length === 0) {
      orderedItems = [
        ...tasks.map(t => ({
          id: t.id,
          title: t.title,
          duration: t.estimatedDuration || 60,
          type: 'TASK'
        })),
        ...(habits?.map(h => ({
          id: h.id,
          title: h.title,
          duration: 15,
          type: 'EVENT'
        })) || [])
      ];
    }

    // Allocate tasks and events into the waking hours window (05:00 to 21:00)
    for (const item of orderedItems) {
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

      const duration = item.duration || 60;
      if (currentMins + duration <= 21 * 60) {
        finalSchedule.push({
          taskId: item.id,
          title: item.title,
          startTime: toHHMM(currentMins),
          endTime: toHHMM(currentMins + duration),
          type: item.type || 'TASK',
          reason: item.reason
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

    // 2. Final Sleep: 21:00 to 05:00 (8 hours total)
    finalSchedule.push({
      title: 'Sleep',
      startTime: '21:00',
      endTime: '05:00',
      type: 'BREAK',
      reason: 'Rest'
    });

    return { schedule: finalSchedule };
  }

  private cleanJsonResponse(text: string): string {
    // 1. Strip markdown code blocks
    let cleaned = text.replace(/```json\n?|```/g, '').trim();

    const firstBrace = cleaned.indexOf('{');
    if (firstBrace === -1) return cleaned;

    // First try standard parsing of the text within first and last braces
    const lastBrace = cleaned.lastIndexOf('}');
    if (lastBrace !== -1) {
      const candidate = cleaned.substring(firstBrace, lastBrace + 1);
      try {
        JSON.parse(candidate);
        return candidate;
      } catch (e) {}
    }

    // Comprehensive truncation recovery for array of objects inside JSON
    let candidate = cleaned.substring(firstBrace);
    let lastBraceIdx = candidate.lastIndexOf('}');
    while (lastBraceIdx !== -1) {
      const sub = candidate.substring(0, lastBraceIdx + 1);
      for (const closure of ['', ']}', '}', ']', ']]}', '}]\}']) {
        try {
          const testStr = sub + closure;
          JSON.parse(testStr);
          return testStr;
        } catch (err) {}
      }
      candidate = candidate.substring(0, lastBraceIdx);
      lastBraceIdx = candidate.lastIndexOf('}');
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
