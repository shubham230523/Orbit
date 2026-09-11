import React from 'react';
import { render, screen, fireEvent } from '@/utils/test-utils';
import { ErrorState } from '../error-state';

describe('ErrorState', () => {
  it('renders message and default title', () => {
    render(<ErrorState message="Failed to load" />);
    expect(screen.getByText('Failed to load')).toBeTruthy();
    expect(screen.getByText('Something went wrong')).toBeTruthy();
  });

  it('calls onRetry when retry button pressed', () => {
    const onRetry = jest.fn();
    render(<ErrorState message="Error" onRetry={onRetry} />);
    fireEvent.press(screen.getByText('Retry'));
    expect(onRetry).toHaveBeenCalled();
  });
});
