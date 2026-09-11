import React from 'react';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';

export default function TodayScreen() {
  return (
    <Screen>
      <ThemedText type="title">Today</ThemedText>
      <ThemedText>Turn your goals into actions.</ThemedText>
    </Screen>
  );
}
