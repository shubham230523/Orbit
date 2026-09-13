import { v4 as uuidv4 } from 'uuid';
import { runQuery, runExecute } from '@/db/client';
import { ScheduleBlock } from '@/types/domain';
import { AIProviderFactory } from './ai/ai-provider-factory';
import { taskService } from './task-service';
import { useAuthStore } from '@/store/use-auth-store';

export const scheduleService = {
  async getSchedule(): Promise<ScheduleBlock[]> {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return [];

    return await runQuery<ScheduleBlock>(
      'SELECT * FROM schedule_blocks WHERE userId = ? ORDER BY startTime ASC',
      [userId]
    );
  },

  async generateSchedule(): Promise<ScheduleBlock[]> {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Not authenticated');

    const provider = AIProviderFactory.getProvider();
    const tasks = await taskService.getTasks();

    // In local-first, we use the local provider's generation logic
    const aiResponse = await provider.generateSchedule(tasks, '9 AM to 5 PM');

    // Clear existing schedule for today (simplified for this spike)
    await runExecute('DELETE FROM schedule_blocks WHERE userId = ?', [userId]);

    const blocks: ScheduleBlock[] = [];
    for (const item of aiResponse.schedule) {
      const block: ScheduleBlock = {
        id: uuidv4(),
        userId,
        taskId: item.taskId,
        title: tasks.find(t => t.id === item.taskId)?.title || 'Scheduled Task',
        startTime: item.startTime,
        endTime: item.endTime,
        type: 'TASK',
      };

      await runExecute(
        `INSERT INTO schedule_blocks (id, userId, taskId, title, startTime, endTime, type)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [block.id, block.userId, block.taskId || null, block.title, block.startTime, block.endTime, block.type]
      );
      blocks.push(block);
    }

    return blocks;
  },
};
