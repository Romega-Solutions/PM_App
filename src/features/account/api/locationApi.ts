/**
 * Location API
 *
 * Handles user location data (current/manual location, coordinates).
 * Single Responsibility: Location operations only.
 */

import { supabase } from "@/src/config/supabase";

export type SavedLocation = {
  locationType: "current" | "manual";
  locationName: string;
  coordinates?: { lat: number; lng: number } | null;
  timestamp: string;
};

export async function saveLocation(
  payload: SavedLocation,
): Promise<{ ok: true; data: SavedLocation }> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Not authenticated");
    }

    const record = { ...payload, timestamp: new Date().toISOString() };

    const { error } = await supabase
      .from("profiles")
      .update({
        location_type: record.locationType,
        location_name: record.locationName,
        location_coordinates: record.coordinates,
        location_timestamp: record.timestamp,
        location_completed: true,
      })
      .eq("id", user.id);

    if (error) throw error;

    console.log("✅ Saved location to Supabase");
    return { ok: true, data: record };
  } catch (error) {
    console.error("❌ Error saving location:", error);
    throw error;
  }
}

export async function getLocation(): Promise<SavedLocation | null> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return null;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "location_type, location_name, location_coordinates, location_timestamp",
      )
      .eq("id", user.id)
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
  } catch (error) {
    console.error("❌ Error fetching location:", error);
    return null;
  }
}

export async function clearLocation(): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from("profiles")
        .update({
          location_completed: false,
          location_name: null,
          location_type: null,
          location_coordinates: null,
        })
        .eq("id", user.id);
    }
  } catch (error) {
    console.error("❌ Error clearing location:", error);
  }
}
