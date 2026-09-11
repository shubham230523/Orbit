import { Task, ScheduleBlock } from '@/types/domain';
import { isBefore } from 'date-fns';
import { Scheduler, Availability } from './scheduler';

export interface ReplanResult {
  missedTasks: Task[];
  affectedTasks: Task[];
  newSchedule: ScheduleBlock[];
}

export class Replanner {
  /**
   * Detects missed tasks and suggests a new schedule for remaining tasks.
   */
  static replan(
    tasks: Task[],
    currentSchedule: ScheduleBlock[],
    availability: Availability,
    now: Date = new Date()
  ): ReplanResult {
    const missedTasks = tasks.filter(task => {
      const scheduledBlock = currentSchedule.find(b => b.taskId === task.id);
      if (!scheduledBlock) return false;

      const endTime = new Date(scheduledBlock.endTime);
      return (task.status === 'todo' || task.status === 'in_progress') && isBefore(endTime, now);
    });

    const remainingTasks = tasks.filter(task => {
        const scheduledBlock = currentSchedule.find(b => b.taskId === task.id);
        if (!scheduledBlock) return task.status === 'todo' || task.status === 'in_progress';

        const startTime = new Date(scheduledBlock.startTime);
        return (task.status === 'todo' || task.status === 'in_progress') && !isBefore(startTime, now);
      });

    const tasksToSchedule = [...new Set([...missedTasks, ...remainingTasks])];

    const newSchedule = Scheduler.generateSchedule(tasksToSchedule, availability, now, [], true);

    return {
      missedTasks,
      affectedTasks: remainingTasks,
      newSchedule
    };
  }
}
