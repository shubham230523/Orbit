import { Task, ScheduleBlock } from '@/types/domain';
import { addMinutes, isBefore, isAfter, differenceInMinutes, format } from 'date-fns';

export interface Availability {
  startTime: string; // "HH:mm:ss"
  endTime: string;
}

export class Scheduler {
  /**
   * Simple deterministic greedy scheduler.
   * Prioritizes by: 1. Priority (High > Medium > Low), 2. Due Date (Earliest first), 3. Duration (Shortest first)
   */
  static generateSchedule(
    tasks: Task[],
    availability: Availability,
    date: Date = new Date(),
    existingEvents: ScheduleBlock[] = [],
    startFromNow: boolean = false
  ): ScheduleBlock[] {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayStart = new Date(`${dateStr}T${availability.startTime}Z`);
    const dayEnd = new Date(`${dateStr}T${availability.endTime}Z`);

    const eligibleTasks = tasks.filter(t => t.status === 'todo' || t.status === 'in_progress');

    const sortedTasks = [...eligibleTasks].sort((a, b) => {
      const priorityMap = { high: 3, medium: 2, low: 1 };
      if (priorityMap[a.priority] !== priorityMap[b.priority]) {
        return priorityMap[b.priority] - priorityMap[a.priority];
      }

      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;

      return (a.estimatedDuration || 0) - (b.estimatedDuration || 0);
    });

    const schedule: ScheduleBlock[] = [];
    let currentTime = new Date(dayStart);
    if (startFromNow && isAfter(date, dayStart)) {
        currentTime = new Date(date);
    }

    for (const task of sortedTasks) {
      if (!isBefore(currentTime, dayEnd)) break;

      const duration = task.estimatedDuration || 30;
      let blockEndTime = addMinutes(currentTime, duration);

      let hasConflict = true;
      while (hasConflict) {
        if (isAfter(blockEndTime, dayEnd)) {
          hasConflict = false;
          continue;
        }

        const conflict = this.findConflict(currentTime, blockEndTime, existingEvents);
        if (conflict) {
          currentTime = new Date(conflict.endTime);
          blockEndTime = addMinutes(currentTime, duration);
        } else {
          hasConflict = false;
        }
      }

      if (isAfter(blockEndTime, dayEnd)) continue;

      schedule.push({
        id: Math.random().toString(36).substr(2, 9),
        userId: 'current-user',
        taskId: task.id,
        title: task.title,
        startTime: currentTime.toISOString(),
        endTime: blockEndTime.toISOString(),
        type: 'TASK'
      });

      currentTime = blockEndTime;
    }

    return schedule;
  }

  private static findConflict(start: Date, end: Date, events: ScheduleBlock[]): ScheduleBlock | undefined {
    return events.find(event => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);

      return (
        (isAfter(start, eventStart) && isBefore(start, eventEnd)) ||
        (isAfter(end, eventStart) && isBefore(end, eventEnd)) ||
        (isBefore(start, eventEnd) && isAfter(end, eventStart)) ||
        (start.getTime() === eventStart.getTime())
      );
    });
  }

  static calculateCapacity(availability: Availability): number {
    const dayStart = new Date('2024-01-01T' + availability.startTime + 'Z');
    const dayEnd = new Date('2024-01-01T' + availability.endTime + 'Z');
    return differenceInMinutes(dayEnd, dayStart);
  }
}
