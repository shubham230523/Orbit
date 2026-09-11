import React from 'react';
import { render, screen, fireEvent } from '@/utils/test-utils';
import { TimePicker } from '../time-picker';

describe('TimePicker', () => {
  it('renders label and value', () => {
    const date = new Date();
    date.setHours(10, 30);
    render(<TimePicker value={date} onChange={() => {}} label="Start Time" />);
    expect(screen.getByText('Start Time')).toBeTruthy();
    expect(screen.getByText(/10:30/)).toBeTruthy();
  });
});
