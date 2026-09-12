import { Replanner } from '@/utils/replanner';
import { Task, ScheduleBlock } from '@/types/domain';
import { Availability } from '@/utils/scheduler';

describe('Replanning Integration', () => {
  const availability: Availability = {
    startTime: '09:00:00',
    endTime: '17:00:00'
  };

  const testDate = new Date('2026-09-12T12:00:00Z'); // Midday

  const tasks: Task[] = [
    {
      id: 't1',
      title: 'Missed Task',
      priority: 'high',
      status: 'todo',
      estimatedDuration: 60,
      createdAt: testDate.toISOString(),
      updatedAt: testDate.toISOString()
    },
    {
      id: 't2',
      title: 'Future Task',
      priority: 'medium',
      status: 'todo',
      estimatedDuration: 60,
      createdAt: testDate.toISOString(),
      updatedAt: testDate.toISOString()
    }
  ];

  const currentSchedule: ScheduleBlock[] = [
    {
      id: 'b1',
      userId: 'user-1',
      taskId: 't1',
      title: 'Missed Task',
      startTime: '2026-09-12T10:00:00.000Z',
      endTime: '2026-09-12T11:00:00.000Z',
      type: 'TASK'
    },
    {
      id: 'b2',
      userId: 'user-1',
      taskId: 't2',
      title: 'Future Task',
      startTime: '2026-09-12T13:00:00.000Z',
      endTime: '2026-09-12T14:00:00.000Z',
      type: 'TASK'
    }
  ];

  it('should detect missed tasks and generate a new schedule starting from now', () => {
    // Current time is 12:00. t1 was supposed to finish at 11:00.
    const result = Replanner.replan(tasks, currentSchedule, availability, testDate);

    expect(result.missedTasks).toHaveLength(1);
    expect(result.missedTasks[0].id).toBe('t1');

    expect(result.newSchedule).toHaveLength(2);

    // New schedule should start at 12:00 (testDate)
    expect(result.newSchedule[0].startTime).toBe(testDate.toISOString());
    expect(result.newSchedule[0].taskId).toBe('t1'); // Priority high

    expect(result.newSchedule[1].startTime).toBe(result.newSchedule[0].endTime);
    expect(result.newSchedule[1].taskId).toBe('t2');
  });

  it('should only include tasks that are not yet completed', () => {
    const completedTasks: Task[] = [
      { ...tasks[0], status: 'completed' },
      tasks[1]
    ];

    const result = Replanner.replan(completedTasks, currentSchedule, availability, testDate);

    expect(result.missedTasks).toHaveLength(0);
    expect(result.newSchedule).toHaveLength(1);
    expect(result.newSchedule[0].taskId).toBe('t2');
  });

  it('should handle tasks that cannot fit in remaining capacity', () => {
      // 12:00 to 17:00 is 5 hours (300 mins)
      const hugeTask: Task = {
          id: 'huge',
          title: 'Huge Task',
          priority: 'high',
          status: 'todo',
          estimatedDuration: 400,
          createdAt: testDate.toISOString(),
          updatedAt: testDate.toISOString()
      };

      const result = Replanner.replan([hugeTask], [], availability, testDate);
      expect(result.newSchedule).toHaveLength(0);
  });
});
