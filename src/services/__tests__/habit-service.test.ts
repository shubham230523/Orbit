import { habitService } from '../habit-service';
import { apiClient } from '../api-client';

jest.mock('../api-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('HabitService', () => {
  const mockHabit = { id: '1', title: 'Meditation', frequency: 'DAILY' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gets habits', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: [mockHabit] });
    const result = await habitService.getHabits();
    expect(result).toEqual([mockHabit]);
    expect(apiClient.get).toHaveBeenCalledWith('/habits');
  });

  it('creates habit', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: mockHabit });
    const result = await habitService.createHabit({ title: 'Meditation' });
    expect(result).toEqual(mockHabit);
    expect(apiClient.post).toHaveBeenCalledWith('/habits', { title: 'Meditation' });
  });

  it('logs habit entry', async () => {
    const mockEntry = { id: 'e1', habitId: '1', date: '2024-01-01', completed: true };
    (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: mockEntry });
    const result = await habitService.logHabit('1', '2024-01-01', true);
    expect(result).toEqual(mockEntry);
    expect(apiClient.post).toHaveBeenCalledWith('/habits/1/log', { date: '2024-01-01', completed: true });
  });
});
