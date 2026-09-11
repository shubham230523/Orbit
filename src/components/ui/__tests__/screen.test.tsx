import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@/utils/test-utils';
import { Screen } from '../screen';

describe('Screen', () => {
  it('renders children correctly', () => {
    render(
      <Screen>
        <Text>Screen Content</Text>
      </Screen>
    );
    expect(screen.getByText('Screen Content')).toBeTruthy();
  });
});
