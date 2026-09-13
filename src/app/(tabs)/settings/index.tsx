import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useAIStore } from '@/store/use-ai-store';
import { AIProviderType } from '@/services/ai/types';
import { Screen } from '@/components/ui/screen';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Spacing } from '@/constants/theme';
import { Cpu, Cloud, Download, Trash2, CheckCircle } from 'lucide-react-native';
import { AIProviderFactory } from '@/services/ai/ai-provider-factory';
import { ProgressBar } from '@/components/ui/progress-bar';

export default function SettingsScreen() {
  const { providerType, setProviderType, isModelDownloaded, setIsModelDownloaded } = useAIStore();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const toggleProvider = () => {
    setProviderType(
      providerType === AIProviderType.LOCAL ? AIProviderType.REMOTE : AIProviderType.LOCAL
    );
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    try {
      const manager = AIProviderFactory.getModelManager();
      await manager.downloadModel((progress) => {
        const percent = Math.round((progress.received / progress.total) * 100);
        setDownloadProgress(percent);
      });
    } catch (error) {
      console.error('Download failed', error);
      alert('Download failed. Please check your internet connection.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteModel = async () => {
    try {
      const manager = AIProviderFactory.getModelManager();
      await manager.deleteModel();
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <ThemedText type="title">Settings</ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle">AI & Inference</ThemedText>

        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconLabel}>
              {providerType === AIProviderType.LOCAL ? (
                <Cpu size={20} color="#208AEF" />
              ) : (
                <Cloud size={20} color="#208AEF" />
              )}
              <ThemedText type="bodyBold">
                {providerType === AIProviderType.LOCAL ? 'Local Inference' : 'Remote Inference'}
              </ThemedText>
            </View>
            <Switch
              value={providerType === AIProviderType.REMOTE}
              onValueChange={toggleProvider}
            />
          </View>
          <ThemedText type="small" style={styles.description}>
            {providerType === AIProviderType.LOCAL
              ? 'Using on-device model. Privacy focused and works offline.'
              : 'Using cloud API. Requires internet, may be faster/more accurate.'}
          </ThemedText>
        </Card>

        <ThemedText type="subtitle" style={styles.subSectionTitle}>Local Model</ThemedText>
        <Card style={styles.card}>
          <View style={styles.modelRow}>
            <View>
              <ThemedText type="bodyBold">Qwen2.5-1.5B-Instruct</ThemedText>
              <ThemedText type="small">Size: ~986MB • Format: GGUF</ThemedText>
            </View>
            {isModelDownloaded ? (
              <CheckCircle size={24} color="green" />
            ) : (
              <Button
                title={isDownloading ? 'Downloading...' : 'Download'}
                size="small"
                variant="outline"
                onPress={handleDownload}
                loading={isDownloading}
                disabled={isDownloading}
              />
            )}
          </View>

          {isDownloading && (
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <ThemedText type="smallBold">Downloading Model</ThemedText>
                <ThemedText type="small">{downloadProgress}%</ThemedText>
              </View>
              <ProgressBar progress={downloadProgress / 100} color="#208AEF" />
            </View>
          )}

          {isModelDownloaded && (
            <Button
              title="Delete Model"
              variant="ghost"
              size="small"
              icon={<Trash2 size={16} color="red" />}
              onPress={handleDeleteModel}
              style={styles.deleteButton}
              textStyle={{ color: 'red' }}
            />
          )}
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.four,
  },
  section: {
    gap: Spacing.three,
  },
  subSectionTitle: {
    marginTop: Spacing.two,
    fontSize: 14,
    opacity: 0.6,
    textTransform: 'uppercase',
  },
  card: {
    padding: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  iconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  description: {
    opacity: 0.7,
  },
  modelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteButton: {
    marginTop: Spacing.three,
    alignSelf: 'flex-start',
    paddingHorizontal: 0,
  },
  progressContainer: {
    marginTop: Spacing.three,
    gap: Spacing.one,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
