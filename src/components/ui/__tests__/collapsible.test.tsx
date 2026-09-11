import React from 'react';
import { Text } from 'react-native';
import { render, screen, fireEvent } from '@/utils/test-utils';
import { Collapsible } from '../collapsible';

// Mock expo-symbols
jest.mock('expo-symbols', () => ({
  SymbolView: () => null,
}));

describe('Collapsible', () => {
  it('toggles content visibility on press', () => {
    render(
      <Collapsible title="Click Me">
        <Text>Hidden Content</Text>
      </Collapsible>
    );

    expect(screen.queryByText('Hidden Content')).toBeNull();

    fireEvent.press(screen.getByText('Click Me'));
    expect(screen.getByText('Hidden Content')).toBeTruthy();

    fireEvent.press(screen.getByText('Click Me'));
    expect(screen.queryByText('Hidden Content')).toBeNull();
  });
});
