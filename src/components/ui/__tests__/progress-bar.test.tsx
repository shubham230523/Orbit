import React from 'react';
import { render } from '@/utils/test-utils';
import { ProgressBar } from '../progress-bar';

describe('ProgressBar', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<ProgressBar progress={0.5} />);
    expect(toJSON()).toBeTruthy();
  });
});
