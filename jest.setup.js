// Define the React Native `__DEV__` global (Metro/Babel provide it in-app, but
// jest's node env does not). API code guards diagnostics behind `if (__DEV__)`.
global.__DEV__ = false;

// Mock expo-file-system/legacy — it ships untranspiled .ts that babel-jest does
// not transform (node_modules is ignored). Stub the surface the app uses.
jest.mock("expo-file-system/legacy", () => ({
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
  getInfoAsync: jest.fn(),
}));

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Stack: {
    Screen: "Screen",
  },
}));

// Mock react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }) => children,
}));

// Mock expo-linear-gradient
jest.mock("expo-linear-gradient", () => ({
  LinearGradient: "LinearGradient",
}));
