import React from 'react';
import { render, screen } from '@/utils/test-utils';
import { Badge } from '../badge';

describe('Badge', () => {
  it('renders label correctly', () => {
    render(<Badge label="Test" />);
    expect(screen.getByText('Test')).toBeTruthy();
  });

  it('renders different variants', () => {
    const { rerender } = render(<Badge label="Success" variant="success" />);
    expect(screen.getByText('Success')).toBeTruthy();

    rerender(<Badge label="Error" variant="error" />);
    expect(screen.getByText('Error')).toBeTruthy();

    rerender(<Badge label="Warning" variant="warning" />);
    expect(screen.getByText('Warning')).toBeTruthy();

    rerender(<Badge label="Secondary" variant="secondary" />);
    expect(screen.getByText('Secondary')).toBeTruthy();
  });
});
