import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@/utils/test-utils';
import { BottomSheet } from '../bottom-sheet';

describe('BottomSheet', () => {
  it('renders title and children', () => {
    render(
      <BottomSheet title="Test Sheet">
        <Text>Sheet Content</Text>
      </BottomSheet>
    );
    expect(screen.getByText('Test Sheet')).toBeTruthy();
    expect(screen.getByText('Sheet Content')).toBeTruthy();
  });
});
