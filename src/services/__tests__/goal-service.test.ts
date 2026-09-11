import { goalService } from '../goal-service';
import { apiClient } from '../api-client';
import { AIProviderFactory } from '../ai/ai-provider-factory';
import { AIProviderType } from '../ai/types';

jest.mock('../api-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('../ai/ai-provider-factory');

describe('GoalService', () => {
  const mockGoal = {
    id: '1',
    title: 'Test Goal',
    description: 'Description',
    status: 'active',
    priority: 'medium',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gets all goals', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: [mockGoal] });
    const goals = await goalService.getGoals();
    expect(goals).toEqual([mockGoal]);
    expect(apiClient.get).toHaveBeenCalledWith('/goals');
  });

  it('gets a single goal', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockGoal });
    const goal = await goalService.getGoal('1');
    expect(goal).toEqual(mockGoal);
    expect(apiClient.get).toHaveBeenCalledWith('/goals/1');
  });

  it('creates a goal', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: mockGoal });
    const goal = await goalService.createGoal({ title: 'Test Goal' });
    expect(goal).toEqual(mockGoal);
    expect(apiClient.post).toHaveBeenCalledWith('/goals', { title: 'Test Goal' });
  });

  it('updates a goal', async () => {
    (apiClient.put as jest.Mock).mockResolvedValueOnce({});
    await goalService.updateGoal(mockGoal as any);
    expect(apiClient.put).toHaveBeenCalledWith('/goals/1', mockGoal);
  });

  it('deletes a goal', async () => {
    (apiClient.delete as jest.Mock).mockResolvedValueOnce({});
    await goalService.deleteGoal('1');
    expect(apiClient.delete).toHaveBeenCalledWith('/goals/1');
  });

  it('gets roadmap', async () => {
    const mockRoadmap = { roadmap: { id: 'r1' }, milestones: [] };
    (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockRoadmap });
    const result = await goalService.getRoadmap('1');
    expect(result).toEqual(mockRoadmap);
    expect(apiClient.get).toHaveBeenCalledWith('/goals/1/roadmap');
  });

  describe('generateRoadmap', () => {
    it('uses remote generation when provider is REMOTE', async () => {
      const mockResult = { roadmap: { id: 'r1' }, milestones: [] };
      const mockProvider = {
        getType: jest.fn().mockReturnValue(AIProviderType.REMOTE),
      };
      (AIProviderFactory.getProvider as jest.Mock).mockReturnValue(mockProvider);
      (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: mockResult });

      const result = await goalService.generateRoadmap('1');

      expect(result).toEqual(mockResult);
      expect(apiClient.post).toHaveBeenCalledWith('/goals/1/roadmap/generate');
    });

    it('uses local generation when provider is LOCAL', async () => {
      const mockResult = { roadmap: { id: 'r1' }, milestones: [] };
      const aiResponse = { roadmap: { title: 'Local' }, milestones: [] };
      const mockProvider = {
        getType: jest.fn().mockReturnValue(AIProviderType.LOCAL),
        generateRoadmap: jest.fn().mockResolvedValue(aiResponse),
      };
      (AIProviderFactory.getProvider as jest.Mock).mockReturnValue(mockProvider);
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockGoal });
      (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: mockResult });

      const result = await goalService.generateRoadmap('1');

      expect(result).toEqual(mockResult);
      expect(mockProvider.generateRoadmap).toHaveBeenCalledWith(mockGoal.title, mockGoal.description);
      expect(apiClient.post).toHaveBeenCalledWith('/goals/1/roadmap/save', aiResponse);
    });
  });
});
