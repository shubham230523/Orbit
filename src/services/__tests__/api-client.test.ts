import { apiClient } from '../api-client';
import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
}));

describe('apiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds Authorization header if token exists', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('mock-token');

    // Access the interceptor directly if possible, or trigger it via a request
    // Since we can't easily trigger a real request without a mock adapter,
    // let's test the interceptor function itself if we can find it.
    // apiClient.interceptors.request is an object with 'handlers'

    const handlers = (apiClient.interceptors.request as any).handlers;
    const requestInterceptor = handlers[0].fulfilled;

    const config = { headers: {} };
    const result = await requestInterceptor(config);

    expect(result.headers.Authorization).toBe('Bearer mock-token');
  });

  it('does not add Authorization header if token missing', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

    const handlers = (apiClient.interceptors.request as any).handlers;
    const requestInterceptor = handlers[0].fulfilled;

    const config = { headers: {} };
    const result = await requestInterceptor(config);

    expect(result.headers.Authorization).toBeUndefined();
  });

  it('response interceptor rejects on error', async () => {
    const handlers = (apiClient.interceptors.response as any).handlers;
    const errorInterceptor = handlers[0].rejected;

    const error = new Error('Network Error');
    await expect(errorInterceptor(error)).rejects.toThrow('Network Error');
  });
});
