import { ModelManagerImpl } from '../model-manager-impl';
import { LocalModelStatus } from '../types';
import { ModelStorage } from '../model-storage';
import { ModelDownloader } from '../model-downloader';

describe('ModelManager', () => {
  let manager: ModelManagerImpl;
  let mockStorage: jest.Mocked<ModelStorage>;
  let mockDownloader: jest.Mocked<ModelDownloader>;

  beforeEach(() => {
    mockStorage = {
      getModelPath: jest.fn().mockReturnValue('/path/to/model'),
      exists: jest.fn().mockResolvedValue(false),
      delete: jest.fn().mockResolvedValue(undefined),
      getFreeDiskSpace: jest.fn().mockResolvedValue(2000000000),
    };

    mockDownloader = {
      download: jest.fn().mockResolvedValue(undefined),
      cancel: jest.fn(),
    };

    manager = new ModelManagerImpl(mockStorage, mockDownloader);
  });

  it('starts with NOT_INSTALLED if file does not exist', async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(manager.getStatus()).toBe(LocalModelStatus.NOT_INSTALLED);
  });

  it('moves to INSTALLED after successful download', async () => {
    await manager.downloadModel();
    expect(manager.getStatus()).toBe(LocalModelStatus.INSTALLED);
    expect(mockDownloader.download).toHaveBeenCalledWith(
      expect.any(String),
      '/path/to/model',
      undefined,
    );
  });

  it('can delete model', async () => {
    // Manually set status to simulate installed state for simple delete test
    // or just download then delete
    await manager.downloadModel();
    await manager.deleteModel();
    expect(manager.getStatus()).toBe(LocalModelStatus.NOT_INSTALLED);
    expect(mockStorage.delete).toHaveBeenCalled();
  });

  it('moves to FAILED if download fails', async () => {
    mockDownloader.download.mockRejectedValueOnce(new Error('Network error'));
    await expect(manager.downloadModel()).rejects.toThrow('Network error');
    expect(manager.getStatus()).toBe(LocalModelStatus.FAILED);
  });
});
