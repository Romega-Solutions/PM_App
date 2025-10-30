import { useCallback, useState } from "react";
import { accountApi, type SavedLocation } from "../api/accountApi";

type Location = {
  name: string;
  coordinates?: { lat: number; lng: number };
};

const sampleLocations: Location[] = [
  { name: "Manila", coordinates: { lat: 14.5995, lng: 120.9842 } },
  { name: "Cebu City", coordinates: { lat: 10.3157, lng: 123.8854 } },
  { name: "Davao City", coordinates: { lat: 7.1907, lng: 125.4553 } },
  { name: "Quezon City", coordinates: { lat: 14.6760, lng: 121.0437 } },
  { name: "Makati", coordinates: { lat: 14.5547, lng: 121.0244 } },
];

export const useLocationSearch = () => {
  const [query, setQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [saving, setSaving] = useState(false);

  const filteredLocations = query.trim()
    ? sampleLocations.filter((loc) =>
        loc.name.toLowerCase().includes(query.toLowerCase())
      )
    : sampleLocations;

  const selectLocation = useCallback(async (location: Location) => {
    setSelectedLocation(location);
    
    // Auto-save to database
    setSaving(true);
    try {
      const payload: SavedLocation = {
        locationType: "manual",
        locationName: location.name,
        coordinates: location.coordinates || null,
        timestamp: new Date().toISOString(),
      };
      
      await accountApi.saveLocation(payload);
      console.log("✅ Location auto-saved:", location.name);
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
      name: "Current Location (Manila)",
      coordinates: { lat: 14.5995, lng: 120.9842 },
    };
    
    setSelectedLocation(mockCurrent);
    
    // Auto-save to database
    setSaving(true);
    try {
      const payload: SavedLocation = {
        locationType: "current",
        locationName: mockCurrent.name,
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