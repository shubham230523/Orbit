jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  const mockIcon = (name) => {
    return (props) => React.createElement(View, { ...props, testID: name });
  };

  return {
    Check: mockIcon('Check'),
    X: mockIcon('X'),
    Calendar: mockIcon('Calendar'),
    Clock: mockIcon('Clock'),
    AlertCircle: mockIcon('AlertCircle'),
    CheckCircle2: mockIcon('CheckCircle2'),
    Circle: mockIcon('Circle'),
  };
});

// Mock reanimated
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// Mock bottom-sheet
jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: React.forwardRef(({ children }, ref) => React.createElement(View, { ref }, children)),
    BottomSheetBackdrop: () => null,
    BottomSheetView: ({ children }) => React.createElement(View, {}, children),
  };
});

// Mock datetimepicker
jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props) => React.createElement(View, props),
  };
});

// Mock hooks
jest.mock('@/hooks/use-theme', () => ({
  useTheme: () => ({
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  }),
}));
