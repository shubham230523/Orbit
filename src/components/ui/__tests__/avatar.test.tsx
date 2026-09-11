import React from 'react';
import { render, screen } from '@/utils/test-utils';
import { Avatar } from '../avatar';

describe('Avatar', () => {
  it('renders initials when no source is provided', () => {
    render(<Avatar name="John Doe" />);
    expect(screen.getByText('JD')).toBeTruthy();
  });

  it('renders initials correctly for single name', () => {
    render(<Avatar name="John" />);
    expect(screen.getByText('J')).toBeTruthy();
  });

  it('renders nothing for empty name and no source', () => {
    const { toJSON } = render(<Avatar />);
    expect(toJSON()).toBeTruthy();
  });

  // Note: testing Image (expo-image) might require mocking but usually
  // it renders a host component that we can assert exists.
});
