import { v4 as uuidv4 } from 'uuid';
import { runQuery, runExecute } from '@/db/client';
import { ScheduleBlock } from '@/types/domain';
import { AIProviderFactory } from './ai/ai-provider-factory';
import { RoutineTimes } from './ai/types';
import { taskService } from './task-service';
import { habitService } from './habit-service';
import { useAuthStore } from '@/store/use-auth-store';
import { format } from 'date-fns';

export const scheduleService = {
  async getSchedule(): Promise<ScheduleBlock[]> {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return [];

    return await runQuery<ScheduleBlock>(
      'SELECT * FROM schedule_blocks WHERE userId = ? ORDER BY startTime ASC',
      [userId]
    );
  },

  async generateSchedule(params?: {
    taskIds?: string[];
    habitIds?: string[];
    routines?: RoutineTimes
  }): Promise<ScheduleBlock[]> {
    const { taskIds, habitIds, routines } = params || {};
    console.log('[ScheduleService] generateSchedule started');
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Not authenticated');

    const provider = AIProviderFactory.getProvider();
    console.log('[ScheduleService] Using AI provider:', provider.getType());

    let tasks = await taskService.getTasks();
    if (taskIds && taskIds.length > 0) {
      tasks = tasks.filter(t => taskIds.includes(t.id));
    }
    console.log('[ScheduleService] Found', tasks.length, 'tasks to schedule');

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    let habits = await habitService.getHabitsWithStatus(todayStr);
    let pendingHabits = habits.filter(h => !h.completed);

    if (habitIds && habitIds.length > 0) {
      pendingHabits = pendingHabits.filter(h => habitIds.includes(h.id));
    }

    console.log('[ScheduleService] Found', pendingHabits.length, 'pending habits to schedule');

    // Clear existing schedule for today immediately to ensure a fresh start
    console.log('[ScheduleService] Clearing existing schedule for user:', userId);
    await runExecute('DELETE FROM schedule_blocks WHERE userId = ?', [userId]);

    // In local-first, we use the local provider's generation logic
    const aiResponse = await provider.generateSchedule(tasks, 'Dynamic', pendingHabits, routines);
    console.log('[ScheduleService] AI response received. Schedule items:', aiResponse.schedule.length);

    const blocks: ScheduleBlock[] = [];
    for (const item of aiResponse.schedule) {
      const isTask = item.taskId && tasks.some(t => t.id === item.taskId);
      const isHabit = item.taskId && pendingHabits.some(h => h.id === item.taskId);

      const taskTitle = item.taskId ? (tasks.find(t => t.id === item.taskId)?.title || pendingHabits.find(h => h.id === item.taskId)?.title) : undefined;


      const block: ScheduleBlock = {
        id: uuidv4(),
        userId,
        taskId: isTask ? item.taskId : undefined,
        habitId: isHabit ? item.taskId : undefined,
        title: taskTitle || item.title || 'Scheduled Item',
        startTime: item.startTime,
        endTime: item.endTime,
        type: (item.type as any) || (isHabit ? 'HABIT' : (isTask ? 'TASK' : 'EVENT')),
      };

      await runExecute(
        `INSERT INTO schedule_blocks (id, userId, taskId, habitId, title, startTime, endTime, type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [block.id, block.userId, block.taskId || null, block.habitId || null, block.title, block.startTime, block.endTime, block.type]
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

  async updateReminder(blockId: string, reminderId: string | null, enabled: boolean): Promise<void> {
    await runExecute(
      'UPDATE schedule_blocks SET reminderId = ?, reminderEnabled = ? WHERE id = ?',
      [reminderId, enabled ? 1 : 0, blockId]
    );
  },
};
