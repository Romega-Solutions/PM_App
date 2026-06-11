import { supabase } from "@/src/config/supabase";
import { UserType } from "../../auth/api/authApi";

const PREFERENCES_SIGN_IN_ERROR =
  "Please sign in before saving match preferences.";
const PREFERENCES_SAVE_ERROR =
  "Preferences did not save. Check your connection and try again.";

function getInterestedInFromUserType(userType: UserType): string {
  return userType === "filipina" ? "Men" : "Women";
}

function getLookingForGenderFromUserType(
  userType: UserType,
): "male" | "female" {
  return userType === "filipina" ? "male" : "female";
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
  payload: Omit<PreferencesPayload, "interestedIn"> & { userType: UserType },
): Promise<{ ok: true; data: PreferencesPayload }> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error(PREFERENCES_SIGN_IN_ERROR);
    }

    const interestedIn = getInterestedInFromUserType(payload.userType);
    const lookingForGender = getLookingForGenderFromUserType(payload.userType);

    const { error } = await supabase
      .from("profiles")
      .update({
        interested_in: interestedIn,
        age_min: payload.ageMin,
        age_max: payload.ageMax,
        max_distance_km: payload.maxDistanceKm,
        looking_for_gender: lookingForGender,
        age_preference_min: payload.ageMin,
        age_preference_max: payload.ageMax,
        distance_preference_km: payload.maxDistanceKm,
        relationship_goal: payload.relationshipGoal,
        preferences_completed: true,
      })
      .eq("id", user.id);

    if (error) {
      throw new Error(PREFERENCES_SAVE_ERROR);
    }

    const record: PreferencesPayload = {
      ...payload,
      interestedIn,
      createdAt: new Date().toISOString(),
    };

    return { ok: true, data: record };
  } catch (error) {
    console.error("Error saving preferences.");
    if (
      error instanceof Error &&
      error.message === PREFERENCES_SIGN_IN_ERROR
    ) {
      throw error;
    }

    throw new Error(PREFERENCES_SAVE_ERROR);
  }
}

export async function getPreferences(): Promise<PreferencesPayload | null> {
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
        "interested_in, age_min, age_max, max_distance_km, looking_for_gender, age_preference_min, age_preference_max, distance_preference_km, relationship_goal, user_type, created_at",
      )
      .eq("id", user.id)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      interestedIn: data.interested_in,
      ageMin: data.age_preference_min ?? data.age_min,
      ageMax: data.age_preference_max ?? data.age_max,
      maxDistanceKm: data.distance_preference_km ?? data.max_distance_km,
      relationshipGoal: data.relationship_goal,
      userType: data.user_type as UserType,
      createdAt: data.created_at,
    };
  } catch {
    console.error("Error fetching preferences.");
    return null;
  }
}

export async function clearPreferences(): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from("profiles")
        .update({ preferences_completed: false })
        .eq("id", user.id);
    }
  } catch {
    console.error("Error clearing preferences.");
  }
}
