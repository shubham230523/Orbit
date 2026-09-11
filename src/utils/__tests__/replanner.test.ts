import { Replanner } from '../replanner';
import { Task, ScheduleBlock } from '@/types/domain';
import { Availability } from '../scheduler';
import { isAfter } from 'date-fns';

describe('Replanner', () => {
  const availability: Availability = {
    startTime: '09:00:00',
    endTime: '17:00:00',
  };

  const tasks: Task[] = [
    {
      id: 't1',
      title: 'Task 1',
      status: 'todo',
      priority: 'high',
      estimatedDuration: 60,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 't2',
      title: 'Task 2',
      status: 'todo',
      priority: 'medium',
      estimatedDuration: 60,
      createdAt: '',
      updatedAt: '',
    },
  ];

  const currentSchedule: ScheduleBlock[] = [
    {
      id: 's1',
      userId: 'u1',
      taskId: 't1',
      title: 'Task 1',
      startTime: '2024-01-01T09:00:00.000Z',
      endTime: '2024-01-01T10:00:00.000Z',
      type: 'TASK',
    },
    {
      id: 's2',
      userId: 'u1',
      taskId: 't2',
      title: 'Task 2',
      startTime: '2024-01-01T10:00:00.000Z',
      endTime: '2024-01-01T11:00:00.000Z',
      type: 'TASK',
    },
  ];

  it('detects missed tasks correctly', () => {
    const now = new Date('2024-01-01T10:30:00Z');
    const result = Replanner.replan(tasks, currentSchedule, availability, now);

    expect(result.missedTasks).toHaveLength(1);
    expect(result.missedTasks[0].id).toBe('t1');
  });

  it('generates a new schedule starting from now', () => {
    const now = new Date('2024-01-01T10:30:00Z');
    const result = Replanner.replan(tasks, currentSchedule, availability, now);

    expect(result.newSchedule.length).toBeGreaterThan(0);
    const firstBlockStart = new Date(result.newSchedule[0].startTime);
    expect(isAfter(firstBlockStart, new Date('2024-01-01T10:29:00Z'))).toBe(true);
    expect(firstBlockStart.toISOString()).toBe(now.toISOString());
  });
});
