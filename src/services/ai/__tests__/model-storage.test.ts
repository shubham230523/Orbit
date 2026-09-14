import { ExpoModelStorage } from '../model-storage';
import * as FileSystem from 'expo-file-system/legacy';

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///docs/',
  getInfoAsync: jest.fn(),
  deleteAsync: jest.fn(),
  getFreeDiskStorageAsync: jest.fn(),
}));

class TestModelStorage extends ExpoModelStorage {
  public isWebValue = false;
  protected isWeb(): boolean {
    return this.isWebValue;
  }
}

describe('ExpoModelStorage', () => {
  let storage: TestModelStorage;

  beforeEach(() => {
    storage = new TestModelStorage();
    jest.clearAllMocks();
  });

  it('returns correct mobile path when not on web', () => {
    storage.isWebValue = false;
    expect(storage.getModelPath()).toBe('file:///docs/model.gguf');
  });

  it('checks if model exists on mobile', async () => {
    storage.isWebValue = false;
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({ exists: true });
    expect(await storage.exists()).toBe(true);
  });

  it('returns web path when on web', () => {
    storage.isWebValue = true;
    expect(storage.getModelPath()).toBe('indexeddb://model.gguf');
  });

  it('returns false for exists on web', async () => {
    storage.isWebValue = true;
    expect(await storage.exists()).toBe(false);
  });

  it('gets free space on mobile', async () => {
    storage.isWebValue = false;
    (FileSystem.getFreeDiskStorageAsync as jest.Mock).mockResolvedValueOnce(500);
    expect(await storage.getFreeDiskSpace()).toBe(500);
  });

  it('returns default free space on web', async () => {
    storage.isWebValue = true;
    expect(await storage.getFreeDiskSpace()).toBe(1024 * 1024 * 1024);
  });

  it('deletes model on mobile', async () => {
    storage.isWebValue = false;
    await storage.delete();
    expect(FileSystem.deleteAsync).toHaveBeenCalled();
  });
});
