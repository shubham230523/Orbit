import { Platform } from 'react-native';
import { AIProvider, AIProviderType } from './types';
import { LocalAIProvider } from './local-ai-provider';
import { RemoteAIProvider } from './remote-ai-provider';
import { useAIStore } from '@/store/use-ai-store';
import { AndroidAIAdapter } from './android-ai-adapter';
import { ExpoModelStorage } from './model-storage';

export class AIProviderFactory {
  private static localProvider: LocalAIProvider | null = null;
  private static remoteProvider = new RemoteAIProvider();

  static getProvider(): AIProvider {
    const type = useAIStore.getState().providerType;

    if (type === AIProviderType.LOCAL) {
      if (!this.localProvider) {
        const adapter = this.createPlatformAdapter();
        this.localProvider = new LocalAIProvider(adapter, new ExpoModelStorage());
      }
      return this.localProvider;
    }

    return this.remoteProvider;
  }

  private static createPlatformAdapter() {
    switch (Platform.OS) {
      case 'android':
        return new AndroidAIAdapter();
      case 'ios':
        // Will be implemented in Phase 16
        return new AndroidAIAdapter();
      default:
        // Fallback for Web/Desktop
        return new AndroidAIAdapter();
    }
  }

  // For testing
  static reset() {
    this.localProvider = null;
  }
}
