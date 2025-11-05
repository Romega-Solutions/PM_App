import { useCallback, useState } from "react";
import { accountApi, type SavedLocation } from "../api/accountApi";

// ✅ Changed: Added city and country properties
export type Location = {
  city: string;
  country: string;
  coordinates?: { lat: number; lng: number };
};

// ✅ Updated sample data with city and country
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
];

export const useLocationSearch = () => {
  const [query, setQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  // ✅ Updated filter to search both city and country
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
      const payload: SavedLocation = {
        locationType: "manual",
        locationName: `${location.city}, ${location.country}`, // ✅ Updated
        coordinates: location.coordinates || null,
        timestamp: new Date().toISOString(),
      };

      await accountApi.saveLocation(payload);
      console.log(
        "✅ Location auto-saved:",
        `${location.city}, ${location.country}`
      );
    } catch (error) {
      console.error("❌ Error saving location:", error);
    } finally {
      setSaving(false);
    }
  }, []);

  const getCurrentLocation = useCallback(async (): Promise<Location | null> => {
    // Simulate getting current location
    // In production, use expo-location
    const mockCurrent: Location = {
      city: "Manila",
      country: "Philippines",
      coordinates: { lat: 14.5995, lng: 120.9842 },
    };

    setSelectedLocation(mockCurrent);

    // Auto-save to database
    setSaving(true);
    try {
      const payload: SavedLocation = {
        locationType: "current",
        locationName: `${mockCurrent.city}, ${mockCurrent.country}`,
        coordinates: mockCurrent.coordinates,
        timestamp: new Date().toISOString(),
      };

      await accountApi.saveLocation(payload);
      console.log("✅ Current location saved");
    } catch (error) {
      console.error("❌ Error saving location:", error);
    } finally {
      setSaving(false);
    }

    return mockCurrent;
  }, []);

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
