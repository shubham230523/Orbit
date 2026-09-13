import * as SecureStore from 'expo-secure-store';
import { v4 as uuidv4 } from 'uuid';
import { runQuery, runExecute } from '@/db/client';
import { LoginRequest, SignupRequest, AuthResponse } from '@/types/api';
import { User } from '@/types/domain';

const TOKEN_KEY = 'orbit_auth_token';
const USER_KEY = 'orbit_user_data';

export const authService = {
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const userId = uuidv4();

    await runExecute(
      'INSERT INTO users (id, email, name) VALUES (?, ?, ?)',
      [userId, data.email, data.name || null]
    );

    const authResponse: AuthResponse = {
      token: 'local-token-' + userId,
      userId,
      email: data.email,
    };

    await this.saveSession(authResponse);
    return authResponse;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const users = await runQuery<User>(
      'SELECT * FROM users WHERE email = ?',
      [data.email]
    );

    if (users.length === 0) {
      throw new Error('User not found');
    }

    const user = users[0];
    const authResponse: AuthResponse = {
      token: 'local-token-' + user.id,
      userId: user.id,
      email: user.email,
    };

    await this.saveSession(authResponse);
    return authResponse;
  },

  async logout() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  },

  async saveSession(data: AuthResponse) {
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify({ userId: data.userId, email: data.email }));
  },

  async getSession() {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    const userData = await SecureStore.getItemAsync(USER_KEY);
    if (token && userData) {
      return { token, user: JSON.parse(userData) };
    }
    return null;
  },
};
