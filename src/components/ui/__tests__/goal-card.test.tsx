import React from 'react';
import { render, screen, fireEvent } from '@/utils/test-utils';
import { GoalCard } from '../goal-card';
import { Goal } from '@/types/domain';

const mockGoal: Goal = {
  id: '1',
  userId: 'u1',
  title: 'Test Goal',
  description: 'Test Description',
  status: 'active',
  priority: 'high',
  createdAt: '',
  updatedAt: '',
  targetDate: '2024-12-31'
};

describe('GoalCard', () => {
  it('renders goal details correctly', () => {
    render(<GoalCard goal={mockGoal} progress={0.5} />);
    expect(screen.getByText('Test Goal')).toBeTruthy();
    expect(screen.getByText('Test Description')).toBeTruthy();
    expect(screen.getByText('50%')).toBeTruthy();
    expect(screen.getByText('Target: 2024-12-31')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    render(<GoalCard goal={mockGoal} progress={0.5} onPress={onPress} />);
    fireEvent.press(screen.getByText('Test Goal'));
    expect(onPress).toHaveBeenCalled();
  });

  it('handles missing description and date', () => {
    const minimalGoal = { ...mockGoal, description: undefined, targetDate: undefined };
    render(<GoalCard goal={minimalGoal} progress={0} />);
    expect(screen.queryByText('Test Description')).toBeNull();
    expect(screen.queryByText('Target:')).toBeNull();
  });
});
