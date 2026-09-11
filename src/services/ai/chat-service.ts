import { AIProviderFactory } from './ai-provider-factory';

export const chatService = {
  async sendMessage(message: string): Promise<string> {
    const provider = AIProviderFactory.getProvider();
    return provider.chat(message);
  },
};
