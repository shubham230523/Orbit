import { LocalModelStatus, ModelMetadata } from './types';

export interface ModelDownloadProgress {
  received: number;
  total: number;
}

export interface ModelManager {
  getStatus(): LocalModelStatus;
  getMetadata(): ModelMetadata;
  downloadModel(onProgress?: (progress: ModelDownloadProgress) => void): Promise<void>;
  verifyModel(): Promise<boolean>;
  deleteModel(): Promise<void>;
}

export const QWEN_1_5B_METADATA: ModelMetadata = {
  name: 'Qwen2.5-1.5B-Instruct',
  version: '1.0.0',
  size: 986000000, // ~986MB for Q4_K_M
  format: 'GGUF',
};
