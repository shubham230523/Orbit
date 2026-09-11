import React from 'react';
import { View } from 'react-native';
import { render, screen } from '@/utils/test-utils';
import { EmptyState } from '../empty-state';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="No Data" description="Nothing to see here" />);
    expect(screen.getByText('No Data')).toBeTruthy();
    expect(screen.getByText('Nothing to see here')).toBeTruthy();
  });

  it('renders icon when provided', () => {
    render(<EmptyState title="Title" icon={<View testID="mock-icon" />} />);
    expect(screen.getByTestId('mock-icon')).toBeTruthy();
  });
});
