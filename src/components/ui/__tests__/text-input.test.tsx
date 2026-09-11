import React from 'react';
import { fireEvent, render, screen } from '@/utils/test-utils';
import { TextInput } from '../text-input';

describe('TextInput', () => {
  it('renders correctly with label', () => {
    render(<TextInput label="Email" placeholder="Enter your email" />);
    expect(screen.getByText('Email')).toBeTruthy();
    expect(screen.getByPlaceholderText('Enter your email')).toBeTruthy();
  });

  it('calls onChangeText when text changes', () => {
    const onChangeText = jest.fn();
    render(<TextInput placeholder="Enter text" onChangeText={onChangeText} />);
    fireEvent.changeText(screen.getByPlaceholderText('Enter text'), 'hello');
    expect(onChangeText).toHaveBeenCalledWith('hello');
  });

  it('displays error message', () => {
    render(<TextInput label="Email" error="Invalid email" />);
    expect(screen.getByText('Invalid email')).toBeTruthy();
  });

  it('is disabled when editable is false', () => {
    render(<TextInput placeholder="Enter text" editable={false} />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input.props.editable).toBe(false);
  });
});
