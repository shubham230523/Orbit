import { mockBackend } from './mock-backend';
import { AIProviderFactory } from '@/services/ai/ai-provider-factory';
import { TestAIProvider } from './test-ai-provider';
import { RemoteAIProvider } from '@/services/ai/remote-ai-provider';
import { AIProviderType } from '@/services/ai/types';
import { useAIStore } from '@/store/use-ai-store';

// Variable prefixed with 'mock' is allowed in jest.mock factory
export const mockAIProvider = new TestAIProvider();
export const mockRemoteAIProvider = new RemoteAIProvider();

// Mock AIProviderFactory to return appropriate provider
jest.mock('@/services/ai/ai-provider-factory', () => ({
  AIProviderFactory: {
    getProvider: jest.fn(() => {
        // This is a bit tricky because useAIStore might not be available inside the factory mock if not imported correctly
        // But since we are in setup.ts, we can try
        try {
            const type = require('@/store/use-ai-store').useAIStore.getState().providerType;
            return type === 'LOCAL' ? mockAIProvider : mockRemoteAIProvider;
        } catch (e) {
            return mockAIProvider;
        }
    }),
    reset: jest.fn(),
  },
}));

// Reset backend state before each test
beforeEach(() => {
  mockBackend.reset();
  useAIStore.getState().setProviderType(AIProviderType.LOCAL);
  (AIProviderFactory.getProvider as jest.Mock).mockImplementation(() => {
    const type = useAIStore.getState().providerType;
    return type === AIProviderType.LOCAL ? mockAIProvider : mockRemoteAIProvider;
  });
});
