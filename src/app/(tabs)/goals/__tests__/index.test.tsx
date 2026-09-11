import React from 'react';
import { render, screen, fireEvent } from '@/utils/test-utils';
import GoalsScreen from '../index';
import { useQuery, useMutation } from '@tanstack/react-query';

jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  const mockIcon = (name) => {
    return (props) => React.createElement(View, { ...props, testID: name });
  };
  return {
    Plus: mockIcon('Plus'),
    Calendar: mockIcon('Calendar'),
    Sparkles: mockIcon('Sparkles'),
    Zap: mockIcon('Zap'),
    Target: mockIcon('Target'),
    CheckSquare: mockIcon('CheckSquare'),
    RotateCw: mockIcon('RotateCw'),
    BarChart2: mockIcon('BarChart2'),
    Settings: mockIcon('Settings'),
    Clock: mockIcon('Clock'),
    X: mockIcon('X'),
    AlertCircle: mockIcon('AlertCircle'),
    CheckCircle2: mockIcon('CheckCircle2'),
    Circle: mockIcon('Circle'),
  };
});

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mock-uuid'),
}));

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: jest.fn(),
    useMutation: jest.fn(),
    useQueryClient: jest.fn(() => ({
      invalidateQueries: jest.fn(),
    })),
  };
});

jest.mock('@/services/ai/ai-provider-factory');

describe('GoalsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    (useQuery as jest.Mock).mockReturnValue({ isLoading: true });
    render(<GoalsScreen />);
    expect(screen.getByTestId('LoadingState')).toBeTruthy();
  });

  it('renders goals list', () => {
    const mockGoals = [{ id: '1', title: 'Goal 1', status: 'active', priority: 'medium' }];
    (useQuery as jest.Mock).mockReturnValue({ data: mockGoals, isLoading: false });
    (useMutation as jest.Mock).mockReturnValue({ mutate: jest.fn(), isPending: false });
    render(<GoalsScreen />);
    expect(screen.getByText('Goal 1')).toBeTruthy();
  });

  it('opens modal on add goal press', () => {
    (useQuery as jest.Mock).mockReturnValue({ data: [], isLoading: false });
    (useMutation as jest.Mock).mockReturnValue({ mutate: jest.fn(), isPending: false });
    render(<GoalsScreen />);

    fireEvent.press(screen.getByText('Add Goal'));
    expect(screen.getByText('Create New Goal')).toBeTruthy();
  });
});