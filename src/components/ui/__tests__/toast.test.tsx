import React from 'react';
import { render, screen, act } from '@/utils/test-utils';
import { Toast } from '../toast';

describe('Toast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders message when visible', () => {
    render(<Toast message="Success!" visible={true} onHide={() => {}} />);
    expect(screen.getByText('Success!')).toBeTruthy();
  });

  it('calls onHide after duration', () => {
    const onHide = jest.fn();
    render(<Toast message="Hide" visible={true} onHide={onHide} duration={1000} />);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(onHide).toHaveBeenCalled();
  });
});
