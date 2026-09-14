import { create } from 'zustand';
import { authService } from '@/services/auth-service';
import { User } from '@/types/domain';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setSession: (user: User, token: string) => void;
  clearSession: () => void;
  initSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: { id: 'test-user-id', email: 'test@example.com', name: 'Test User' },
  token: 'test-token',
  isLoading: false,
  setSession: (user, token) => set({ user, token, isLoading: false }),
  clearSession: () => set({ user: null, token: null, isLoading: false }),
  initSession: async () => {
    try {
      const session = await authService.getSession();
      if (session) {
        set({ user: session.user, token: session.token, isLoading: false });
      } else {
        set({ user: null, token: null, isLoading: false });
      }
    } catch (e) {
      set({ user: null, token: null, isLoading: false });
    }
  },
}));
