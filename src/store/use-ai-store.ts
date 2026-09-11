import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AIProviderType } from '@/services/ai/types';

interface AIState {
  providerType: AIProviderType;
  setProviderType: (type: AIProviderType) => void;
  isModelDownloaded: boolean;
  setIsModelDownloaded: (val: boolean) => void;
}

export const useAIStore = create<AIState>()(
  persist(
    (set) => ({
      providerType: AIProviderType.LOCAL, // Default to LOCAL as per requirements
      setProviderType: (type) => set({ providerType: type }),
      isModelDownloaded: false,
      setIsModelDownloaded: (val) => set({ isModelDownloaded: val }),
    }),
    {
      name: 'orbit-ai-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
