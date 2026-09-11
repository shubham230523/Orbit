import React from 'react';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/text-input';
import { useRouter } from 'expo-router';
import { Spacing } from '@/constants/theme';

export default function SignupScreen() {
  const router = useRouter();

  return (
    <Screen contentContainerStyle={{ gap: Spacing.four }}>
      <ThemedText type="title">Create Orbit Account</ThemedText>
      <TextInput label="Name" placeholder="John Doe" />
      <TextInput label="Email" placeholder="email@example.com" />
      <TextInput label="Password" placeholder="••••••••" secureTextEntry />
      <Button title="Sign Up" onPress={() => router.replace('/(tabs)/today')} />
      <Button title="Already have an account? Login" variant="ghost" onPress={() => router.push('/login')} />
    </Screen>
  );
}
