import React from 'react';
import { render, screen, fireEvent } from '@/utils/test-utils';
import { Checkbox } from '../checkbox';

describe('Checkbox', () => {
  it('renders and responds to press', () => {
    const onValueChange = jest.fn();
    render(<Checkbox checked={false} onValueChange={onValueChange} label="Accept" />);

    expect(screen.getByText('Accept')).toBeTruthy();
    fireEvent.press(screen.getByText('Accept'));
    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it('renders checked state correctly', () => {
    const onValueChange = jest.fn();
    const { getByTestId } = render(<Checkbox checked={true} onValueChange={onValueChange} />);
    // Check icon is mocked as View with testID='Check'
    expect(screen.getByTestId('Check')).toBeTruthy();
  });
});
