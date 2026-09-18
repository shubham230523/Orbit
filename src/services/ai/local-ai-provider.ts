import {
  AIProvider,
  AIProviderType,
  GoalAnalysisAIResponse,
  LocalModelStatus,
  RoadmapAIResponse,
  SchedulerAIResponse,
  RoutineTimes,
} from './types';
import { PlatformAIAdapter } from './platform-ai-adapter';
import { ModelStorage } from './model-storage';
import { RoadmapSchema, GoalAnalysisSchema, SchedulerSchema, wrapInJsonInstruction, PROMPT_SCHEMAS } from './prompts';
import { SYSTEM_RULES } from './system-rules';

export class LocalAIProvider implements AIProvider {
  private status: LocalModelStatus = LocalModelStatus.NOT_INSTALLED;
  private isCancelled = false;

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

  async generateSchedule(
    tasks: any[],
    availability: string,
    habits?: any[],
    routines?: RoutineTimes
  ): Promise<SchedulerAIResponse> {
    console.log('[LocalAIProvider] generateSchedule called with', tasks.length, 'tasks and', habits?.length || 0, 'habits');

    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    const parseTime = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const toHHMM = (mins: number) => {
      const h = Math.floor(mins / 60) % 24;
      const m = mins % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const sleepMins = routines?.sleepStart ? parseTime(routines.sleepStart) : 21 * 60;
    const breakfastMins = routines?.breakfastStart ? parseTime(routines.breakfastStart) : 7 * 60;
    const lunchMins = routines?.lunchStart ? parseTime(routines.lunchStart) : 12.5 * 60;
    const dinnerMins = routines?.dinnerStart ? parseTime(routines.dinnerStart) : 18.5 * 60;

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
    The active window starts at ${toHHMM(currentMins)} and ends at ${toHHMM(sleepMins)}.

    TASKS TO ORDER/SCHEDULE: ${JSON.stringify(simplifiedTasks)}
    HABITS TO INCLUDE: ${JSON.stringify(simplifiedHabits)}

    STRICT CONSTRAINTS:
    - Order tasks and habits logically through the day starting from ${toHHMM(currentMins)}.
    - Each Task and Habit MUST appear exactly once if it fits in the remaining time.
    - Do NOT assign the same startTime and endTime to items. Time must advance chronologically.
    - Include Breakfast, Lunch, and Dinner at appropriate times if they haven't passed yet.
    - Include 10-minute breaks after tasks.

    JSON FORMAT: Output ONLY the JSON array inside {"schedule": [...]}. No text.`;

    const prompt = wrapInJsonInstruction(rawPrompt, PROMPT_SCHEMAS.SCHEDULER);
    console.log('[LocalAIProvider] Inference prompt sent');

    this.isCancelled = false;
    let parsed: any = null;
    try {
      const result = await this.executeInference(prompt);
      if (this.isCancelled) throw new Error('Generation cancelled');

      const cleaned = this.cleanJsonResponse(result.text);
      let rawJson = JSON.parse(cleaned);

      if (Array.isArray(rawJson)) {
        rawJson = { schedule: rawJson };
      } else if (rawJson && typeof rawJson === 'object' && !rawJson.schedule) {
        rawJson = { schedule: [rawJson] };
      }

      if (rawJson.schedule && Array.isArray(rawJson.schedule)) {
        rawJson.schedule = rawJson.schedule.map((item: any) => ({
          ...item,
          type: typeof item.type === 'string' ? item.type.toUpperCase() : item.type
        }));
      }

      parsed = SchedulerSchema.parse(rawJson);
    } catch (e: any) {
      if (this.isCancelled || e?.message?.includes('cancel')) {
        console.log('[LocalAIProvider] Generation cancelled by user');
        throw new Error('USER_CANCELLED');
      }
      console.error('[LocalAIProvider] Failed to get or parse AI response, using fallback layout:', e);
    }

    const finalSchedule: any[] = [];
    let walkingMins = currentMins;
    let breakfastScheduled = breakfastMins <= currentMins;
    let lunchScheduled = lunchMins <= currentMins;
    let dinnerScheduled = dinnerMins <= currentMins;

    // Gather unique tasks and habits
    let orderedItems: any[] = [];
    if (parsed && parsed.schedule && Array.isArray(parsed.schedule)) {
      const seenIds = new Set<string>();
      for (const item of parsed.schedule) {
        if (item.taskId) {
          if (!seenIds.has(item.taskId)) {
            seenIds.add(item.taskId);
            const origTask = tasks.find(t => t.id === item.taskId);
            const origHabit = habits?.find(h => h.id === item.taskId);

            if (origTask) {
              orderedItems.push({ id: item.taskId, title: origTask.title, duration: origTask.estimatedDuration || 60, type: 'TASK', reason: item.reason });
            } else if (origHabit) {
              orderedItems.push({ id: item.taskId, title: origHabit.title, duration: 15, type: 'EVENT', reason: item.reason });
            }
          }
        } else if (item.title && (item.type === 'TASK' || !item.type)) {
          orderedItems.push({ title: item.title, duration: 60, type: 'TASK', reason: item.reason });
        }
      }
    }

    if (orderedItems.length === 0) {
      orderedItems = [
        ...tasks.map(t => ({ id: t.id, title: t.title, duration: t.estimatedDuration || 60, type: 'TASK' })),
        ...(habits?.map(h => ({ id: h.id, title: h.title, duration: 15, type: 'EVENT' })) || [])
      ];
    }

    for (const item of orderedItems) {
      // Check for meals
      if (!breakfastScheduled && walkingMins >= breakfastMins) {
        if (walkingMins + 30 <= sleepMins) {
          finalSchedule.push({ title: 'Breakfast', startTime: toHHMM(walkingMins), endTime: toHHMM(walkingMins + 30), type: 'BREAK', reason: 'Morning Meal' });
          walkingMins += 30;
          breakfastScheduled = true;
        }
      }
      if (!lunchScheduled && walkingMins >= lunchMins) {
        if (walkingMins + 45 <= sleepMins) {
          finalSchedule.push({ title: 'Lunch', startTime: toHHMM(walkingMins), endTime: toHHMM(walkingMins + 45), type: 'BREAK', reason: 'Midday Meal' });
          walkingMins += 45;
          lunchScheduled = true;
        }
      }
      if (!dinnerScheduled && walkingMins >= dinnerMins) {
        if (walkingMins + 45 <= sleepMins) {
          finalSchedule.push({ title: 'Dinner', startTime: toHHMM(walkingMins), endTime: toHHMM(walkingMins + 45), type: 'BREAK', reason: 'Evening Meal' });
          walkingMins += 45;
          dinnerScheduled = true;
        }
      }

      const duration = item.duration || 60;
      if (walkingMins + duration <= sleepMins) {
        finalSchedule.push({
          taskId: item.id,
          title: item.title,
          startTime: toHHMM(walkingMins),
          endTime: toHHMM(walkingMins + duration),
          type: item.type || 'TASK',
          reason: item.reason
        });
        walkingMins += duration;

        if (walkingMins + 10 <= sleepMins) {
          finalSchedule.push({ title: 'Break', startTime: toHHMM(walkingMins), endTime: toHHMM(walkingMins + 10), type: 'BREAK', reason: 'Short rest' });
          walkingMins += 10;
        }
      } else {
        break;
      }
    }

    // Include missed meals if they fit
    if (!breakfastScheduled && breakfastMins > currentMins && walkingMins + 30 <= sleepMins) {
      finalSchedule.push({ title: 'Breakfast', startTime: toHHMM(walkingMins), endTime: toHHMM(walkingMins + 30), type: 'BREAK' });
      walkingMins += 30;
    }
    if (!lunchScheduled && lunchMins > currentMins && walkingMins + 45 <= sleepMins) {
      finalSchedule.push({ title: 'Lunch', startTime: toHHMM(walkingMins), endTime: toHHMM(walkingMins + 45), type: 'BREAK' });
      walkingMins += 45;
    }
    if (!dinnerScheduled && dinnerMins > currentMins && walkingMins + 45 <= sleepMins) {
      finalSchedule.push({ title: 'Dinner', startTime: toHHMM(walkingMins), endTime: toHHMM(walkingMins + 45), type: 'BREAK' });
      walkingMins += 45;
    }

    if (walkingMins < sleepMins) {
      finalSchedule.push({ title: 'Miscellaneous & Leisure', startTime: toHHMM(walkingMins), endTime: toHHMM(sleepMins), type: 'EVENT', reason: 'Free time / Buffer' });
    }

    finalSchedule.push({ title: 'Sleep', startTime: toHHMM(sleepMins), endTime: '05:00', type: 'BREAK', reason: 'Rest' });

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
    this.isCancelled = true;
    this.adapter.cancel();
  }

  async shutdown(): Promise<void> {
    await this.adapter.unloadModel();
    this.status = LocalModelStatus.INSTALLED;
  }
}
