import { authService } from '../auth-service';
import { apiClient } from '../api-client';
import * as SecureStore from 'expo-secure-store';

jest.mock('../api-client', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe('AuthService', () => {
  const mockAuthResponse = {
    token: 'test-token',
    userId: '1',
    email: 'test@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('signs up correctly and saves session', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: mockAuthResponse });
    const result = await authService.signup({ email: 'test@example.com', password: 'password' });

    expect(result).toEqual(mockAuthResponse);
    expect(apiClient.post).toHaveBeenCalledWith('/auth/signup', { email: 'test@example.com', password: 'password' });
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('orbit_auth_token', 'test-token');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('orbit_user_data', JSON.stringify({ userId: '1', email: 'test@example.com' }));
  });

  it('logs in correctly and saves session', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: mockAuthResponse });
    const result = await authService.login({ email: 'test@example.com', password: 'password' });

    expect(result).toEqual(mockAuthResponse);
    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', { email: 'test@example.com', password: 'password' });
    expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(2);
  });

  it('logs out and deletes from secure store', async () => {
    await authService.logout();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('orbit_auth_token');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('orbit_user_data');
  });

  it('gets session if token and user data exist', async () => {
    (SecureStore.getItemAsync as jest.Mock)
      .mockResolvedValueOnce('test-token')
      .mockResolvedValueOnce(JSON.stringify({ userId: '1', email: 'test@example.com' }));

    const session = await authService.getSession();
    expect(session).toEqual({
      token: 'test-token',
      user: { userId: '1', email: 'test@example.com' }
    });
  });

  it('returns null session if data missing', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    const session = await authService.getSession();
    expect(session).toBeNull();
  });
});
