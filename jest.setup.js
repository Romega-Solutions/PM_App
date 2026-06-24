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

// Mock react-native
jest.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));
