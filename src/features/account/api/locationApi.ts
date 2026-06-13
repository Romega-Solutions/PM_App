/**
 * Location API
 * 
 * Handles user location data (current/manual location, coordinates).
 * Single Responsibility: Location operations only.
 */

import { supabase } from "@/src/config/supabase";

const LOCATION_SIGN_IN_ERROR = "Please sign in before saving your location.";
const LOCATION_INPUT_ERROR = "Check your location and try again.";
const LOCATION_SAVE_ERROR =
  "Location did not save. Check your connection and try again.";
const MAX_LOCATION_NAME_LENGTH = 120;

export type SavedLocation = {
  locationType: "current" | "manual";
  locationName: string;
  coordinates?: { lat: number; lng: number } | null;
  timestamp: string;
};

function isSupportedLocationType(
  locationType: SavedLocation["locationType"],
): boolean {
  return locationType === "current" || locationType === "manual";
}

function normalizeCoordinates(
  coordinates?: SavedLocation["coordinates"],
): SavedLocation["coordinates"] {
  if (!coordinates) {
    return null;
  }

  const { lat, lng } = coordinates;

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    throw new Error(LOCATION_INPUT_ERROR);
  }

  return { lat, lng };
}

function normalizeLocationPayload(payload: SavedLocation): SavedLocation {
  const locationName = payload.locationName.trim().slice(0, MAX_LOCATION_NAME_LENGTH);

  if (!isSupportedLocationType(payload.locationType) || !locationName) {
    throw new Error(LOCATION_INPUT_ERROR);
  }

  return {
    locationType: payload.locationType,
    locationName,
    coordinates: normalizeCoordinates(payload.coordinates),
    timestamp: new Date().toISOString(),
  };
}

export async function saveLocation(payload: SavedLocation): Promise<{ ok: true; data: SavedLocation }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error(LOCATION_SIGN_IN_ERROR);
    }

    const record = normalizeLocationPayload(payload);

    const { error } = await supabase
      .from('profiles')
      .update({
        location_type: record.locationType,
        location_name: record.locationName,
        location_coordinates: record.coordinates,
        location_timestamp: record.timestamp,
        location_completed: true,
      })
      .eq('id', user.id);

    if (error) {
      throw new Error(LOCATION_SAVE_ERROR);
    }

    return { ok: true, data: record };
  } catch (error) {
    if (error instanceof Error && error.message === LOCATION_SIGN_IN_ERROR) {
      throw new Error(LOCATION_SIGN_IN_ERROR);
    }

    if (error instanceof Error && error.message === LOCATION_INPUT_ERROR) {
      throw new Error(LOCATION_INPUT_ERROR);
    }

    console.error("Error saving location.");
    throw new Error(LOCATION_SAVE_ERROR);
  }
}

export async function getLocation(): Promise<SavedLocation | null> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('location_type, location_name, location_coordinates, location_timestamp')
      .eq('id', user.id)
      .single();

    if (error || !data || !data.location_name) {
      return null;
    }

    return {
      locationType: data.location_type as "current" | "manual",
      locationName: data.location_name,
      coordinates: data.location_coordinates,
      timestamp: data.location_timestamp,
    };
  } catch {
    console.error("Error fetching location.");
    return null;
  }
}

export async function clearLocation(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase
        .from('profiles')
        .update({
          location_completed: false,
          location_name: null,
          location_type: null,
          location_coordinates: null,
        })
        .eq('id', user.id);
    }
  } catch {
    console.error("Error clearing location.");
  }
}
