import { authService } from '../auth-service';
import { runQuery, runExecute } from '@/db/client';
import * as SecureStore from 'expo-secure-store';
import { v4 as uuidv4 } from 'uuid';

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
  v4: jest.fn(),
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('signs up a new user', async () => {
    const userId = 'new-user-uuid';
    (uuidv4 as jest.Mock).mockReturnValue(userId);
    (runExecute as jest.Mock).mockResolvedValueOnce(undefined);

    const signupData = { email: 'test@example.com', name: 'Test User', password: 'password' };
    const response = await authService.signup(signupData);

    expect(response.userId).toBe(userId);
    expect(response.token).toBe(`local-token-${userId}`);
    expect(runExecute).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO users'),
      [userId, signupData.email, signupData.name]
    );
    expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(2);
  });

  it('logs in an existing user', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com', name: 'Test User' };
    (runQuery as jest.Mock).mockResolvedValueOnce([mockUser]);

    const loginData = { email: 'test@example.com', password: 'password' };
    const response = await authService.login(loginData);

    expect(response.userId).toBe(mockUser.id);
    expect(response.token).toBe(`local-token-${mockUser.id}`);
    expect(runQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM users WHERE email = ?'),
      [loginData.email]
    );
    expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(2);
  });

  it('throws error if user not found during login', async () => {
    (runQuery as jest.Mock).mockResolvedValueOnce([]);

    const loginData = { email: 'wrong@example.com', password: 'password' };
    await expect(authService.login(loginData)).rejects.toThrow('User not found');
  });

  it('logs out', async () => {
    await authService.logout();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(2);
  });

  it('gets session', async () => {
    (SecureStore.getItemAsync as jest.Mock)
      .mockResolvedValueOnce('token-123')
      .mockResolvedValueOnce(JSON.stringify({ userId: 'user-1', email: 'test@example.com' }));

    const session = await authService.getSession();

    expect(session?.token).toBe('token-123');
    expect(session?.user.userId).toBe('user-1');
  });
});
