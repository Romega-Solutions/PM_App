import React from "react";
// @ts-expect-error This repository does not install @types/react-test-renderer.
import TestRenderer, { act } from "react-test-renderer";
import LocationScreen from "../LocationScreen";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let mockCurrentLocationEnabled = false;
let mockHookDemoMode = false;
let mockScreenDemoMode = false;
let mockUserType = "filipina";

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockSaveLocation = jest.fn();
const mockPermission = jest.fn();
const mockPosition = jest.fn();
const mockReverseGeocode = jest.fn();
const mockAlert = jest.fn();

jest.mock("../../config/locationFeatures", () => ({
  get ACCOUNT_SETUP_CURRENT_LOCATION_ENABLED() {
    return mockCurrentLocationEnabled;
  },
}));

jest.mock("expo-location", () => ({
  Accuracy: { Balanced: 3 },
  requestForegroundPermissionsAsync: (...args: unknown[]) =>
    mockPermission(...args),
  getCurrentPositionAsync: (...args: unknown[]) => mockPosition(...args),
  reverseGeocodeAsync: (...args: unknown[]) => mockReverseGeocode(...args),
}));

jest.mock("@/src/features/auth/demoMode", () => ({
  useIsDemoSession: () => mockHookDemoMode,
}));

jest.mock("@/src/stores/authStore", () => ({
  useAuthStore: (selector: (state: { isDemoMode: boolean }) => unknown) =>
    selector({ isDemoMode: mockScreenDemoMode }),
}));

jest.mock("../../api/accountApi", () => ({
  accountApi: { saveLocation: (...args: unknown[]) => mockSaveLocation(...args) },
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useLocalSearchParams: () => ({ userType: mockUserType }),
}));

jest.mock("react-native", () => {
  const ReactModule = jest.requireActual<typeof React>("react");
  const host = (name: string) =>
    ({ children, ...props }: { children?: React.ReactNode }) =>
      ReactModule.createElement(name, props, children);
  return {
    Alert: { alert: (...args: unknown[]) => mockAlert(...args) },
    KeyboardAvoidingView: host("KeyboardAvoidingView"),
    Platform: { OS: "ios" },
    ScrollView: host("ScrollView"),
    StatusBar: host("StatusBar"),
    StyleSheet: { absoluteFill: {}, create: (styles: unknown) => styles },
    Text: host("Text"),
    View: host("View"),
  };
});

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("expo-linear-gradient", () => ({ LinearGradient: "LinearGradient" }));

jest.mock("lucide-react-native", () => {
  const ReactModule = jest.requireActual<typeof React>("react");
  return {
    AlertCircle: () => ReactModule.createElement("Icon"),
    MapPin: () => ReactModule.createElement("Icon"),
    Search: () => ReactModule.createElement("Icon"),
  };
});

jest.mock("@/src/theme", () => {
  const theme = {
    semanticColors: {
      background: "#000",
      warning: "#fc0",
      primary: "#f00",
    },
    colors: { dalisay: { 900: "#111" }, neutral: { white: "#fff" } },
    spacing: { lg: 24, xl: 32, md: 16 },
    fontFamilies: { header: { semiBold: "System" } },
  };
  return {
    useAppTheme: () => theme,
    makeStyles: (factory: (value: typeof theme) => unknown) =>
      () => factory(theme),
  };
});

jest.mock("@/src/components/account/AccountProgress", () => "AccountProgress");

jest.mock("@/src/components/forms/CustomTextInput", () => {
  const ReactModule = jest.requireActual<typeof React>("react");
  return ({ label, ...props }: { label: string; [key: string]: unknown }) =>
    ReactModule.createElement("TextInput", {
      accessibilityLabel: label,
      ...props,
    });
});

jest.mock("@/src/components/location/LocationItem", () => {
  const ReactModule = jest.requireActual<typeof React>("react");
  return ({ label, onPress }: { label: string; onPress?: () => void }) =>
    ReactModule.createElement("Button", {
      accessibilityLabel: label,
      onPress,
      testID: `location-${label}`,
      title: label,
    });
});

jest.mock("@/src/components/location/LocationsList", () => {
  const ReactModule = jest.requireActual<typeof React>("react");
  return ({ locations, onSelect }: {
    locations: string[];
    onSelect: (location: string) => void;
  }) =>
    ReactModule.createElement(
      "View",
      null,
      ...locations.map((location) =>
        ReactModule.createElement("Button", {
          key: location,
          accessibilityLabel: location,
          onPress: () => onSelect(location),
          testID: `curated-${location}`,
          title: location,
        }),
      ),
    );
});

jest.mock("@/src/components/ui/PrimaryButton", () => {
  const ReactModule = jest.requireActual<typeof React>("react");
  return ({ title, ...props }: { title: string; [key: string]: unknown }) =>
    ReactModule.createElement("Button", { title, testID: "continue", ...props });
});

function renderScreen() {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<LocationScreen />);
  });
  return tree;
}

function visibleText(tree: TestRenderer.ReactTestRenderer) {
  return tree.root
    .findAllByType("Text")
    .map((element: any) => String(element.props.children ?? ""));
}

