import React from 'react';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/text-input';
import { useRouter } from 'expo-router';
import { Spacing } from '@/constants/theme';

export default function LoginScreen() {
  const router = useRouter();

  return (
    <Screen contentContainerStyle={{ gap: Spacing.four }}>
      <ThemedText type="title">Login to Orbit</ThemedText>
      <TextInput label="Email" placeholder="email@example.com" />
      <TextInput label="Password" placeholder="••••••••" secureTextEntry />
      <Button title="Login" onPress={() => router.replace('/(tabs)/today')} />
      <Button title="Don't have an account? Sign up" variant="ghost" onPress={() => router.push('/signup')} />
    </Screen>
  );
}
