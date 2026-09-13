import { NativeModules, Platform } from 'react-native';
import { PlatformAIAdapter, InferenceResult } from './platform-ai-adapter';

const LlamaModule = NativeModules.LlamaModule;

export class AndroidAIAdapter implements PlatformAIAdapter {
  isAvailable(): boolean {
    return !!LlamaModule;
  }

  async loadModel(path: string): Promise<void> {
    if (Platform.OS !== 'android') return;
    if (!LlamaModule) {
      console.warn('LlamaModule is null. Native AI features will be mocked.');
      return;
    }
    return LlamaModule.loadModel(path);
  }

  async infer(prompt: string): Promise<InferenceResult> {
    if (Platform.OS !== 'android') throw new Error('Android only');
    if (!LlamaModule) {
      console.warn('LlamaModule is null. Returning mock response.');
      return { text: JSON.stringify({ objective: 'Mocked objective from local-first Orbit', milestones: [] }) };
    }
    return LlamaModule.infer(prompt);
  }

  async cancel(): Promise<void> {
    if (Platform.OS !== 'android') return;
    if (!LlamaModule) return;
    return LlamaModule.cancel();
  }

  async unloadModel(): Promise<void> {
    if (Platform.OS !== 'android') return;
    if (!LlamaModule) return;
    return LlamaModule.unloadModel();
  }
}
