import { scheduleService } from '../schedule-service';
import { runQuery, runExecute } from '@/db/client';
import { useAuthStore } from '@/store/use-auth-store';
import { taskService } from '../task-service';
import { habitService } from '../habit-service';
import { AIProviderFactory } from '../ai/ai-provider-factory';
import { v4 as uuidv4 } from 'uuid';

jest.mock('@/db/client', () => ({
  runQuery: jest.fn(),
  runExecute: jest.fn(),
}));

jest.mock('@/store/use-auth-store', () => ({
  useAuthStore: {
    getState: jest.fn(),
  },
}));

jest.mock('../task-service', () => ({
  taskService: {
    getTasks: jest.fn(),
  },
}));

jest.mock('../habit-service', () => ({
  habitService: {
    getHabitsWithStatus: jest.fn(),
  },
}));

jest.mock('../ai/ai-provider-factory', () => ({
  AIProviderFactory: {
    getProvider: jest.fn(),
  },
}));

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('ScheduleService', () => {
  const mockUser = { id: 'user-1' };
  const mockBlock = {
    id: 'block-1',
    userId: 'user-1',
    taskId: 'task-1',
    title: 'Work on Orbit',
    startTime: '2023-01-01T09:00:00Z',
    endTime: '2023-01-01T10:00:00Z',
    type: 'TASK',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore.getState as jest.Mock).mockReturnValue({ user: mockUser });
    (habitService.getHabitsWithStatus as jest.Mock).mockResolvedValue([]);
  });

  it('gets schedule blocks for the user', async () => {
    (runQuery as jest.Mock).mockResolvedValueOnce([mockBlock]);

    const schedule = await scheduleService.getSchedule();

    expect(schedule).toEqual([mockBlock]);
    expect(runQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM schedule_blocks'),
      [mockUser.id]
    );
  });

  it('generates a schedule using AI', async () => {
    const mockTasks = [{ id: 'task-1', title: 'Task 1' }];
    const mockAIResponse = {
      schedule: [
        { taskId: 'task-1', startTime: '09:00', endTime: '10:00', reason: 'Focus' },
        { title: 'Lunch', startTime: '12:00', endTime: '13:00', type: 'BREAK', reason: 'Eat' }
      ]
    };
    const mockProvider = {
      generateSchedule: jest.fn().mockResolvedValue(mockAIResponse),
      getType: jest.fn().mockReturnValue('LOCAL'),
    };

    (taskService.getTasks as jest.Mock).mockResolvedValue(mockTasks);
    (habitService.getHabitsWithStatus as jest.Mock).mockResolvedValue([]);
    (AIProviderFactory.getProvider as jest.Mock).mockReturnValue(mockProvider);
    (uuidv4 as jest.Mock).mockReturnValue('new-block-uuid');

    const result = await scheduleService.generateSchedule();

    expect(result).toHaveLength(2);
    expect(result[0].taskId).toBe('task-1');
    expect(mockProvider.generateSchedule).toHaveBeenCalled();
    expect(runExecute).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM schedule_blocks'),
      [mockUser.id]
    );
    expect(runExecute).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO schedule_blocks'),
      expect.arrayContaining(['new-block-uuid', 'task-1', '09:00', '10:00'])
    );
  });

  it('clears the schedule', async () => {
    (runExecute as jest.Mock).mockResolvedValueOnce(undefined);

    await scheduleService.clearSchedule();

    expect(runExecute).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM schedule_blocks WHERE userId = ?'),
      [mockUser.id]
    );
  });
});
