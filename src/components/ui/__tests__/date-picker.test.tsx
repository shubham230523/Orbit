import React from 'react';
import { render, screen, fireEvent } from '@/utils/test-utils';
import { DatePicker } from '../date-picker';

describe('DatePicker', () => {
  it('renders label and current value', () => {
    const date = new Date(2024, 0, 1);
    render(<DatePicker value={date} onChange={() => {}} label="Target Date" />);
    expect(screen.getByText('Target Date')).toBeTruthy();
    expect(screen.getByText('January 1st, 2024')).toBeTruthy();
  });

  it('opens picker on press', () => {
    const date = new Date(2024, 0, 1);
    render(<DatePicker value={date} onChange={() => {}} />);
    fireEvent.press(screen.getByText('January 1st, 2024'));
    // On Android it would show DateTimePicker directly (mocked as View)
  });
});
