import React from 'react';
import { render, fireEvent, screen } from '@/utils/test-utils';
import { PlannerSelectionModal } from '../planner-selection-modal';

describe('PlannerSelectionModal', () => {
  const mockTasks = [{ id: 't1', title: 'Task 1', status: 'todo' }] as any;
  const mockHabits = [{ id: 'h1', title: 'Habit 1', completed: false }] as any;
  const mockOnConfirm = jest.fn();
  const mockOnClose = jest.fn();

  it('renders and allows selecting items', () => {
    render(
      <PlannerSelectionModal
        visible={true}
        onClose={mockOnClose}
        tasks={mockTasks}
        habits={mockHabits}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText('Task 1')).toBeTruthy();
    expect(screen.getByText('Habit 1')).toBeTruthy();

    const generateBtn = screen.getByText('Generate Schedule');
    fireEvent.press(generateBtn);

    expect(mockOnConfirm).toHaveBeenCalledWith(['t1'], ['h1']);
  });

  it('allows clearing all selections', () => {
    render(
      <PlannerSelectionModal
        visible={true}
        onClose={mockOnClose}
        tasks={mockTasks}
        habits={mockHabits}
        onConfirm={mockOnConfirm}
      />
    );

    fireEvent.press(screen.getByText('Clear All'));

    // Try to press Generate Schedule - it should be disabled and thus onConfirm not called again
    fireEvent.press(screen.getByText('Generate Schedule'));
    expect(mockOnConfirm).not.toHaveBeenCalledTimes(2);
  });
});
