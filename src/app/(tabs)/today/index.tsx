import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleService } from '@/services/schedule-service';
import { Screen } from '@/components/ui/screen';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Spacing } from '@/constants/theme';
import { Calendar, Sparkles } from 'lucide-react-native';

export default function TodayScreen() {
  const queryClient = useQueryClient();

  const { data: schedule, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['schedule'],
    queryFn: scheduleService.getSchedule,
  });

  const generateMutation = useMutation({
    mutationFn: scheduleService.generateSchedule,
    onSuccess: (data) => {
      console.log('[TodayScreen] generateSchedule SUCCESS, items:', data.length);
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
    onError: (err) => {
      console.error('[TodayScreen] generateSchedule ERROR:', err);
    }
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={error.message} onRetry={refetch} />;

  return (
    <Screen scrollable={false}>
      <View style={styles.header}>
        <Button
          title="Plan Day"
          variant="outline"
          size="small"
          icon={<Sparkles size={16} color="gold" />}
          onPress={() => generateMutation.mutate()}
          loading={generateMutation.isPending}
        />
      </View>

      <FlatList
        data={schedule}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.blockCard}>
            <View style={styles.blockContent}>
              <View style={styles.timeColumn}>
                <ThemedText type="small">{item.startTime}</ThemedText>
                <ThemedText type="small" style={{ opacity: 0.5 }}>{item.endTime}</ThemedText>
              </View>
              <View style={styles.titleColumn}>
                <ThemedText type="bodyBold">{item.title}</ThemedText>
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <EmptyState
            title="Your day is clear"
            description="No tasks scheduled for today."
            icon={<Calendar size={48} color="gray" />}
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.four,
    alignItems: 'flex-end',
  },
  listContent: {
    paddingBottom: 40,
    paddingHorizontal: Spacing.two,
  },
  blockCard: {
    marginBottom: Spacing.two,
    padding: Spacing.two,
  },
  blockContent: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  timeColumn: {
    width: 60,
    alignItems: 'flex-end',
  },
  titleColumn: {
    flex: 1,
    justifyContent: 'center',
  },
});
