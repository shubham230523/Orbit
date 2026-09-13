import { authService } from '../auth-service';
import { runQuery, runExecute } from '@/db/client';
import * as SecureStore from 'expo-secure-store';

jest.mock('@/db/client', () => ({
  runQuery: jest.fn(),
  runExecute: jest.fn(),
}));

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid'),
}));

describe('AuthService', () => {
  const mockAuthResponse = {
    token: 'local-token-test-uuid',
    userId: 'test-uuid',
    email: 'test@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('signs up correctly and saves session', async () => {
    (runExecute as jest.Mock).mockResolvedValueOnce(undefined);

    const result = await authService.signup({ email: 'test@example.com', password: 'password', name: 'Test User' });

    expect(result).toEqual(mockAuthResponse);
    expect(runExecute).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO users'),
      ['test-uuid', 'test@example.com', 'Test User']
    );
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('orbit_auth_token', 'local-token-test-uuid');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('orbit_user_data', JSON.stringify({ userId: 'test-uuid', email: 'test@example.com' }));
  });

  it('logs in correctly and saves session', async () => {
    (runQuery as jest.Mock).mockResolvedValueOnce([{ id: 'test-uuid', email: 'test@example.com' }]);

    const result = await authService.login({ email: 'test@example.com', password: 'password' });

    expect(result).toEqual(mockAuthResponse);
    expect(runQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM users'),
      ['test@example.com']
    );
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
