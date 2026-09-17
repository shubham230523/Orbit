import { Stack, ThemeProvider, DarkTheme, DefaultTheme } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme } from 'react-native';
import '@/global.css';
import { Colors } from '@/constants/theme';

import { useAuthStore } from '@/store/use-auth-store';
import { useAIStore } from '@/store/use-ai-store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AIProviderFactory } from '@/services/ai/ai-provider-factory';
import { getDb } from '@/db/client';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const initSession = useAuthStore((state) => state.initSession);

  useEffect(() => {
    // Global Error Handling for console/terminal visibility
    // @ts-ignore
    const originalHandler = global.ErrorUtils?.getGlobalHandler();
    // @ts-ignore
    global.ErrorUtils?.setGlobalHandler((error, isFatal) => {
      console.error('GLOBAL ERROR:', error, 'Fatal:', isFatal);
      if (originalHandler) originalHandler(error, isFatal);
    });

    // Handle Unhandled Promise Rejections
    // @ts-ignore
    const promiseRejectionHandler = (id, error) => {
      console.error('UNHANDLED PROMISE REJECTION:', error, 'ID:', id);
    };
    // @ts-ignore
    global.onunhandledrejection = promiseRejectionHandler;

    const init = async () => {
      console.log('App initialization started');
      try {
        console.log('Initializing database...');
        await getDb();
        console.log('Database ready');

        console.log('Initializing session...');
        await initSession();
        console.log('Session ready');

        const manager = AIProviderFactory.getModelManager();
        const provider = AIProviderFactory.getProvider();

        if (provider.getType() === 'LOCAL' && useAIStore.getState().isModelDownloaded) {
          console.log('Initializing AI...');
          await provider.initialize();
          console.log('AI ready');
        }
      } catch (e: any) {
        console.error('CRITICAL: Initialization error:', e);
      } finally {
        console.log('Hiding splash screen');
        await SplashScreen.hideAsync();
      }
    };

    init();
  }, [initSession]);

  const isDark = colorScheme === 'dark';
  console.log('Rendering RootLayout, isDark:', isDark);

  const theme = isDark ? DarkTheme : DefaultTheme;

  const customTheme = {
    ...theme,
    colors: {
      ...theme.colors,
      primary: '#208AEF',
      background: Colors[isDark ? 'dark' : 'light'].background,
      card: Colors[isDark ? 'dark' : 'light'].background,
      text: Colors[isDark ? 'dark' : 'light'].text,
      border: Colors[isDark ? 'dark' : 'light'].backgroundSelected,
      notification: '#208AEF',
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={customTheme}>
            <StatusBar style={isDark ? 'light' : 'dark'} translucent={false} backgroundColor={customTheme.colors.background} />
            <Stack screenOptions={{ headerShown: false }} />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
