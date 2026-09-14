import React from 'react';
import { render, screen, fireEvent } from '@/utils/test-utils';
import SignupScreen from '../signup';
import { useRouter } from 'expo-router';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    replace: jest.fn(),
    back: jest.fn(),
  })),
}));

describe('SignupScreen', () => {
  it('renders signup fields correctly', () => {
    render(<SignupScreen />);
    expect(screen.getByText('Create Account')).toBeTruthy();
    expect(screen.getByText('Name')).toBeTruthy();
    expect(screen.getByText('Email')).toBeTruthy();
    expect(screen.getByText('Password')).toBeTruthy();
  });

  it('navigates to today on signup press', () => {
    const mockReplace = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });

    render(<SignupScreen />);
    fireEvent.press(screen.getByText('Sign Up'));
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)/today');
  });

  it('navigates back on login link press', () => {
    const mockBack = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ back: mockBack });

    render(<SignupScreen />);
    fireEvent.press(screen.getByText('Already have an account? Login'));
    expect(mockBack).toHaveBeenCalled();
  });
});
