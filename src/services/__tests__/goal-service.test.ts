import { goalService } from '../goal-service';
import { runQuery, runExecute } from '@/db/client';
import { AIProviderFactory } from '../ai/ai-provider-factory';
import { AIProviderType } from '../ai/types';
import { useAuthStore } from '@/store/use-auth-store';

jest.mock('@/db/client', () => ({
  runQuery: jest.fn(),
  runExecute: jest.fn(),
}));

jest.mock('../ai/ai-provider-factory');

jest.mock('@/store/use-auth-store', () => ({
  useAuthStore: {
    getState: jest.fn(() => ({
      user: { id: 'u1' }
    }))
  }
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid'),
}));

describe('GoalService', () => {
  const mockGoal = {
    id: 'test-uuid',
    userId: 'u1',
    title: 'Test Goal',
    description: 'Description',
    status: 'active',
    priority: 'medium',
    createdAt: expect.any(String),
    updatedAt: expect.any(String),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gets all goals', async () => {
    (runQuery as jest.Mock).mockResolvedValueOnce([mockGoal]);
    const goals = await goalService.getGoals();
    expect(goals).toEqual([mockGoal]);
    expect(runQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM goals'),
      ['u1']
    );
  });

  it('gets a single goal', async () => {
    (runQuery as jest.Mock).mockResolvedValueOnce([mockGoal]);
    const goal = await goalService.getGoal('test-uuid');
    expect(goal).toEqual(mockGoal);
    expect(runQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM goals WHERE id = ?'),
      ['test-uuid']
    );
  });

  it('creates a goal', async () => {
    (runExecute as jest.Mock).mockResolvedValueOnce(undefined);
    const goal = await goalService.createGoal({ title: 'Test Goal', description: 'Description' });

    expect(goal).toEqual(mockGoal);
    expect(runExecute).toHaveBeenCalled();
  });

  it('updates a goal', async () => {
    (runExecute as jest.Mock).mockResolvedValueOnce(undefined);
    await goalService.updateGoal(mockGoal as any);
    expect(runExecute).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE goals SET'),
      expect.any(Array)
    );
  });

  it('deletes a goal', async () => {
    (runExecute as jest.Mock).mockResolvedValue(undefined);
    (runQuery as jest.Mock).mockResolvedValueOnce([]); // No roadmaps

    await goalService.deleteGoal('test-uuid');
    expect(runExecute).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM goals WHERE id = ?'),
      ['test-uuid']
    );
  });

  it('gets roadmap', async () => {
    const mockRoadmap = { id: 'r1', goalId: 'g1', title: 'Roadmap' };
    (runQuery as jest.Mock)
      .mockResolvedValueOnce([mockRoadmap])
      .mockResolvedValueOnce([]); // No milestones

    const result = await goalService.getRoadmap('g1');
    expect(result).toEqual({ roadmap: mockRoadmap, milestones: [] });
  });

  describe('generateRoadmap', () => {
    it('uses local generation and saves to SQLite', async () => {
      const aiResponse = { milestones: [{ title: 'M1', description: 'D1' }] };
      const mockProvider = {
        getType: jest.fn().mockReturnValue(AIProviderType.LOCAL),
        generateRoadmap: jest.fn().mockResolvedValue(aiResponse),
      };
      (AIProviderFactory.getProvider as jest.Mock).mockReturnValue(mockProvider);

      // getGoal mock
      (runQuery as jest.Mock).mockResolvedValueOnce([mockGoal]);

      const result = await goalService.generateRoadmap('test-uuid');

      expect(result.roadmap.title).toContain(mockGoal.title);
      expect(result.milestones.length).toBe(1);
      expect(mockProvider.generateRoadmap).toHaveBeenCalled();
      expect(runExecute).toHaveBeenCalled();
    });
  });
});
