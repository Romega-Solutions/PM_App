/**
 * Settings feature — Supabase data access.
 *
 * Relocated out of `app/(main)/profile-settings/preferences.tsx` (which called
 * Supabase inline). Screens now go: Route → Screen → useMatchPreferences →
 * settingsApi → Supabase. Keep all `profiles`-table queries for settings here.
 */
import { supabase } from "@/src/config/supabase";

export interface MatchPreferences {
  ageMin: number;
  ageMax: number;
  maxDistanceKm: number;
  interestedIn: string;
}

export const DEFAULT_MATCH_PREFERENCES: MatchPreferences = {
  ageMin: 18,
  ageMax: 35,
  maxDistanceKm: 50,
  interestedIn: "",
};

/** Read the current user's match preferences from `profiles`. */
export async function getMatchPreferences(): Promise<MatchPreferences> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return DEFAULT_MATCH_PREFERENCES;

  const { data, error } = await supabase
    .from("profiles")
    .select("age_min, age_max, max_distance_km, interested_in")
    .eq("id", user.id)
    .single();

  if (error) throw error;

  return {
    ageMin: data?.age_min ?? DEFAULT_MATCH_PREFERENCES.ageMin,
    ageMax: data?.age_max ?? DEFAULT_MATCH_PREFERENCES.ageMax,
    maxDistanceKm: data?.max_distance_km ?? DEFAULT_MATCH_PREFERENCES.maxDistanceKm,
    interestedIn: data?.interested_in ?? DEFAULT_MATCH_PREFERENCES.interestedIn,
  };
}

/** Persist the current user's match preferences to `profiles`. */
export async function updateMatchPreferences(prefs: MatchPreferences): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("profiles")
    .update({
      age_min: prefs.ageMin,
      age_max: prefs.ageMax,
      max_distance_km: prefs.maxDistanceKm,
      interested_in: prefs.interestedIn,
    })
    .eq("id", user.id);

  if (error) throw error;
}
