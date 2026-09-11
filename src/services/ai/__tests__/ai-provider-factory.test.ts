import { AIProviderFactory } from '../ai-provider-factory';
import { AIProviderType } from '../types';
import { useAIStore } from '@/store/use-ai-store';

describe('AIProviderFactory', () => {
  it('returns LocalAIProvider by default', () => {
    const provider = AIProviderFactory.getProvider();
    expect(provider.getType()).toBe(AIProviderType.LOCAL);
  });

  it('returns RemoteAIProvider when selected in store', () => {
    useAIStore.getState().setProviderType(AIProviderType.REMOTE);
    const provider = AIProviderFactory.getProvider();
    expect(provider.getType()).toBe(AIProviderType.REMOTE);
  });

  it('switches back to LocalAIProvider', () => {
    useAIStore.getState().setProviderType(AIProviderType.LOCAL);
    const provider = AIProviderFactory.getProvider();
    expect(provider.getType()).toBe(AIProviderType.LOCAL);
  });
});
