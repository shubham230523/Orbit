import React from 'react';
import { render, screen, fireEvent } from '@/utils/test-utils';
import LoginScreen from '../login';
import { useRouter } from 'expo-router';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

describe('LoginScreen', () => {
  it('renders correctly and navigates on login', () => {
    const mockReplace = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });

    render(<LoginScreen />);
    expect(screen.getByText('Login to Orbit')).toBeTruthy();

    fireEvent.press(screen.getByText('Login'));
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)/today');
  });
});
