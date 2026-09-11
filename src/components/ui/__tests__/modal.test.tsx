import React from 'react';
import { Text } from 'react-native';
import { render, screen, fireEvent } from '@/utils/test-utils';
import { Modal } from '../modal';

describe('Modal', () => {
  it('renders title and children when visible', () => {
    render(
      <Modal visible={true} onClose={() => {}} title="Test Modal">
        <Text>Content</Text>
      </Modal>
    );
    expect(screen.getByText('Test Modal')).toBeTruthy();
    expect(screen.getByText('Content')).toBeTruthy();
  });

  it('calls onClose when X pressed', () => {
    const onClose = jest.fn();
    render(
      <Modal visible={true} onClose={onClose} title="Title">
        <Text>Content</Text>
      </Modal>
    );
    // X is mocked as View with testID='X'
    fireEvent.press(screen.getByTestId('X'));
    expect(onClose).toHaveBeenCalled();
  });
});
