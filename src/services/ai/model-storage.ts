import * as FileSystem from 'expo-file-system';
import { isWeb } from '@/platform';

export interface ModelStorage {
  getModelPath(): string;
  exists(): Promise<boolean>;
  delete(): Promise<void>;
  getFreeDiskSpace(): Promise<number>;
}

export class ExpoModelStorage implements ModelStorage {
  private fileName = 'model.gguf';

  getModelPath(): string {
    if (isWeb) return 'indexeddb://model.gguf';
    return `${FileSystem.documentDirectory}${this.fileName}`;
  }

  async exists(): Promise<boolean> {
    if (isWeb) return false;
    try {
      const info = await FileSystem.getInfoAsync(this.getModelPath());
      return info.exists;
    } catch (e) {
      return false;
    }
  }

  async delete(): Promise<void> {
    if (isWeb) return;
    await FileSystem.deleteAsync(this.getModelPath(), { idempotent: true });
  }

  async getFreeDiskSpace(): Promise<number> {
    if (isWeb) return 1024 * 1024 * 1024;
    return FileSystem.getFreeDiskStorageAsync();
  }
}
