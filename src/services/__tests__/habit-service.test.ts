import { habitService } from '../habit-service';
import { runQuery, runExecute } from '@/db/client';
import { useAuthStore } from '@/store/use-auth-store';
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

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('HabitService', () => {
  const mockUser = { id: 'user-1' };
  const mockHabit = {
    id: 'habit-1',
    userId: 'user-1',
    title: 'Workout',
    frequency: 'DAILY',
    createdAt: '2023-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore.getState as jest.Mock).mockReturnValue({ user: mockUser });
  });

  it('gets habits with status for a date', async () => {
    const date = '2023-01-01';
    (runQuery as jest.Mock).mockResolvedValueOnce([
      { ...mockHabit, completed: 1 }
    ]);

    const habits = await habitService.getHabitsWithStatus(date);

    expect(habits[0].completed).toBe(true);
    expect(runQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT h.*, (SELECT e.completed'),
      [date, mockUser.id]
    );
  });

  it('creates a habit', async () => {
    const newId = 'new-habit-uuid';
    (uuidv4 as jest.Mock).mockReturnValue(newId);
    (runExecute as jest.Mock).mockResolvedValueOnce(undefined);

    const habitData = { title: 'Read', frequency: 'DAILY' as const };
    const habit = await habitService.createHabit(habitData);

    expect(habit.id).toBe(newId);
    expect(habit.userId).toBe(mockUser.id);
    expect(runExecute).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO habits'),
      expect.arrayContaining([newId, mockUser.id, habitData.title])
    );
  });

  it('logs a habit entry', async () => {
    const entryId = 'entry-uuid';
    (uuidv4 as jest.Mock).mockReturnValue(entryId);
    (runExecute as jest.Mock).mockResolvedValueOnce(undefined);

    const result = await habitService.logHabit('habit-1', '2023-01-01', true);

    expect(result.id).toBe(entryId);
    expect(result.completed).toBe(true);
    expect(runExecute).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR REPLACE INTO habit_entries'),
      [entryId, 'habit-1', '2023-01-01', 1]
    );
  });

  it('gets habit entries', async () => {
    (runQuery as jest.Mock).mockResolvedValueOnce([
      { id: 'e1', habitId: 'habit-1', date: '2023-01-01', completed: 1 }
    ]);

    const entries = await habitService.getHabitEntries('habit-1');

    expect(entries[0].completed).toBe(true);
    expect(runQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM habit_entries'),
      ['habit-1']
    );
  });
});
