import { Scheduler, Availability } from '../scheduler';
import { Task, ScheduleBlock } from '@/types/domain';
import { format } from 'date-fns';

describe('Scheduler', () => {
  const availability: Availability = {
    startTime: '09:00:00',
    endTime: '17:00:00',
  };

  const today = new Date(2024, 0, 1); // Monday

  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'High Priority',
      status: 'todo',
      priority: 'high',
      estimatedDuration: 60,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: '2',
      title: 'Medium Priority',
      status: 'todo',
      priority: 'medium',
      estimatedDuration: 120,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: '3',
      title: 'Low Priority',
      status: 'todo',
      priority: 'low',
      estimatedDuration: 30,
      createdAt: '',
      updatedAt: '',
    },
  ];

  it('calculates daily capacity correctly', () => {
    const capacity = Scheduler.calculateCapacity(availability);
    expect(capacity).toBe(8 * 60); // 8 hours
  });

  it('generates a schedule ordered by priority', () => {
    const schedule = Scheduler.generateSchedule(mockTasks, availability, today);
    expect(schedule).toHaveLength(3);
    expect(schedule[0].taskId).toBe('1');
    expect(schedule[1].taskId).toBe('2');
    expect(schedule[2].taskId).toBe('3');
  });

  it('respects daily capacity and skips tasks that do not fit', () => {
    const hugeTask: Task = {
      id: '4',
      title: 'Huge Task',
      status: 'todo',
      priority: 'high',
      estimatedDuration: 600, // 10 hours
      createdAt: '',
      updatedAt: '',
    };
    const schedule = Scheduler.generateSchedule([hugeTask], availability, today);
    expect(schedule).toHaveLength(0);
  });

  it('handles existing event conflicts by shifting tasks', () => {
    const testDate = new Date('2024-01-01T00:00:00Z');
    const existingEvents: ScheduleBlock[] = [
      {
        id: 'e1',
        userId: 'u1',
        title: 'Meeting',
        startTime: '2024-01-01T10:00:00.000Z',
        endTime: '2024-01-01T11:00:00.000Z',
        type: 'EVENT',
      },
    ];

    const tasks: Task[] = [{
      id: 't1',
      title: 'Task 1',
      status: 'todo',
      priority: 'high',
      estimatedDuration: 120,
      createdAt: '',
      updatedAt: '',
    }];

    const schedule = Scheduler.generateSchedule(tasks, availability, testDate, existingEvents);

    // Day starts at 09:00. Task 1 (120 min) would be 09:00-11:00.
    // Conflict with 10:00-11:00 meeting.
    // Scheduler should move it to 11:00-13:00.
    expect(schedule).toHaveLength(1);
    expect(schedule[0].startTime).toBe('2024-01-01T11:00:00.000Z');
    expect(schedule[0].endTime).toBe('2024-01-01T13:00:00.000Z');
  });

  it('handles empty task list', () => {
    const schedule = Scheduler.generateSchedule([], availability, today);
    expect(schedule).toHaveLength(0);
  });

  it('prioritizes deadlines when priorities are equal', () => {
    const tasks: Task[] = [
        {
          id: 't1',
          title: 'Deadline Far',
          status: 'todo',
          priority: 'medium',
          dueDate: '2024-01-10T00:00:00.000Z',
          estimatedDuration: 60,
          createdAt: '',
          updatedAt: '',
        },
        {
          id: 't2',
          title: 'Deadline Near',
          status: 'todo',
          priority: 'medium',
          dueDate: '2024-01-02T00:00:00.000Z',
          estimatedDuration: 60,
          createdAt: '',
          updatedAt: '',
        },
      ];
      const schedule = Scheduler.generateSchedule(tasks, availability, today);
      expect(schedule[0].taskId).toBe('t2');
      expect(schedule[1].taskId).toBe('t1');
  });
});
