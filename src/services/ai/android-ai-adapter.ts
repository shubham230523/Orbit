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
    console.log('[AndroidAIAdapter] Inference requested');
    if (Platform.OS !== 'android') throw new Error('Android only');

    if (!LlamaModule) {
      console.warn('[AndroidAIAdapter] LlamaModule not found. Returning structured mock data.');

      let mockData = {};
      if (prompt.includes('roadmap')) {
        mockData = {
          milestones: [
            { title: 'Foundations', description: 'Setup environment and basic concepts', estimatedWeeks: 1 },
            { title: 'Intermediate Skills', description: 'Deep dive into advanced topics', estimatedWeeks: 2 },
            { title: 'Project Implementation', description: 'Build and deploy a real-world project', estimatedWeeks: 1 }
          ]
        };
      } else if (prompt.includes('schedule')) {
        mockData = { schedule: [] };
      } else {
        mockData = {
          objective: 'Learn and Master the topic',
          constraints: ['Time', 'Resources'],
          measurableOutcomes: ['Certificate', 'Completed Project'],
          estimatedDurationWeeks: 4,
          category: 'Skill Development'
        };
      }

      return {
        text: JSON.stringify(mockData),
        tokensPerSecond: 0
      };
    }

    console.log('[AndroidAIAdapter] Calling native LlamaModule.infer...');
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
