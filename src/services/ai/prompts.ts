import { z } from 'zod';

export const RoadmapSchema = z.object({
  milestones: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      estimatedWeeks: z.number(),
    }),
  ),
});

export const GoalAnalysisSchema = z.object({
  objective: z.string(),
  constraints: z.preprocess((val) => (typeof val === 'string' ? [val] : val), z.array(z.string())),
  measurableOutcomes: z.preprocess((val) => (typeof val === 'string' ? [val] : val), z.array(z.string())),
  estimatedDurationWeeks: z.preprocess((val) => {
    if (typeof val === 'string') return parseInt(val, 10);
    if (typeof val === 'object' && val !== null && 'value' in val) return (val as any).value;
    return val;
  }, z.number()),
  category: z.string(),
});

export const SchedulerSchema = z.object({
  schedule: z.array(
    z.object({
      taskId: z.string(),
      startTime: z.string(),
      endTime: z.string(),
      reason: z.string(),
    }),
  ),
});

export const PROMPT_SCHEMAS = {
  ROADMAP: '{"milestones": [{"title": "Milestone Title", "description": "Short description", "estimatedWeeks": 1}]}',
  GOAL_ANALYSIS: '{"objective": "Specific goal objective", "constraints": ["Constraint 1"], "measurableOutcomes": ["Outcome 1"], "estimatedDurationWeeks": 4, "category": "Category Name"}',
  SCHEDULER: '{"schedule": [{"taskId": "id", "startTime": "HH:MM", "endTime": "HH:MM", "reason": "Why this time"}]}',
};

export function wrapInJsonInstruction(prompt: string, schema: string): string {
  return `${prompt}\n\nIMPORTANT: You must output ONLY a valid JSON object. Do not include any conversation, markdown code blocks, or extra characters. Ensure all array fields are actual JSON arrays.\n\nRequired JSON Structure:\n${schema}`;
}
