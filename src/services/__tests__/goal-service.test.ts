import { goalService } from '../goal-service';
import { runQuery, runExecute } from '@/db/client';
import { useAuthStore } from '@/store/use-auth-store';
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

jest.mock('../ai/ai-provider-factory', () => ({
  AIProviderFactory: {
    getProvider: jest.fn(),
  },
}));

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('GoalService', () => {
  const mockUser = { id: 'user-1' };
  const mockGoal = {
    id: 'goal-1',
    userId: 'user-1',
    title: 'Test Goal',
    description: 'Description',
    status: 'active',
    priority: 'medium',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore.getState as jest.Mock).mockReturnValue({ user: mockUser });
  });

  it('gets goals for the user', async () => {
    (runQuery as jest.Mock).mockResolvedValueOnce([mockGoal]);

    const goals = await goalService.getGoals();

    expect(goals).toEqual([mockGoal]);
    expect(runQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM goals'),
      [mockUser.id]
    );
  });

  it('gets a single goal', async () => {
    (runQuery as jest.Mock).mockResolvedValueOnce([mockGoal]);

    const goal = await goalService.getGoal('goal-1');

    expect(goal).toEqual(mockGoal);
    expect(runQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM goals WHERE id = ?'),
      ['goal-1']
    );
  });

  it('creates a goal', async () => {
    const newId = 'new-goal-uuid';
    (uuidv4 as jest.Mock).mockReturnValue(newId);
    (runExecute as jest.Mock).mockResolvedValueOnce(undefined);

    const goalData = { title: 'New Goal', description: 'Desc' };
    const goal = await goalService.createGoal(goalData);

    expect(goal.id).toBe(newId);
    expect(goal.userId).toBe(mockUser.id);
    expect(runExecute).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO goals'),
      expect.arrayContaining([newId, mockUser.id, goalData.title])
    );
  });

  it('deletes a goal and its roadmaps/milestones', async () => {
    (runQuery as jest.Mock).mockResolvedValueOnce([{ id: 'roadmap-1' }]);
    (runExecute as jest.Mock).mockResolvedValue(undefined);

    await goalService.deleteGoal('goal-1');

    expect(runQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM roadmaps WHERE goalId = ?'),
      ['goal-1']
    );
    expect(runExecute).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM milestones WHERE roadmapId = ?'),
      ['roadmap-1']
    );
    expect(runExecute).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM roadmaps WHERE id = ?'),
      ['roadmap-1']
    );
    expect(runExecute).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM tasks WHERE goalId = ?'),
      ['goal-1']
    );
    expect(runExecute).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM goals WHERE id = ?'),
      ['goal-1']
    );
  });

  it('generates a roadmap using AI and saves it', async () => {
    const mockAIResponse = {
      milestones: [
        { title: 'M1', description: 'D1' }
      ]
    };
    const mockProvider = {
      generateRoadmap: jest.fn().mockResolvedValue(mockAIResponse),
    };

    (runQuery as jest.Mock).mockResolvedValueOnce([mockGoal]); // For getGoal inside generateRoadmap
    (AIProviderFactory.getProvider as jest.Mock).mockReturnValue(mockProvider);
    (uuidv4 as jest.Mock).mockReturnValueOnce('new-roadmap-uuid').mockReturnValue('new-milestone-uuid');

    const result = await goalService.generateRoadmap('goal-1');

    expect(result.roadmap.id).toBe('new-roadmap-uuid');
    expect(result.milestones).toHaveLength(1);
    expect(result.milestones[0].id).toBe('new-milestone-uuid');
    expect(runExecute).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO roadmaps'),
      expect.arrayContaining(['new-roadmap-uuid', 'goal-1'])
    );
    expect(runExecute).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO milestones'),
      expect.arrayContaining(['new-milestone-uuid', 'new-roadmap-uuid', 'M1', 'D1'])
    );
  });
});
