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

  it('analyzes goal correctly', async () => {
    mockAdapter.infer.mockResolvedValueOnce({
      text: JSON.stringify({ objective: 'Obj', constraints: [], measurableOutcomes: [], estimatedDurationWeeks: 1, category: 'Work' }),
      tokensPerSecond: 10
    });
    await provider.initialize();
    const result = await provider.analyzeGoal('Test Goal');
    expect(result.objective).toBe('Obj');
  });

  it('generates schedule correctly', async () => {
    mockAdapter.infer.mockResolvedValueOnce({
      text: JSON.stringify({ schedule: [] }),
      tokensPerSecond: 10
    });
    await provider.initialize();
    const result = await provider.generateSchedule([], '9-5');
    expect(result.schedule).toEqual([]);
  });

  it('chats correctly', async () => {
    mockAdapter.infer.mockResolvedValueOnce({ text: 'Hello', tokensPerSecond: 10 });
    await provider.initialize();
    const result = await provider.chat('Hi');
    expect(result).toBe('Hello');
  });

  it('researches correctly', async () => {
    mockAdapter.infer.mockResolvedValueOnce({ text: '{"info": "some"}', tokensPerSecond: 10 });
    await provider.initialize();
    const result = await provider.research('topic');
    expect(result.info).toBe('some');
  });

  it('throws error if model not downloaded during initialize', async () => {
    mockStorage.exists.mockResolvedValueOnce(false);
    await expect(provider.initialize()).rejects.toThrow('Model not downloaded');
  });

  it('throws error if inference called before load', async () => {
    await expect(provider.chat('Hi')).rejects.toThrow('Local model not loaded');
  });

  it('handles initialization failure', async () => {
    mockAdapter.loadModel.mockRejectedValueOnce(new Error('Load error'));
    await expect(provider.initialize()).rejects.toThrow('Load error');
    expect(provider.getStatus()).toBe(LocalModelStatus.FAILED);
  });

  it('can shutdown and unload model', async () => {
    await provider.initialize();
    await provider.shutdown();
    expect(mockAdapter.unloadModel).toHaveBeenCalled();
    expect(provider.getStatus()).toBe(LocalModelStatus.INSTALLED);
  });

  it('can cancel inference', () => {
    provider.cancel();
    expect(mockAdapter.cancel).toHaveBeenCalled();
  });
});
