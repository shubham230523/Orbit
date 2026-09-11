import * as SecureStore from 'expo-secure-store';
import { apiClient } from './api-client';
import { LoginRequest, SignupRequest, AuthResponse } from '@/types/api';

const TOKEN_KEY = 'orbit_auth_token';
const USER_KEY = 'orbit_user_data';

export const authService = {
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/signup', data);
    await this.saveSession(response.data);
    return response.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    await this.saveSession(response.data);
    return response.data;
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
