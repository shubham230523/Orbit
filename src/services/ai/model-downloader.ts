import * as FileSystem from 'expo-file-system/legacy';
import { ModelDownloadProgress } from './model-manager';

export interface ModelDownloader {
  download(
    url: string,
    destination: string,
    onProgress?: (progress: ModelDownloadProgress) => void,
  ): Promise<void>;
  cancel(): void;
}

export class ExpoModelDownloader implements ModelDownloader {
  private downloadResumable: FileSystem.DownloadResumable | null = null;

  async download(
    url: string,
    destination: string,
    onProgress?: (progress: ModelDownloadProgress) => void,
  ): Promise<void> {
    const callback = (data: FileSystem.DownloadProgressData) => {
      if (onProgress) {
        onProgress({
          received: data.totalBytesWritten,
          total: data.totalBytesExpectedToWrite,
        });
      }
    };

    this.downloadResumable = FileSystem.createDownloadResumable(
      url,
      `${destination}.part`,
      {},
      callback,
    );

    try {
      const result = await this.downloadResumable.downloadAsync();
      if (result) {
        // Atomic move
        await FileSystem.moveAsync({
          from: result.uri,
          to: destination,
        });
      }
    } catch (e) {
      console.error('Download failed', e);
      throw e;
    } finally {
      this.downloadResumable = null;
    }
  }

  cancel(): void {
    if (this.downloadResumable) {
      this.downloadResumable.pauseAsync(); // expo-file-system uses pause for cancel in resumable
    }
  }
}
