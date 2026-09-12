import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/text-input';
import { useRouter } from 'expo-router';
import { Spacing } from '@/constants/theme';

export default function LoginScreen() {
  const router = useRouter();

  return (
    <Screen centered contentContainerStyle={{ gap: Spacing.six }}>
      <View style={{ gap: Spacing.two, alignItems: 'center' }}>
        <ThemedText type="title">Login to Orbit</ThemedText>
        <ThemedText type="subtitle" style={{ textAlign: 'center', opacity: 0.7 }}>
          Your personal productivity workspace
        </ThemedText>
      </View>

      <View style={{ width: '100%', gap: Spacing.four }}>
        <View style={{ gap: Spacing.three }}>
          <TextInput
            label="Email"
            placeholder="email@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput label="Password" placeholder="••••••••" secureTextEntry />
        </View>

        <View style={{ gap: Spacing.two }}>
          <Button title="Login" onPress={() => router.replace('/(tabs)/today')} />
          <Button
            title="Don't have an account? Sign up"
            variant="ghost"
            onPress={() => router.push('/signup')}
          />
        </View>
      </View>
    </Screen>
  );
}
