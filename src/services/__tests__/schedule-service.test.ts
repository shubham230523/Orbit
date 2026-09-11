import { scheduleService } from '../schedule-service';
import { apiClient } from '../api-client';
import { AIProviderFactory } from '../ai/ai-provider-factory';
import { AIProviderType } from '../ai/types';
import { taskService } from '../task-service';

jest.mock('../api-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock('../ai/ai-provider-factory');
jest.mock('../task-service');

describe('ScheduleService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gets schedule', async () => {
    const mockBlocks = [{ id: '1', title: 'Task' }];
    (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockBlocks });
    const result = await scheduleService.getSchedule();
    expect(result).toEqual(mockBlocks);
    expect(apiClient.get).toHaveBeenCalledWith('/schedule');
  });

  describe('generateSchedule', () => {
    it('uses remote generation when provider is REMOTE', async () => {
      const mockBlocks = [{ id: '1', title: 'Remote Task' }];
      const mockProvider = {
        getType: jest.fn().mockReturnValue(AIProviderType.REMOTE),
      };
      (AIProviderFactory.getProvider as jest.Mock).mockReturnValue(mockProvider);
      (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: mockBlocks });

      const result = await scheduleService.generateSchedule();

      expect(result).toEqual(mockBlocks);
      expect(apiClient.post).toHaveBeenCalledWith('/schedule/generate');
    });

    it('uses local generation when provider is LOCAL', async () => {
      const mockTasks = [{ id: 't1', title: 'Local Task' }];
      const aiResponse = { schedule: [{ taskId: 't1', startTime: '...', endTime: '...', reason: '...' }] };
      const mockBlocks = [{ id: 'b1', title: 'Local Task' }];

      const mockProvider = {
        getType: jest.fn().mockReturnValue(AIProviderType.LOCAL),
        generateSchedule: jest.fn().mockResolvedValue(aiResponse),
      };
      (AIProviderFactory.getProvider as jest.Mock).mockReturnValue(mockProvider);
      (taskService.getTasks as jest.Mock).mockResolvedValueOnce(mockTasks);
      (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: mockBlocks });

      const result = await scheduleService.generateSchedule();

      expect(result).toEqual(mockBlocks);
      expect(mockProvider.generateSchedule).toHaveBeenCalledWith(mockTasks, '9 AM to 5 PM');
      expect(apiClient.post).toHaveBeenCalledWith('/schedule/save', aiResponse);
    });
  });
});
