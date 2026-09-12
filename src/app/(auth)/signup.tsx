import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/text-input';
import { useRouter } from 'expo-router';
import { Spacing } from '@/constants/theme';

export default function SignupScreen() {
  const router = useRouter();

  return (
    <Screen centered contentContainerStyle={{ gap: Spacing.six }}>
      <View style={{ gap: Spacing.two, alignItems: 'center' }}>
        <ThemedText type="title">Create Account</ThemedText>
        <ThemedText type="subtitle" style={{ textAlign: 'center', opacity: 0.7 }}>
          Join Orbit and take control of your time
        </ThemedText>
      </View>

      <View style={{ width: '100%', gap: Spacing.four }}>
        <View style={{ gap: Spacing.three }}>
          <TextInput label="Name" placeholder="John Doe" />
          <TextInput
            label="Email"
            placeholder="email@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput label="Password" placeholder="••••••••" secureTextEntry />
        </View>

        <View style={{ gap: Spacing.two }}>
          <Button title="Sign Up" onPress={() => router.replace('/(tabs)/today')} />
          <Button
            title="Already have an account? Login"
            variant="ghost"
            onPress={() => router.back()}
          />
        </View>
      </View>
    </Screen>
  );
}
