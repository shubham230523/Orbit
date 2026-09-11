import { RemoteAIProvider } from '../remote-ai-provider';
import { apiClient } from '../../api-client';
import { AIProviderType } from '../types';

jest.mock('../../api-client', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

describe('RemoteAIProvider', () => {
  let provider: RemoteAIProvider;

  beforeEach(() => {
    provider = new RemoteAIProvider();
    jest.clearAllMocks();
  });

  it('returns correct type and status', () => {
    expect(provider.getType()).toBe(AIProviderType.REMOTE);
    expect(provider.getStatus()).toBe('ONLINE');
  });

  it('analyzes goal via API', async () => {
    const mockResponse = { objective: 'Test' };
    (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: mockResponse });
    const result = await provider.analyzeGoal('Test Goal');
    expect(result).toEqual(mockResponse);
    expect(apiClient.post).toHaveBeenCalledWith('/ai/analyze-goal', { title: 'Test Goal' });
  });

  it('chats via API', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: { reply: 'Hello' } });
    const result = await provider.chat('Hi');
    expect(result).toBe('Hello');
    expect(apiClient.post).toHaveBeenCalledWith('/ai/chat', { message: 'Hi' });
  });

  it('researches via API', async () => {
    const mockResponse = { data: 'info' };
    (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: mockResponse });
    const result = await provider.research('topic');
    expect(result).toEqual(mockResponse);
    expect(apiClient.post).toHaveBeenCalledWith('/ai/research', { topic: 'topic' });
  });

  it('throws error for unimplemented delegated methods', async () => {
    await expect(provider.generateRoadmap('title')).rejects.toThrow('delegates high-level tasks');
    await expect(provider.generateSchedule([], 'avail')).rejects.toThrow('delegates scheduling');
  });
});
