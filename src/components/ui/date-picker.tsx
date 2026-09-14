import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { formatDate } from '@/utils/date';
import { Modal } from './modal';
import { Button } from './button';

export interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
}

export const DatePicker = ({ value, onChange, label, minimumDate, maximumDate, disabled = false }: DatePickerProps) => {
  const colors = useTheme();
  const [show, setShow] = useState(false);

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
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
      mode="date"
      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      onChange={handleDateChange}
      minimumDate={minimumDate}
      maximumDate={maximumDate}
      textColor={colors.text}
    />
  );

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}
      <Pressable
        onPress={() => !disabled && setShow(true)}
        disabled={disabled}
        style={[
          styles.pressable,
          { backgroundColor: colors.backgroundElement, borderColor: 'transparent' },
          disabled && styles.disabled,
        ]}
      >
        <Text style={[styles.value, { color: colors.text }]}>{formatDate(value)}</Text>
        <Calendar size={20} color={colors.textSecondary} />
      </Pressable>

      {show && (
        Platform.OS === 'ios' ? (
          <Modal visible={show} onClose={() => setShow(false)} title="Select Date">
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
  disabled: {
    opacity: 0.5,
  },
});
