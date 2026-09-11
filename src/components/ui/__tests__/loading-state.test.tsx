import React from 'react';
import { render, screen } from '@/utils/test-utils';
import { LoadingState } from '../loading-state';

describe('LoadingState', () => {
  it('renders correctly without message', () => {
    const { toJSON } = render(<LoadingState />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders message when provided', () => {
    render(<LoadingState message="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeTruthy();
  });
});
