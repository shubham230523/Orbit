import { NativeModules, Platform } from 'react-native';
import { PlatformAIAdapter, InferenceResult } from './platform-ai-adapter';

const { LlamaModule } = NativeModules;

export class AndroidAIAdapter implements PlatformAIAdapter {
  async loadModel(path: string): Promise<void> {
    if (Platform.OS !== 'android') return;
    return LlamaModule.loadModel(path);
  }

  async infer(prompt: string): Promise<InferenceResult> {
    if (Platform.OS !== 'android') throw new Error('Android only');
    return LlamaModule.infer(prompt);
  }

  async cancel(): Promise<void> {
    if (Platform.OS !== 'android') return;
    return LlamaModule.cancel();
  }

  async unloadModel(): Promise<void> {
    if (Platform.OS !== 'android') return;
    return LlamaModule.unloadModel();
  }
}
