import { LocalAIProvider } from '../local-ai-provider';
import { PlatformAIAdapter } from '../platform-ai-adapter';
import { ModelStorage } from '../model-storage';

describe('LocalAI Validation', () => {
  let provider: LocalAIProvider;
  let mockAdapter: jest.Mocked<PlatformAIAdapter>;

  beforeEach(() => {
    mockAdapter = {
      isAvailable: jest.fn().mockReturnValue(true),
      loadModel: jest.fn().mockResolvedValue(undefined),
      infer: jest.fn(),
      cancel: jest.fn().mockResolvedValue(undefined),
      unloadModel: jest.fn().mockResolvedValue(undefined),
    };
    const mockStorage: any = {
      getModelPath: () => '/path',
      exists: () => Promise.resolve(true),
    };
    provider = new LocalAIProvider(mockAdapter, mockStorage);
  });

  it('successfully parses valid roadmap JSON', async () => {
    await provider.initialize();
    mockAdapter.infer.mockResolvedValue({
      text: JSON.stringify({
        milestones: [{ title: 'M1', description: 'D1', estimatedWeeks: 1 }],
      }),
      tokensPerSecond: 10,
    });
    const result = await provider.generateRoadmap('Goal');
    expect(result.milestones).toHaveLength(1);
    expect(result.milestones[0].title).toBe('M1');
  });

  it('throws error on malformed JSON', async () => {
    await provider.initialize();
    mockAdapter.infer.mockResolvedValue({ text: 'not json', tokensPerSecond: 10 });
    await expect(provider.generateRoadmap('Goal')).rejects.toThrow();
  });

  it('throws error on schema mismatch', async () => {
    await provider.initialize();
    mockAdapter.infer.mockResolvedValue({
      text: JSON.stringify({ wrong: 'field' }),
      tokensPerSecond: 10,
    });
    await expect(provider.generateRoadmap('Goal')).rejects.toThrow();
  });
});
