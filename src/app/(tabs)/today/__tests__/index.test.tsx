import React from 'react';
import { render, screen } from '@/utils/test-utils';
import TodayScreen from '../index';
import { useQuery, useMutation } from '@tanstack/react-query';

jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  const mockIcon = (name) => {
    return (props) => React.createElement(View, { ...props, testID: name });
  };
  return {
    Calendar: mockIcon('Calendar'),
    Sparkles: mockIcon('Sparkles'),
    Plus: mockIcon('Plus'),
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

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: jest.fn(),
    useMutation: jest.fn(),
    useQueryClient: jest.fn(() => ({
      invalidateQueries: jest.fn(),
      getQueryData: jest.fn(() => []),
    })),
  };
});

jest.mock('@/services/schedule-service', () => ({
  scheduleService: {
    getSchedule: jest.fn(),
    generateSchedule: jest.fn(),
  },
}));

describe('TodayScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    (useQuery as jest.Mock).mockReturnValue({ isLoading: true });
    render(<TodayScreen />);
    expect(screen.getByTestId('LoadingState')).toBeTruthy();
  });

  it('renders error state', () => {
    (useQuery as jest.Mock).mockImplementation(({ queryKey }) => {
      if (queryKey[0] === 'schedule') {
        return { isError: true, error: { message: 'Failed' } };
      }
      return { data: [], isLoading: false };
    });
    render(<TodayScreen />);
    expect(screen.getByText('Failed')).toBeTruthy();
  });

  it('renders empty state', () => {
    (useQuery as jest.Mock).mockReturnValue({ data: [], isLoading: false });
    (useMutation as jest.Mock).mockReturnValue({ isPending: false });
    render(<TodayScreen />);
    expect(screen.getByText('Your day is clear')).toBeTruthy();
  });

  it('renders schedule data', () => {
    const mockSchedule = [{ id: '1', title: 'Work', startTime: '09:00', endTime: '10:00', taskId: 't1', type: 'TASK' }];
    const mockTasks = [{ id: 't1', title: 'Work', status: 'todo' }];

    (useQuery as jest.Mock).mockImplementation(({ queryKey }) => {
      if (queryKey[0] === 'schedule') return { data: mockSchedule, isLoading: false };
      if (queryKey[0] === 'tasks') return { data: mockTasks, isLoading: false };
      return { data: [], isLoading: false };
    });

    (useMutation as jest.Mock).mockReturnValue({ isPending: false });
    render(<TodayScreen />);
    expect(screen.getByText('Work')).toBeTruthy();
    expect(screen.getByText('9:00 AM')).toBeTruthy();
  });
});