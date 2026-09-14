import { ExpoModelDownloader } from '../model-downloader';
import * as FileSystem from 'expo-file-system/legacy';

jest.mock('expo-file-system/legacy', () => ({
  createDownloadResumable: jest.fn(),
  moveAsync: jest.fn(),
}));

describe('ExpoModelDownloader', () => {
  let downloader: ExpoModelDownloader;
  let mockResumable: any;

  beforeEach(() => {
    downloader = new ExpoModelDownloader();
    mockResumable = {
      downloadAsync: jest.fn().mockResolvedValue({ uri: 'part-file-uri' }),
      pauseAsync: jest.fn(),
    };
    (FileSystem.createDownloadResumable as jest.Mock).mockReturnValue(mockResumable);
    jest.clearAllMocks();
  });

  it('downloads and moves file on success', async () => {
    await downloader.download('http://url', '/dest/path');

    expect(FileSystem.createDownloadResumable).toHaveBeenCalledWith(
      'http://url',
      '/dest/path.part',
      {},
      expect.any(Function)
    );
    expect(mockResumable.downloadAsync).toHaveBeenCalled();
    expect(FileSystem.moveAsync).toHaveBeenCalledWith({
      from: 'part-file-uri',
      to: '/dest/path'
    });
  });

  it('calls onProgress when data is written', async () => {
    const onProgress = jest.fn();
    // Simulate the callback trigger
    (FileSystem.createDownloadResumable as jest.Mock).mockImplementation((u, d, o, cb) => {
      cb({ totalBytesWritten: 50, totalBytesExpectedToWrite: 100 });
      return mockResumable;
    });

    await downloader.download('http://url', '/dest/path', onProgress);
    expect(onProgress).toHaveBeenCalledWith({ received: 50, total: 100 });
  });

  it('handles download failure', async () => {
    mockResumable.downloadAsync.mockRejectedValueOnce(new Error('Fail'));
    await expect(downloader.download('http://url', '/dest/path')).rejects.toThrow('Fail');
  });

  it('can cancel download', async () => {
    // Start download but don't await yet
    const promise = downloader.download('http://url', '/dest/path');
    downloader.cancel();
    expect(mockResumable.pauseAsync).toHaveBeenCalled();
    await promise;
  });
});
