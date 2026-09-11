export interface InferenceResult {
  text: string;
  tokensPerSecond: number;
}

export interface PlatformAIAdapter {
  loadModel(path: string): Promise<void>;
  infer(prompt: string): Promise<InferenceResult>;
  cancel(): Promise<void>;
  unloadModel(): Promise<void>;
}
