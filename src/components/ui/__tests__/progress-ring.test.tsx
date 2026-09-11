import React from 'react';
import { render, screen } from '@/utils/test-utils';
import { ProgressRing } from '../progress-ring';

describe('ProgressRing', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<ProgressRing progress={0.7} />);
    expect(toJSON()).toBeTruthy();
  });

  it('shows percentage text when showText is true', () => {
    render(<ProgressRing progress={0.5} showText={true} />);
    expect(screen.getByText('50%')).toBeTruthy();
  });
});
