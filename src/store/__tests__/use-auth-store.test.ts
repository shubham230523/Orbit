import { useAuthStore } from '../use-auth-store';
import { authService } from '@/services/auth-service';

jest.mock('@/services/auth-service');

describe('useAuthStore', () => {
  const mockUser = { id: '1', email: 'test@example.com' };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    useAuthStore.setState({ user: null, token: null, isLoading: true });
  });

  it('initial state is correct', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isLoading).toBe(true);
  });

  it('setSession updates state', () => {
    useAuthStore.getState().setSession(mockUser as any, 'token123');
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe('token123');
    expect(state.isLoading).toBe(false);
  });

  it('clearSession resets state', () => {
    useAuthStore.setState({ user: mockUser as any, token: 'abc', isLoading: false });
    useAuthStore.getState().clearSession();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('initSession handles existing session', async () => {
    (authService.getSession as jest.Mock).mockResolvedValueOnce({
      user: mockUser,
      token: 'token456'
    });

    await useAuthStore.getState().initSession();

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe('token456');
    expect(state.isLoading).toBe(false);
  });

  it('initSession handles failure', async () => {
    (authService.getSession as jest.Mock).mockRejectedValueOnce(new Error('Fail'));

    await useAuthStore.getState().initSession();

    const state = useAuthStore.getState();
    expect(state.isLoading).toBe(false);
  });

  it('initSession handles no session', async () => {
    (authService.getSession as jest.Mock).mockResolvedValueOnce(null);

    await useAuthStore.getState().initSession();

    const state = useAuthStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.user).toEqual({
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User'
    });
  });
});
