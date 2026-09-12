import { Scheduler, Availability } from '@/utils/scheduler';
import { Task, ScheduleBlock } from '@/types/domain';

describe('Scheduler Integration', () => {
  const availability: Availability = {
    startTime: '09:00:00',
    endTime: '17:00:00'
  };

  // Use a fixed date to avoid issues with current time
  const testDate = new Date('2026-09-12T00:00:00Z');

  const mockTasks: Task[] = [
    {
      id: 't1',
      title: 'High Priority Task',
      priority: 'high',
      status: 'todo',
      estimatedDuration: 60,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 't2',
      title: 'Medium Priority Task',
      priority: 'medium',
      status: 'todo',
      estimatedDuration: 120,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 't3',
      title: 'Low Priority Task',
      priority: 'low',
      status: 'todo',
      estimatedDuration: 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  it('should schedule tasks based on priority and duration', () => {
    const schedule = Scheduler.generateSchedule(mockTasks, availability, testDate);

    expect(schedule).toHaveLength(3);

    // Check order: High -> Medium -> Low
    expect(schedule[0].taskId).toBe('t1');
    expect(schedule[1].taskId).toBe('t2');
    expect(schedule[2].taskId).toBe('t3');

    // Check timing (all times in UTC in Orbit's scheduler implementation)
    expect(schedule[0].startTime).toContain('09:00:00');
    expect(schedule[0].endTime).toContain('10:00:00');

    expect(schedule[1].startTime).toContain('10:00:00');
    expect(schedule[1].endTime).toContain('12:00:00');
  });

  it('should respect existing calendar events and avoid conflicts', () => {
    const existingEvents: ScheduleBlock[] = [
      {
        id: 'e1',
        userId: 'user-1',
        title: 'Meeting',
        type: 'EVENT',
        startTime: '2026-09-12T10:00:00.000Z',
        endTime: '2026-09-12T11:00:00.000Z'
      }
    ];

    const schedule = Scheduler.generateSchedule(mockTasks, availability, testDate, existingEvents);

    // t1 (1hr) starts at 09:00, ends at 10:00.
    // Meeting is 10:00 - 11:00.
    // t2 (2hr) should start at 11:00, ends at 13:00.
    // t3 (30min) should start at 13:00, ends at 13:30.

    expect(schedule[0].taskId).toBe('t1');
    expect(schedule[0].startTime).toContain('09:00:00');
    expect(schedule[0].endTime).toContain('10:00:00');

    expect(schedule[1].taskId).toBe('t2');
    expect(schedule[1].startTime).toContain('11:00:00');
    expect(schedule[1].endTime).toContain('13:00:00');

    expect(schedule[2].taskId).toBe('t3');
    expect(schedule[2].startTime).toContain('13:00:00');
  });

  it('should remain deterministic given identical inputs (excluding random IDs)', () => {
    const run1 = Scheduler.generateSchedule(mockTasks, availability, testDate);
    const run2 = Scheduler.generateSchedule(mockTasks, availability, testDate);

    // Compare everything except the randomly generated ID
    const normalize = (s: ScheduleBlock[]) => s.map(b => {
        const { id, ...rest } = b;
        return rest;
    });

    expect(normalize(run1)).toEqual(normalize(run2));
  });

  it('should not exceed daily capacity', () => {
    const hugeTask: Task = {
      id: 'huge',
      title: 'Huge Task',
      priority: 'high',
      status: 'todo',
      estimatedDuration: 600, // 10 hours, exceeds 9-5 (8 hours)
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const schedule = Scheduler.generateSchedule([hugeTask], availability, testDate);

    expect(schedule).toHaveLength(0);
  });
});
