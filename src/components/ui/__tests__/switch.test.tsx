import React from 'react';
import { render, fireEvent, screen } from '@/utils/test-utils';
import { Switch } from '../switch';

describe('Switch', () => {
  it('triggers onValueChange on press', () => {
    const onValueChange = jest.fn();
    render(<Switch value={false} onValueChange={onValueChange} />);

    fireEvent.press(screen.getByTestId('switch-root'));
    expect(onValueChange).toHaveBeenCalledWith(true);
  });
});
