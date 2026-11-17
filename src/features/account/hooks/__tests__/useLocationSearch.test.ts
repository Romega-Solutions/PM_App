import { act, renderHook } from "@testing-library/react-native";
import * as ExpoLocation from "expo-location";
import { accountApi } from "../../api/accountApi";
import {
  getManualLocationFromQuery,
  useLocationSearch,
} from "../useLocationSearch";

let mockCurrentLocationEnabled = false;
let mockIsDemoSession = false;

jest.mock("../../config/locationFeatures", () => ({
  get ACCOUNT_SETUP_CURRENT_LOCATION_ENABLED() {
    return mockCurrentLocationEnabled;
  },
}));

jest.mock("expo-location", () => ({
  Accuracy: { Balanced: 3 },
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
}));

jest.mock("@/src/features/auth/demoMode", () => ({
  useIsDemoSession: () => mockIsDemoSession,
}));

jest.mock("../../api/accountApi", () => ({
  accountApi: { saveLocation: jest.fn() },
}));

const mockPermission = ExpoLocation.requestForegroundPermissionsAsync as jest.Mock;
const mockPosition = ExpoLocation.getCurrentPositionAsync as jest.Mock;
const mockReverseGeocode = ExpoLocation.reverseGeocodeAsync as jest.Mock;
const mockSaveLocation = accountApi.saveLocation as jest.Mock;

describe("useLocationSearch", () => {
  beforeEach(() => {
    mockCurrentLocationEnabled = false;
    mockIsDemoSession = false;
    jest.clearAllMocks();
  });

  it.each([false, true])(
    "does not invoke device location or mutate state when disabled (demo=%s)",
    async (isDemo) => {
      mockIsDemoSession = isDemo;
      const { result } = renderHook(() => useLocationSearch());

      let location;
      await act(async () => {
        location = await result.current.getCurrentLocation();
      });

      expect(location).toBeNull();
      expect(result.current.selectedLocation).toBeNull();
      expect(result.current.saving).toBe(false);
      expect(mockPermission).not.toHaveBeenCalled();
      expect(mockPosition).not.toHaveBeenCalled();
      expect(mockReverseGeocode).not.toHaveBeenCalled();
      expect(mockSaveLocation).not.toHaveBeenCalled();
    },
  );

  it("keeps manual search and selection available while device location is disabled", async () => {
    const { result } = renderHook(() => useLocationSearch());

    await act(async () => {
      result.current.setQuery("Manila");
    });
    expect(result.current.filteredLocations[0]?.city).toBe("Manila");

    await act(async () => {
      await result.current.selectLocation(result.current.filteredLocations[0]!);
    });

    expect(mockSaveLocation).toHaveBeenCalledWith(
      expect.objectContaining({
        locationType: "manual",
        locationName: "Manila, Philippines",
        coordinates: { lat: 14.5995, lng: 120.9842 },
      }),
    );
    expect(mockPermission).not.toHaveBeenCalled();
    expect(mockPosition).not.toHaveBeenCalled();
    expect(mockReverseGeocode).not.toHaveBeenCalled();
  });

  it("retains the mocked current-location path when enabled", async () => {
    mockCurrentLocationEnabled = true;
    mockPermission.mockResolvedValue({ status: "granted", canAskAgain: true });
    mockPosition.mockResolvedValue({
      coords: { latitude: 14.6, longitude: 120.98 },
    });
    mockReverseGeocode.mockResolvedValue([
      { city: "Manila", country: "Philippines" },
    ]);
    const { result } = renderHook(() => useLocationSearch());

    let location;
    await act(async () => {
      location = await result.current.getCurrentLocation();
    });

    expect(mockPermission).toHaveBeenCalledTimes(1);
    expect(mockPosition).toHaveBeenCalledTimes(1);
    expect(mockReverseGeocode).toHaveBeenCalledWith({
      latitude: 14.6,
      longitude: 120.98,
    });
    expect(mockSaveLocation).toHaveBeenCalledWith(
      expect.objectContaining({
        locationType: "current",
        locationName: "Manila, Philippines",
        coordinates: { lat: 14.6, lng: 120.98 },
      }),
    );
    expect(location).toEqual({
      city: "Manila",
      country: "Philippines",
      coordinates: { lat: 14.6, lng: 120.98 },
    });
  });

  it("retains safe permission-denial guidance when enabled", async () => {
    mockCurrentLocationEnabled = true;
    mockPermission.mockResolvedValue({
      status: "denied",
      canAskAgain: false,
    });
    const { result } = renderHook(() => useLocationSearch());

    await expect(result.current.getCurrentLocation()).rejects.toThrow(
      "Location access is off. Turn it on in device settings, or search for your city manually.",
    );
    expect(mockPosition).not.toHaveBeenCalled();
    expect(mockReverseGeocode).not.toHaveBeenCalled();
    expect(mockSaveLocation).not.toHaveBeenCalled();
  });

  it("keeps the enabled demo shortcut independent of native location APIs", async () => {
    mockCurrentLocationEnabled = true;
    mockIsDemoSession = true;
    const { result } = renderHook(() => useLocationSearch());

    let location;
    await act(async () => {
      location = await result.current.getCurrentLocation();
    });

    expect(location).toEqual(
      expect.objectContaining({ city: "Manila", country: "Philippines" }),
    );
    expect(mockPermission).not.toHaveBeenCalled();
    expect(mockPosition).not.toHaveBeenCalled();
    expect(mockReverseGeocode).not.toHaveBeenCalled();
    expect(mockSaveLocation).not.toHaveBeenCalled();
  });
});

describe("getManualLocationFromQuery", () => {
  it("creates a city-only manual location from typed input", () => {
    expect(getManualLocationFromQuery("  Paris  ")).toEqual({
      city: "Paris",
      country: "",
    });
  });

  it("creates a city and country manual location from comma-separated input", () => {
    expect(getManualLocationFromQuery("Berlin, Germany")).toEqual({
      city: "Berlin",
      country: "Germany",
    });
  });

  it("ignores empty or too-short input", () => {
    expect(getManualLocationFromQuery("")).toBeNull();
    expect(getManualLocationFromQuery(" A ")).toBeNull();
  });
});
