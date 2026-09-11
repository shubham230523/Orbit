import { AIProviderFactory } from '../ai-provider-factory';
import { AIProviderType } from '../types';
import { useAIStore } from '@/store/use-ai-store';
import { RemoteAIProvider } from '../remote-ai-provider';
import { LocalAIProvider } from '../local-ai-provider';

// Mock LocalAIProvider to avoid FileSystem issues in this test
jest.mock('../local-ai-provider', () => {
  return {
    LocalAIProvider: jest.fn().mockImplementation(() => ({
      getType: () => 'LOCAL',
    })),
  };
});

describe('AI Provider Switching', () => {
  beforeEach(() => {
    AIProviderFactory.reset();
  });

  it('defaults to LOCAL', () => {
    expect(useAIStore.getState().providerType).toBe(AIProviderType.LOCAL);
    const provider = AIProviderFactory.getProvider();
    expect(provider.getType()).toBe(AIProviderType.LOCAL);
  });

  it('switches to REMOTE and persists', () => {
    useAIStore.getState().setProviderType(AIProviderType.REMOTE);
    const provider = AIProviderFactory.getProvider();
    expect(provider).toBeInstanceOf(RemoteAIProvider);
    expect(provider.getType()).toBe(AIProviderType.REMOTE);
  });
});
