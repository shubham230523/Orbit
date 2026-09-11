import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Clock } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { format } from 'date-fns';
import { Modal } from './modal';
import { Button } from './button';

export interface TimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
}

export const TimePicker = ({ value, onChange, label }: TimePickerProps) => {
  const colors = useTheme();
  const [show, setShow] = useState(false);

  const handleTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const renderPicker = () => (
    <DateTimePicker
      value={value}
      mode="time"
      is24Hour={true}
      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      onChange={handleTimeChange}
      textColor={colors.text}
    />
  );

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}
      <Pressable
        onPress={() => setShow(true)}
        style={[
          styles.pressable,
          { backgroundColor: colors.backgroundElement, borderColor: 'transparent' },
        ]}
      >
        <Text style={[styles.value, { color: colors.text }]}>{format(value, 'p')}</Text>
        <Clock size={20} color={colors.textSecondary} />
      </Pressable>

      {show && (
        Platform.OS === 'ios' ? (
          <Modal visible={show} onClose={() => setShow(false)} title="Select Time">
            {renderPicker()}
            <Button title="Done" onPress={() => setShow(false)} style={styles.doneButton} />
          </Modal>
        ) : (
          renderPicker()
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: Spacing.one,
  },
  label: {
    ...Typography.small,
    fontWeight: '600',
  },
  pressable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.medium,
    borderWidth: 1,
  },
  value: {
    ...Typography.body,
  },
  doneButton: {
    marginTop: Spacing.two,
  },
});
