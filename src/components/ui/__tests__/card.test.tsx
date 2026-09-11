import React from 'react';
import { render, screen } from '@/utils/test-utils';
import { Card } from '../card';
import { Text } from 'react-native';

describe('Card', () => {
  it('renders children correctly', () => {
    render(
      <Card>
        <Text>Card Content</Text>
      </Card>
    );
    expect(screen.getByText('Card Content')).toBeTruthy();
  });

  it('renders title and description', () => {
    render(<Card title="Goal Title" description="Goal Description" />);
    expect(screen.getByText('Goal Title')).toBeTruthy();
    expect(screen.getByText('Goal Description')).toBeTruthy();
  });
});
