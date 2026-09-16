import { Platform } from 'react-native';
import { PlatformAIAdapter, InferenceResult, InferenceRequest } from './platform-ai-adapter';

let initLlama: any;
try {
  // Use require for dynamic loading which is safer for some Expo environments
  initLlama = require('llama.rn').initLlama;
} catch (e) {
  console.warn('[AndroidAIAdapter] llama.rn not found in the binary');
}

export class AndroidAIAdapter implements PlatformAIAdapter {
  private context: any = null;

  isAvailable(): boolean {
    return !!initLlama;
  }

  async loadModel(path: string): Promise<void> {
    if (Platform.OS !== 'android') return;
    if (!initLlama) {
      console.warn('[AndroidAIAdapter] Native runtime missing. Skipping loadModel.');
      return;
    }

    if (this.context) return;

    console.log('[AndroidAIAdapter] Initializing llama.rn context with model:', path);
    try {
      const formattedPath = path.startsWith('file://') ? path : `file://${path}`;

      this.context = await initLlama({
        model: formattedPath,
        use_mlock: false,
        n_ctx: 4096, // Increased from 2048 to handle more tasks
        n_gpu_layers: 0, // Stability first for 4GB RAM devices
      });
      console.log('[AndroidAIAdapter] Context created successfully');
    } catch (error) {
      console.error('[AndroidAIAdapter] Failed to initialize llama.rn:', error);
      throw error;
    }
  }

  async infer(request: InferenceRequest): Promise<InferenceResult> {
    if (Platform.OS !== 'android') throw new Error('Android only');

    if (!this.context) {
      console.warn('[AndroidAIAdapter] Context not initialized. Orbit will return mock data.');
      return this.getMockData(request.prompt);
    }

    const fullPrompt = this.formatQwenPrompt(request);
    console.log('[AndroidAIAdapter] Starting inference...');

    let resultText = '';
    try {
      await this.context.completion(
        {
          prompt: fullPrompt,
          n_predict: 3072, // Further increased to handle detailed schedules
          temperature: 0.1, // Lowered for more deterministic/stable output
          stop: ['<|im_end|>', '<|endoftext|>'],
        },
        (data: any) => {
          resultText += data.token;
        }
      );

      console.log('[AndroidAIAdapter] Inference complete');
      return { text: resultText.trim() };
    } catch (error) {
      console.error('[AndroidAIAdapter] Inference failed:', error);
      throw error;
    }
  }

  private formatQwenPrompt(request: InferenceRequest): string {
    const system = request.systemPrompt || 'You are Orbit AI, a helpful productivity assistant.';
    return `<|im_start|>system
${system}<|im_end|>
<|im_start|>user
${request.prompt}<|im_end|>
<|im_start|>assistant`;
  }

  private getMockData(prompt: string): InferenceResult {
    // Return structured mock data consistent with Orbit's needs
    let mockData = {};
    if (prompt.toLowerCase().includes('roadmap')) {
      mockData = {
        milestones: [
          { title: 'Foundations', description: 'Setup environment and basic concepts', estimatedWeeks: 1 },
          { title: 'Intermediate Skills', description: 'Deep dive into advanced topics', estimatedWeeks: 2 },
          { title: 'Project Implementation', description: 'Build and deploy a real-world project', estimatedWeeks: 1 }
        ]
      };
    } else if (prompt.toLowerCase().includes('schedule')) {
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

    return { text: JSON.stringify(mockData) };
  }

  async cancel(): Promise<void> {
    // llama.rn doesn't have a simple global cancel on context yet in this version,
    // but we can release if needed.
  }

  async unloadModel(): Promise<void> {
    if (this.context) {
      await this.context.release();
      this.context = null;
      console.log('[AndroidAIAdapter] Model unloaded');
    }
  }
}
