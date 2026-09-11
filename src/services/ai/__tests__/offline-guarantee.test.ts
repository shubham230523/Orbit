import { AIProviderFactory } from '../ai-provider-factory';
import { AIProviderType, LocalModelStatus } from '../types';
import { useAIStore } from '@/store/use-ai-store';
import { apiClient } from '../../api-client';
import { LocalAIProvider } from '../local-ai-provider';
import { ExpoModelStorage } from '../model-storage';
import { AndroidAIAdapter } from '../android-ai-adapter';

jest.mock('../../api-client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

// Mock storage to return exists: true
jest.mock('../model-storage', () => {
  return {
    ExpoModelStorage: jest.fn().mockImplementation(() => ({
      exists: jest.fn().mockResolvedValue(true),
      getModelPath: jest.fn().mockReturnValue('/mock/path'),
    })),
  };
});

describe('Offline Guarantee', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AIProviderFactory.reset();
    useAIStore.getState().setProviderType(AIProviderType.LOCAL);
    useAIStore.getState().setIsModelDownloaded(true);
  });

  it('LocalAIProvider does not call API Client during roadmap generation', async () => {
    const provider = AIProviderFactory.getProvider();
    await provider.initialize();

    try {
      await provider.generateRoadmap('Goal');
    } catch (e) {
      // Ignored
    }

    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it('RemoteAIProvider DOES call API Client during analyzeGoal', async () => {
    useAIStore.getState().setProviderType(AIProviderType.REMOTE);
    const provider = AIProviderFactory.getProvider();

    (apiClient.post as jest.Mock).mockResolvedValue({ data: { objective: 'test' } });

    await provider.analyzeGoal('Goal');
    expect(apiClient.post).toHaveBeenCalledWith('/ai/analyze-goal', { title: 'Goal' });
  });
});
