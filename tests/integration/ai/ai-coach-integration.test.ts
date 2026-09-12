import { chatService } from '@/services/ai/chat-service';
import { AIProviderFactory } from '@/services/ai/ai-provider-factory';
import { AIProviderType } from '@/services/ai/types';
import { useAIStore } from '@/store/use-ai-store';
import { mockAIProvider } from '../setup';
import { apiClient } from '@/services/api-client';

describe('AI Coach & Provider Integration', () => {
  it('should use Local provider by default and return chat response', async () => {
    const response = await chatService.sendMessage('Hello Orbit');
    expect(response).toBe('Test Chat Response');
    expect(AIProviderFactory.getProvider().getType()).toBe(AIProviderType.LOCAL);
  });

  it('should switch to Remote provider and call backend API', async () => {
    // Switch to Remote
    useAIStore.getState().setProviderType(AIProviderType.REMOTE);
    AIProviderFactory.reset();

    const mockReply = 'Remote AI Reply';
    (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: { reply: mockReply } });

    const response = await chatService.sendMessage('Help me plan');

    expect(response).toBe(mockReply);
    expect(apiClient.post).toHaveBeenCalledWith('/ai/chat', expect.objectContaining({
      message: 'Help me plan'
    }));
    expect(AIProviderFactory.getProvider().getType()).toBe(AIProviderType.REMOTE);
  });

  it('should NOT fallback to Remote if Local is selected but fails', async () => {
    // Switch back to Local
    useAIStore.getState().setProviderType(AIProviderType.LOCAL);
    AIProviderFactory.reset();

    // Mock local failure
    jest.spyOn(mockAIProvider, 'chat').mockRejectedValueOnce(new Error('Local Model Error'));

    await expect(chatService.sendMessage('Broken local')).rejects.toThrow('Local Model Error');

    // Verify no remote call was made
    expect(apiClient.post).not.toHaveBeenCalledWith('/ai/chat', expect.any(Object));
  });
});
