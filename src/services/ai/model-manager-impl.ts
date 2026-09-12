import { LocalModelStatus, ModelMetadata } from './types';
import { ModelManager, ModelDownloadProgress, QWEN_0_5B_METADATA } from './model-manager';
import { ModelStorage } from './model-storage';
import { ModelDownloader } from './model-downloader';
import { useAIStore } from '@/store/use-ai-store';

export class ModelManagerImpl implements ModelManager {
  private status: LocalModelStatus = LocalModelStatus.NOT_INSTALLED;
  private modelUrl = 'https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf';

  constructor(
    private storage: ModelStorage,
    private downloader: ModelDownloader,
  ) {
    this.checkStatus();
  }

  getStatus(): LocalModelStatus {
    return this.status;
  }

  getMetadata(): ModelMetadata {
    return QWEN_0_5B_METADATA;
  }

  private async checkStatus() {
    const exists = await this.storage.exists();
    if (exists) {
      this.status = LocalModelStatus.INSTALLED;
    } else {
      this.status = LocalModelStatus.NOT_INSTALLED;
    }
  }

  async downloadModel(onProgress?: (progress: ModelDownloadProgress) => void): Promise<void> {
    if (this.status === LocalModelStatus.DOWNLOADING) return;

    this.status = LocalModelStatus.DOWNLOADING;
    try {
      await this.downloader.download(
        this.modelUrl,
        this.storage.getModelPath(),
        onProgress,
      );

      const isValid = await this.verifyModel();
      if (isValid) {
        this.status = LocalModelStatus.INSTALLED;
        useAIStore.getState().setIsModelDownloaded(true);
      } else {
        this.status = LocalModelStatus.FAILED;
      }
    } catch (error) {
      this.status = LocalModelStatus.FAILED;
      throw error;
    }
  }

  async verifyModel(): Promise<boolean> {
    this.status = LocalModelStatus.VERIFYING;
    // Mock checksum verification
    const isValid = true;
    this.status = isValid ? LocalModelStatus.INSTALLED : LocalModelStatus.FAILED;
    return isValid;
  }

  async deleteModel(): Promise<void> {
    await this.storage.delete();
    this.status = LocalModelStatus.NOT_INSTALLED;
    useAIStore.getState().setIsModelDownloaded(false);
  }
}
