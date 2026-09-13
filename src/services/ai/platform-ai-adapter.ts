export interface InferenceRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
}

export interface InferenceResult {
  text: string;
  tokensPerSecond?: number;
}

export interface PlatformAIAdapter {
  isAvailable(): boolean;
  loadModel(path: string): Promise<void>;
  infer(request: InferenceRequest): Promise<InferenceResult>;
  cancel(): Promise<void>;
  unloadModel(): Promise<void>;
}
