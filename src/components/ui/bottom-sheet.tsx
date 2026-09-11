import React, { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import GBottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetProps as GBottomSheetProps,
} from '@gorhom/bottom-sheet';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing, Typography } from '@/constants/theme';

export interface BottomSheetProps extends Partial<GBottomSheetProps> {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  title?: string;
}

export const BottomSheet = React.forwardRef<GBottomSheet, BottomSheetProps>(
  ({ children, snapPoints, title, ...props }, ref) => {
    const colors = useTheme();
    const defaultSnapPoints = useMemo(() => ['25%', '50%', '90%'], []);

    const renderBackdrop = useCallback(
      (backdropProps: any) => (
        <BottomSheetBackdrop
          {...backdropProps}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
        />
      ),
      [],
    );

    return (
      <GBottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints || defaultSnapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: colors.textSecondary }}
        backgroundStyle={{ backgroundColor: colors.background }}
        {...props}
      >
        <BottomSheetView style={styles.content}>
          {title && (
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          )}
          {children}
        </BottomSheetView>
      </GBottomSheet>
    );
  },
);

const styles = StyleSheet.create({
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  title: {
    ...Typography.h3,
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
});
