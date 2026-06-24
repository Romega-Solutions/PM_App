import { useCallback, useState } from "react";
import * as ExpoLocation from "expo-location";
import { isBetaDemoModeEnabled } from "@/src/features/auth/demoMode";
import { accountApi, type SavedLocation } from "../api/accountApi";

// ✅ Changed: Added city and country properties
export type Location = {
  city: string;
  country: string;
  coordinates?: { lat: number; lng: number };
};

const getLocationName = (location: Location) =>
  location.country ? `${location.city}, ${location.country}` : location.city;

const sampleLocations: Location[] = [
  {
    city: "Manila",
    country: "Philippines",
    coordinates: { lat: 14.5995, lng: 120.9842 },
  },
  {
    city: "Cebu City",
    country: "Philippines",
    coordinates: { lat: 10.3157, lng: 123.8854 },
  },
  {
    city: "Davao City",
    country: "Philippines",
    coordinates: { lat: 7.1907, lng: 125.4553 },
  },
  {
    city: "Quezon City",
    country: "Philippines",
    coordinates: { lat: 14.676, lng: 121.0437 },
  },
  {
    city: "Makati",
    country: "Philippines",
    coordinates: { lat: 14.5547, lng: 121.0244 },
  },
  {
    city: "Baguio",
    country: "Philippines",
    coordinates: { lat: 16.4023, lng: 120.596 },
  },
  {
    city: "Iloilo City",
    country: "Philippines",
    coordinates: { lat: 10.7202, lng: 122.5621 },
  },
  {
    city: "Bacolod",
    country: "Philippines",
    coordinates: { lat: 10.6767, lng: 122.95 },
  },
  {
    city: "Cagayan de Oro",
    country: "Philippines",
    coordinates: { lat: 8.4542, lng: 124.6319 },
  },
  {
    city: "General Santos",
    country: "Philippines",
    coordinates: { lat: 6.1164, lng: 125.1716 },
  },
  {
    city: "New York",
    country: "United States",
    coordinates: { lat: 40.7128, lng: -74.006 },
  },
  {
    city: "Los Angeles",
    country: "United States",
    coordinates: { lat: 34.0522, lng: -118.2437 },
  },
  {
    city: "San Francisco",
    country: "United States",
    coordinates: { lat: 37.7749, lng: -122.4194 },
  },
  {
    city: "Honolulu",
    country: "United States",
    coordinates: { lat: 21.3099, lng: -157.8581 },
  },
  {
    city: "Toronto",
    country: "Canada",
    coordinates: { lat: 43.6532, lng: -79.3832 },
  },
  {
    city: "Vancouver",
    country: "Canada",
    coordinates: { lat: 49.2827, lng: -123.1207 },
  },
  {
    city: "Sydney",
    country: "Australia",
    coordinates: { lat: -33.8688, lng: 151.2093 },
  },
  {
    city: "Melbourne",
    country: "Australia",
    coordinates: { lat: -37.8136, lng: 144.9631 },
  },
  {
    city: "London",
    country: "United Kingdom",
    coordinates: { lat: 51.5072, lng: -0.1276 },
  },
  {
    city: "Singapore",
    country: "Singapore",
    coordinates: { lat: 1.3521, lng: 103.8198 },
  },
];

export function getManualLocationFromQuery(value: string): Location | null {
  const cleaned = value.replace(/\s+/g, " ").trim();

  if (cleaned.length < 2) {
    return null;
  }

  const [cityPart, ...countryParts] = cleaned
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (!cityPart) {
    return null;
  }

  return {
    city: cityPart,
    country: countryParts.join(", "),
  };
}

export const useLocationSearch = () => {
  const isDemoMode = isBetaDemoModeEnabled();
  const [query, setQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  const filteredLocations = query.trim()
    ? sampleLocations.filter(
        (loc) =>
          loc.city.toLowerCase().includes(query.toLowerCase()) ||
          loc.country.toLowerCase().includes(query.toLowerCase())
      )
    : sampleLocations;

  const selectLocation = useCallback(async (location: Location) => {
    setSelectedLocation(location);

    // Auto-save to database
    setSaving(true);
    try {
      if (isDemoMode) {
        return;
      }

      const payload: SavedLocation = {
        locationType: "manual",
        locationName: getLocationName(location),
        coordinates: location.coordinates || null,
        timestamp: new Date().toISOString(),
      };

      await accountApi.saveLocation(payload);
    } catch {
      console.error("Error saving location.");
    } finally {
      setSaving(false);
    }
  }, [isDemoMode]);

  const getCurrentLocation = useCallback(async (): Promise<Location | null> => {
    const permission = await ExpoLocation.requestForegroundPermissionsAsync();

    if (permission.status !== "granted") {
      throw new Error(
        permission.canAskAgain
          ? "Location permission is required to use your current location. You can also search for your city manually."
          : "Location access is off. Turn it on in device settings, or search for your city manually."
      );
    }

    setSaving(true);
    try {
      const position = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Balanced,
      });

      const coordinates = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      let city = "Current location";
      let country = "";

      try {
        const [place] = await ExpoLocation.reverseGeocodeAsync({
          latitude: coordinates.lat,
          longitude: coordinates.lng,
        });

        city =
          place?.city?.trim() ||
          place?.subregion?.trim() ||
          place?.district?.trim() ||
          place?.region?.trim() ||
          city;
        country = place?.country?.trim() || country;
      } catch {
        console.warn("Reverse geocoding failed.");
      }

      const currentLocation: Location = {
        city,
        country,
        coordinates,
      };

      setSelectedLocation(currentLocation);

      if (isDemoMode) {
        return currentLocation;
      }

      const payload: SavedLocation = {
        locationType: "current",
        locationName: getLocationName(currentLocation),
        coordinates,
        timestamp: new Date().toISOString(),
      };

      await accountApi.saveLocation(payload);

      return currentLocation;
    } catch (error) {
      console.error("Error saving current location.");
      throw error;
    } finally {
      setSaving(false);
    };
  }, [isDemoMode]);

  return {
    query,
    setQuery,
    selectedLocation,
    selectLocation,
    getCurrentLocation,
    filteredLocations,
    saving,
  } as const;
};
