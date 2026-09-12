import { Stack, ThemeProvider, DarkTheme, DefaultTheme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme } from 'react-native';
import '@/global.css';

import { useAuthStore } from '@/store/use-auth-store';
import { useAIStore } from '@/store/use-ai-store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AIProviderFactory } from '@/services/ai/ai-provider-factory';

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const initSession = useAuthStore((state) => state.initSession);
  const { providerType, isModelDownloaded } = useAIStore();

  useEffect(() => {
    const init = async () => {
      await initSession();

      // Initialize AI Provider
      try {
        const provider = AIProviderFactory.getProvider();
        if (provider.getType() === 'LOCAL' && isModelDownloaded) {
          await provider.initialize();
        }
      } catch (e) {
        console.warn('AI initialization failed', e);
      }

      SplashScreen.hideAsync();
    };

    init();
  }, [initSession, isModelDownloaded]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
