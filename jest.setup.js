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
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: {
      View: (props) => React.createElement(View, props),
      Text: (props) => React.createElement(View, props),
      createAnimatedComponent: (cb) => cb,
    },
    useAnimatedStyle: (cb) => cb(),
    useSharedValue: (val) => ({ value: val }),
    withSpring: (val) => val,
    withTiming: (val) => val,
    withRepeat: (val) => val,
    FadeIn: { duration: () => ({ withCallback: (cb) => cb() }) },
    useAnimatedProps: (cb) => cb(),
    interpolateColor: (val, input, output) => output[0],
    makeMutable: (val) => ({ value: val }),
  };
});

// Mock worklets
jest.mock('react-native-worklets', () => ({
  Worklets: {
    createRunInJsFn: (fn) => fn,
    createWorklet: (fn) => fn,
  },
  createSerializable: (v) => v,
}));

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

// Mock NativeModules
const { NativeModules } = require('react-native');
NativeModules.LlamaModule = {
  loadModel: jest.fn().mockResolvedValue(undefined),
  infer: jest.fn().mockResolvedValue({ text: 'Mock generated text', tokensPerSecond: 10 }),
  cancel: jest.fn().mockResolvedValue(undefined),
  unloadModel: jest.fn().mockResolvedValue(undefined),
};

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
  multiMerge: jest.fn(),
}));

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
