import React from 'react';
import { render, screen, fireEvent } from '@/utils/test-utils';
import { TaskCard } from '../task-card';
import { Task } from '@/types/domain';

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  status: 'todo',
  priority: 'medium',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('TaskCard', () => {
  it('renders correctly', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText('Test Task')).toBeTruthy();
  });

  it('calls onToggleComplete when toggle pressed', () => {
    const onToggleComplete = jest.fn();
    render(<TaskCard task={mockTask} onToggleComplete={onToggleComplete} />);
    fireEvent.press(screen.getByTestId('task-toggle'));
    expect(onToggleComplete).toHaveBeenCalledTimes(1);
  });
});
