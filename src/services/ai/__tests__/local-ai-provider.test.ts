import { LocalAIProvider } from '../local-ai-provider';
import { LocalModelStatus } from '../types';
import { PlatformAIAdapter } from '../platform-ai-adapter';
import { ModelStorage } from '../model-storage';

describe('LocalAIProvider', () => {
  let provider: LocalAIProvider;
  let mockAdapter: jest.Mocked<PlatformAIAdapter>;
  let mockStorage: jest.Mocked<ModelStorage>;

  beforeEach(() => {
    mockAdapter = {
      loadModel: jest.fn().mockResolvedValue(undefined),
      infer: jest.fn().mockResolvedValue({ text: '{"milestones": []}', tokensPerSecond: 10 }),
      cancel: jest.fn().mockResolvedValue(undefined),
      unloadModel: jest.fn().mockResolvedValue(undefined),
    };
    mockStorage = {
      getModelPath: jest.fn().mockReturnValue('/path/to/model'),
      exists: jest.fn().mockResolvedValue(true),
      delete: jest.fn().mockResolvedValue(undefined),
      getFreeDiskSpace: jest.fn().mockResolvedValue(2000000000),
    };
    provider = new LocalAIProvider(mockAdapter, mockStorage);
  });

  it('starts with INSTALLED status if file exists', async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(provider.getStatus()).toBe(LocalModelStatus.INSTALLED);
  });

  it('moves to LOADED status after initialization', async () => {
    await provider.initialize();
    expect(provider.getStatus()).toBe(LocalModelStatus.LOADED);
    expect(mockAdapter.loadModel).toHaveBeenCalledWith('/path/to/model');
  });

  it('generates roadmap correctly', async () => {
    await provider.initialize();
    const result = await provider.generateRoadmap('Test Goal');
    expect(result.milestones).toEqual([]);
    expect(mockAdapter.infer).toHaveBeenCalled();
  });
});
