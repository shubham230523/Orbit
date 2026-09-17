import { insightService } from '../insight-service';
import { runQuery } from '@/db/client';
import { useAuthStore } from '@/store/use-auth-store';

jest.mock('@/db/client', () => ({
  runQuery: jest.fn(),
}));

jest.mock('@/store/use-auth-store', () => ({
  useAuthStore: {
    getState: jest.fn(),
  },
}));

describe('InsightService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore.getState as jest.Mock).mockReturnValue({ user: { id: 'user-1' } });
  });

  it('calculates productivity stats correctly', async () => {
    // Mock tasks query
    (runQuery as jest.Mock).mockImplementation((query) => {
      if (query.includes('FROM tasks')) {
        return Promise.resolve([
          { status: 'completed', actualDuration: 30 },
          { status: 'todo', actualDuration: 0 }
        ]);
      }
      if (query.includes('FROM habits')) {
        return Promise.resolve([{ id: 'h1', title: 'Habit 1' }]);
      }
      if (query.includes('FROM habit_entries')) {
        return Promise.resolve([
          { date: new Date().toISOString(), completed: 1 }
        ]);
      }
      return Promise.resolve([]);
    });

    const stats = await insightService.getProductivityStats();

    expect(stats.completionRate).toBe(50);
    expect(stats.tasksCompleted).toBe(1);
    expect(stats.totalTasks).toBe(2);
    expect(stats.habitStreaks['Habit 1']).toBe(1);
  });

  it('returns empty stats if no user', async () => {
    (useAuthStore.getState as jest.Mock).mockReturnValue({ user: null });
    const stats = await insightService.getProductivityStats();
    expect(stats.completionRate).toBe(0);
    expect(stats.weeklyActivity).toHaveLength(0);
  });
});
