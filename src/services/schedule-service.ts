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
    console.log('[ScheduleService] generateSchedule started');
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Not authenticated');

    const provider = AIProviderFactory.getProvider();
    console.log('[ScheduleService] Using AI provider:', provider.getType());

    const tasks = await taskService.getTasks();
    console.log('[ScheduleService] Found', tasks.length, 'tasks to schedule');

    // Clear existing schedule for today immediately to ensure a fresh start
    console.log('[ScheduleService] Clearing existing schedule for user:', userId);
    await runExecute('DELETE FROM schedule_blocks WHERE userId = ?', [userId]);

    // In local-first, we use the local provider's generation logic
    const aiResponse = await provider.generateSchedule(tasks, '9 AM to 5 PM');
    console.log('[ScheduleService] AI response received. Schedule items:', aiResponse.schedule.length);

    const blocks: ScheduleBlock[] = [];
    for (const item of aiResponse.schedule) {
      const taskTitle = item.taskId ? tasks.find(t => t.id === item.taskId)?.title : undefined;

      const block: ScheduleBlock = {
        id: uuidv4(),
        userId,
        taskId: item.taskId,
        title: taskTitle || item.title || 'Scheduled Item',
        startTime: item.startTime,
        endTime: item.endTime,
        type: item.type || (item.taskId ? 'TASK' : 'EVENT'),
      };

      await runExecute(
        `INSERT INTO schedule_blocks (id, userId, taskId, title, startTime, endTime, type)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [block.id, block.userId, block.taskId || null, block.title, block.startTime, block.endTime, block.type]
      );
      blocks.push(block);
    }
    console.log('[ScheduleService] Saved', blocks.length, 'new schedule blocks');

    return blocks;
  },

  async clearSchedule(): Promise<void> {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;
    await runExecute('DELETE FROM schedule_blocks WHERE userId = ?', [userId]);
  },
};
