import React from 'react';
import { render } from '@/utils/test-utils';
import { Skeleton } from '../skeleton';

describe('Skeleton', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<Skeleton />);
    expect(toJSON()).toBeTruthy();
  });
});
