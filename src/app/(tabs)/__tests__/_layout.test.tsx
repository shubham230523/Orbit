import React from 'react';
import { View } from 'react-native';
import { render } from '@/utils/test-utils';
import TabLayout from '../_layout';

jest.mock('expo-router', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Tabs: Object.assign(({ children }: any) => React.createElement(View, { testID: 'mock-tabs' }, children), {
      Screen: () => null,
    }),
  };
});

describe('TabLayout', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<TabLayout />);
    expect(toJSON()).toBeTruthy();
  });
});
