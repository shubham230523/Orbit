import React from 'react';
import { render } from '@/utils/test-utils';
import AppTabs from '../app-tabs';

jest.mock('expo-router/unstable-native-tabs', () => {
  const React = require('react');
  const { View } = require('react-native');
  const NativeTabs = ({ children }: { children: React.ReactNode }) => React.createElement(View, {}, children);
  NativeTabs.Trigger = ({ children }: { children: React.ReactNode }) => React.createElement(View, {}, children);
  NativeTabs.Trigger.Label = ({ children }: { children: React.ReactNode }) => React.createElement(View, {}, children);
  NativeTabs.Trigger.Icon = () => React.createElement(View, {});
  return { NativeTabs };
});

describe('AppTabs', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<AppTabs />);
    expect(toJSON()).toBeDefined();
  });
});
