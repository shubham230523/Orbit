import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTimer } from '@/hooks/use-timer';
import { Screen } from '@/components/ui/screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Spacing } from '@/constants/theme';
import { Play, Pause, RotateCcw } from 'lucide-react-native';

export default function FocusScreen() {
  const { formatTime, progress, isActive, start, pause, reset } = useTimer(1500);

  return (
    <Screen contentContainerStyle={styles.container}>
      <ThemedText type="title" style={styles.title}>Focus Session</ThemedText>

      <View style={styles.timerContainer}>
        <ProgressRing
          progress={progress}
          size={250}
          strokeWidth={15}
          color="#208AEF"
        />
        <View style={StyleSheet.absoluteFill}>
          <View style={styles.timeWrapper}>
            <ThemedText style={styles.timeText}>{formatTime}</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.controls}>
        {!isActive ? (
          <Button
            title="Start"
            icon={<Play size={24} color="white" />}
            onPress={start}
            style={styles.controlButton}
          />
        ) : (
          <Button
            title="Pause"
            variant="secondary"
            icon={<Pause size={24} color="black" />}
            onPress={pause}
            style={styles.controlButton}
          />
        )}
        <Button
          title="Reset"
          variant="outline"
          icon={<RotateCcw size={20} color="gray" />}
          onPress={() => reset()}
          style={styles.resetButton}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.six,
  },
  title: {
    textAlign: 'center',
  },
  timerContainer: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 48,
    fontWeight: '700',
  },
  controls: {
    flexDirection: 'row',
    gap: Spacing.four,
    alignItems: 'center',
  },
  controlButton: {
    width: 140,
    height: 60,
    borderRadius: 30,
  },
  resetButton: {
    borderRadius: 30,
    height: 50,
    width: 100,
  },
});