describe("LocationScreen", () => {
  beforeEach(() => {
    mockCurrentLocationEnabled = false;
    mockHookDemoMode = false;
    mockScreenDemoMode = false;
    mockUserType = "filipina";
    jest.clearAllMocks();
    mockSaveLocation.mockResolvedValue(undefined);
    mockPermission.mockResolvedValue({ status: "granted", canAskAgain: true });
    mockPosition.mockResolvedValue({
      coords: { latitude: 14.6, longitude: 120.98 },
    });
    mockReverseGeocode.mockResolvedValue([
      { city: "Manila", country: "Philippines" },
    ]);
  });

  it.each([
    { demo: false, userType: "filipina" },
    { demo: false, userType: "foreigner" },
    { demo: true, userType: "filipina" },
    { demo: true, userType: "foreigner" },
  ])(
    "shows only city selection and blocks empty Continue ($userType, demo=$demo)",
    ({ demo, userType }) => {
      mockHookDemoMode = demo;
      mockScreenDemoMode = demo;
      mockUserType = userType;
      const tree = renderScreen();
      const text = visibleText(tree).join(" ");

      expect(tree.root.findAllByProps({ testID: "location-Use Current Location" })).toHaveLength(0);
      expect(text).not.toContain("or search for a city");
      expect(text.toLowerCase()).not.toContain("permission");
      expect(text.toLowerCase()).not.toContain("gps");
      expect(text).toContain("Choose your city to continue.");
      expect(text).toContain("Search for your city below. If it is not listed, you can enter it manually.");
      expect(tree.root.findByProps({ testID: "continue" }).props.disabled).toBe(true);
      expect(mockPermission).not.toHaveBeenCalled();
      expect(mockPosition).not.toHaveBeenCalled();
    },
  );

  it("saves curated manual city on Continue and keeps userType in navigation", async () => {
    const tree = renderScreen();
    await act(async () => {
      tree.root.findByType("TextInput").props.onChangeText("Manila");
    });
    await act(async () => {
      tree.root.findByProps({ testID: "curated-Manila, Philippines" }).props.onPress();
    });
    await act(async () => {
      await tree.root.findByProps({ testID: "continue" }).props.onPress();
    });

    expect(mockSaveLocation).toHaveBeenCalledWith(
      expect.objectContaining({
        locationType: "manual",
        locationName: "Manila, Philippines",
        coordinates: { lat: 14.5995, lng: 120.9842 },
      }),
    );
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(auth)/account-setup/preferences",
      params: { userType: "filipina" },
    });
    expect(mockPermission).not.toHaveBeenCalled();
  });

  it("saves an unlisted city without coordinates and says it is selected, not saved", async () => {
    const tree = renderScreen();
    await act(async () => {
      tree.root.findByType("TextInput").props.onChangeText("Paris");
    });
    await act(async () => {
      tree.root.findByProps({ testID: 'location-Use "Paris"' }).props.onPress();
    });

    expect(visibleText(tree).join(" ")).toContain("Manual city selected. It will be saved when you continue.");
    expect(visibleText(tree).join(" ")).not.toContain("Saved as a manual city");

    await act(async () => {
      await tree.root.findByProps({ testID: "continue" }).props.onPress();
    });
    expect(mockSaveLocation).toHaveBeenCalledWith(
      expect.objectContaining({
        locationType: "manual",
        locationName: "Paris",
        coordinates: null,
      }),
    );
  });

  it("does not offer a manual result for empty or one-character input", async () => {
    const tree = renderScreen();
    expect(tree.root.findByProps({ testID: "continue" }).props.disabled).toBe(true);

    await act(async () => {
      tree.root.findByType("TextInput").props.onChangeText("P");
    });

    expect(tree.root.findAllByProps({ testID: 'location-Use "P"' })).toHaveLength(0);
    expect(tree.root.findByProps({ testID: "continue" }).props.disabled).toBe(true);
  });

  it("keeps a failed manual save on screen and permits retry", async () => {
    mockSaveLocation.mockRejectedValueOnce(new Error("Please try again."));
    const tree = renderScreen();
    await act(async () => {
      tree.root.findByType("TextInput").props.onChangeText("Paris");
    });
    await act(async () => {
      tree.root.findByProps({ testID: 'location-Use "Paris"' }).props.onPress();
    });
    await act(async () => {
      await tree.root.findByProps({ testID: "continue" }).props.onPress();
    });

    expect(mockAlert).toHaveBeenCalledWith("Save failed", "Please try again.");
    expect(mockPush).not.toHaveBeenCalled();
    expect(tree.root.findByProps({ testID: "continue" })).toBeTruthy();
    expect(tree.root.findAllByProps({ accessibilityLabel: "Selected location: Paris. City selected. Choosing a city does not request your device's GPS." }).length).toBeGreaterThan(0);
  });

  it("advances demo setup without saving or requesting device location", async () => {
    mockHookDemoMode = true;
    mockScreenDemoMode = true;
    const tree = renderScreen();
    await act(async () => {
      tree.root.findByType("TextInput").props.onChangeText("Cebu");
    });
    await act(async () => {
      tree.root.findByProps({ testID: "curated-Cebu City, Philippines" }).props.onPress();
    });
    await act(async () => {
      await tree.root.findByProps({ testID: "continue" }).props.onPress();
    });

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(auth)/account-setup/preferences",
      params: { userType: "filipina" },
    });
    expect(mockSaveLocation).not.toHaveBeenCalled();
    expect(mockPermission).not.toHaveBeenCalled();
  });

  it("restores the GPS row and invokes the guarded hook only when enabled", async () => {
    mockCurrentLocationEnabled = true;
    const tree = renderScreen();

    expect(tree.root.findByProps({ testID: "location-Use Current Location" })).toBeTruthy();
    expect(visibleText(tree).join(" ")).toContain("or search for a city");
    await act(async () => {
      await tree.root.findByProps({ testID: "location-Use Current Location" }).props.onPress();
    });
    expect(mockPermission).toHaveBeenCalledTimes(1);
  });

  it("redirects invalid userType to sign-in", () => {
    mockUserType = "invalid";
    const tree = renderScreen();
    expect(mockReplace).toHaveBeenCalledWith("/(auth)/signin");
    expect(tree.toJSON()).toBeNull();
  });
});
