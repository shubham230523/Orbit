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
  constraints: z.array(z.string()),
  measurableOutcomes: z.array(z.string()),
  estimatedDurationWeeks: z.number(),
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

export function wrapInJsonInstruction(prompt: string, schema: string): string {
  return `${prompt}\n\nReturn ONLY a valid JSON object matching this schema:\n${schema}\n\nDo not include any other text or explanation.`;
}
