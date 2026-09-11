import React from 'react';
import { render, screen } from '@/utils/test-utils';
import { MilestoneCard } from '../milestone-card';

describe('MilestoneCard', () => {
  it('renders milestone details correctly', () => {
    render(<MilestoneCard title="Milestone 1" status="todo" dueDate="Tomorrow" />);
    expect(screen.getByText('Milestone 1')).toBeTruthy();
    expect(screen.getByText('todo')).toBeTruthy();
    expect(screen.getByText('Due: Tomorrow')).toBeTruthy();
  });

  it('renders completed status correctly', () => {
    render(<MilestoneCard title="Done" status="completed" />);
    expect(screen.getByText('completed')).toBeTruthy();
  });
});
