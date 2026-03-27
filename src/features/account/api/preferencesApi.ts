/**
 * Preferences API
 * 
 * Handles user matching preferences (age range, distance, relationship goals).
 * Single Responsibility: Preferences operations only.
 */

import { supabase } from "@/src/config/supabase";
import { UserType } from "../../auth/api/authApi";

function getInterestedInFromUserType(userType: UserType): string {
  return userType === "filipina" ? "Men" : "Women";
}

export type PreferencesPayload = {
  interestedIn: string;
  ageMin: number;
  ageMax: number;
  maxDistanceKm: number;
  relationshipGoal: string;
  userType: UserType;
  createdAt?: string;
};

export async function savePreferences(
  payload: Omit<PreferencesPayload, "interestedIn"> & { userType: UserType }
): Promise<{ ok: true; data: PreferencesPayload }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error("Not authenticated");
    }

    const interestedIn = getInterestedInFromUserType(payload.userType);

    const { error } = await supabase
      .from('profiles')
      .update({
        interested_in: interestedIn,
        age_min: payload.ageMin,
        age_max: payload.ageMax,
        max_distance_km: payload.maxDistanceKm,
        relationship_goal: payload.relationshipGoal,
        preferences_completed: true,
      })
      .eq('id', user.id);

    if (error) throw error;

    const record: PreferencesPayload = {
      ...payload,
      interestedIn,
      createdAt: new Date().toISOString(),
    };

    console.log("✅ Saved preferences to Supabase:", record);
    return { ok: true, data: record };
  } catch (error) {
    console.error("❌ Error saving preferences:", error);
    throw error;
  }
}

export async function getPreferences(): Promise<PreferencesPayload | null> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('interested_in, age_min, age_max, max_distance_km, relationship_goal, user_type, created_at')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      interestedIn: data.interested_in,
      ageMin: data.age_min,
      ageMax: data.age_max,
      maxDistanceKm: data.max_distance_km,
      relationshipGoal: data.relationship_goal,
      userType: data.user_type as UserType,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error("❌ Error fetching preferences:", error);
    return null;
  }
}

export async function clearPreferences(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase
        .from('profiles')
        .update({ preferences_completed: false })
        .eq('id', user.id);
    }
  } catch (error) {
    console.error("❌ Error clearing preferences:", error);
  }
}
