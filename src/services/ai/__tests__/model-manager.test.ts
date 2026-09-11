import { ModelManagerImpl } from '../model-manager-impl';
import { LocalModelStatus } from '../types';
import { ModelStorage } from '../model-storage';

describe('ModelManager', () => {
  let manager: ModelManagerImpl;
  let mockStorage: jest.Mocked<ModelStorage>;

  beforeEach(() => {
    mockStorage = {
      getModelPath: jest.fn().mockReturnValue('/path/to/model'),
      exists: jest.fn().mockResolvedValue(false),
      delete: jest.fn().mockResolvedValue(undefined),
      getFreeDiskSpace: jest.fn().mockResolvedValue(2000000000),
    };
    manager = new ModelManagerImpl(mockStorage);
  });

  it('starts with NOT_INSTALLED if file does not exist', async () => {
    // Need to wait for internal checkStatus?
    // Actually constructor calls it but it's async.
    // Let's make a method to await status check or just test after small delay.
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(manager.getStatus()).toBe(LocalModelStatus.NOT_INSTALLED);
  });

  it('moves to INSTALLED after successful download', async () => {
    await manager.downloadModel();
    expect(manager.getStatus()).toBe(LocalModelStatus.INSTALLED);
  });

  it('can delete model', async () => {
    await manager.downloadModel();
    await manager.deleteModel();
    expect(manager.getStatus()).toBe(LocalModelStatus.NOT_INSTALLED);
    expect(mockStorage.delete).toHaveBeenCalled();
  });
});
