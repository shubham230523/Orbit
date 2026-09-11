import React from 'react';
import { render, screen } from '@/utils/test-utils';
import { Badge } from '../badge';
import { Avatar } from '../avatar';
import { ProgressBar } from '../progress-bar';
import { Checkbox } from '../checkbox';
import { Switch } from '../switch';
import { EmptyState } from '../empty-state';
import { LoadingState } from '../loading-state';
import { ErrorState } from '../error-state';
import { Skeleton } from '../skeleton';

describe('Design System Components', () => {
  it('renders Badge correctly', () => {
    render(<Badge label="Test Badge" />);
    expect(screen.getByText('Test Badge')).toBeTruthy();
  });

  it('renders Avatar with initials', () => {
    render(<Avatar name="John Doe" />);
    expect(screen.getByText('JD')).toBeTruthy();
  });

  it('renders EmptyState correctly', () => {
    render(<EmptyState title="No data" description="Try again later" />);
    expect(screen.getByText('No data')).toBeTruthy();
    expect(screen.getByText('Try again later')).toBeTruthy();
  });

  it('renders LoadingState correctly', () => {
    render(<LoadingState message="Loading..." />);
    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  it('renders ErrorState with retry button', () => {
    const onRetry = jest.fn();
    render(<ErrorState message="Error message" onRetry={onRetry} />);
    expect(screen.getByText('Error message')).toBeTruthy();
    expect(screen.getByText('Retry')).toBeTruthy();
  });
});
