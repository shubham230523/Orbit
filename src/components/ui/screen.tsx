import React from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, MaxContentWidth } from '@/constants/theme';

export interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  scrollable?: boolean;
  withSafeArea?: boolean;
  centered?: boolean;
}

export const Screen = ({
  children,
  style,
  contentContainerStyle,
  scrollable = true,
  withSafeArea = true,
  centered = false,
}: ScreenProps) => {
  const colors = useTheme();

  const Container = withSafeArea ? SafeAreaView : View;
  const ContentWrapper = scrollable ? ScrollView : View;

  return (
    <Container style={[styles.container, { backgroundColor: colors.background }, style]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ContentWrapper
          style={styles.flex}
          contentContainerStyle={[
            styles.contentContainer,
            !scrollable && styles.flex,
            centered && { flexGrow: 1, justifyContent: 'center' },
            contentContainerStyle,
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.innerContent, centered && { paddingBottom: Spacing.six }]}>
            {children}
          </View>
        </ContentWrapper>
      </KeyboardAvoidingView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
  },
  innerContent: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.two,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
  },
});
