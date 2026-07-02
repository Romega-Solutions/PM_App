import { supabase } from "@/src/config/supabase";
import { UserType } from "../../auth/api/authApi";

const PREFERENCES_SIGN_IN_ERROR =
  "Please sign in before saving match preferences.";
const PREFERENCES_INPUT_ERROR =
  "Check your match preferences and try again.";
const PREFERENCES_SAVE_ERROR =
  "Preferences did not save. Check your connection and try again.";
const MIN_PREFERENCE_AGE = 18;
const MAX_PREFERENCE_AGE = 100;
const MIN_DISTANCE_KM = 1;
const MAX_DISTANCE_KM = 500;
const RELATIONSHIP_GOALS = new Set([
  "dating",
  "long-term",
  "marriage",
  "friendship",
]);

function getInterestedInFromUserType(userType: UserType): string {
  return userType === "filipina" ? "Men" : "Women";
}

function getLookingForGenderFromUserType(
  userType: UserType,
): "male" | "female" {
  return userType === "filipina" ? "male" : "female";
}

function isSupportedUserType(userType: UserType): boolean {
  return userType === "filipina" || userType === "foreigner";
}

function normalizeRelationshipGoal(value: string): string | null {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

  if (!normalized) return null;
  if (normalized.includes("marriage")) return "marriage";
  if (normalized.includes("friend")) return "friendship";
  if (normalized.includes("long") || normalized.includes("serious")) {
    return "long-term";
  }
  if (
    normalized.includes("dating") ||
    normalized.includes("casual") ||
    normalized.includes("not sure") ||
    normalized.includes("still deciding")
  ) {
    return "dating";
  }

  return RELATIONSHIP_GOALS.has(normalized) ? normalized : null;
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

function normalizePreferencesPayload(
  payload: Omit<PreferencesPayload, "interestedIn"> & { userType: UserType },
) {
  const ageMin = Number.isFinite(payload.ageMin) ? Math.trunc(payload.ageMin) : NaN;
  const ageMax = Number.isFinite(payload.ageMax) ? Math.trunc(payload.ageMax) : NaN;
  const maxDistanceKm = Number.isFinite(payload.maxDistanceKm)
    ? Math.trunc(payload.maxDistanceKm)
    : NaN;
  const relationshipGoal = normalizeRelationshipGoal(payload.relationshipGoal);

  if (
    !Number.isInteger(ageMin) ||
    !Number.isInteger(ageMax) ||
    ageMin < MIN_PREFERENCE_AGE ||
    ageMax > MAX_PREFERENCE_AGE ||
    ageMin > ageMax ||
    !Number.isInteger(maxDistanceKm) ||
    maxDistanceKm < MIN_DISTANCE_KM ||
    maxDistanceKm > MAX_DISTANCE_KM ||
    !relationshipGoal ||
    !isSupportedUserType(payload.userType)
  ) {
    throw new Error(PREFERENCES_INPUT_ERROR);
  }

  return {
    ageMin,
    ageMax,
    maxDistanceKm,
    relationshipGoal,
    userType: payload.userType,
  };
}

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

    const normalizedPayload = normalizePreferencesPayload(payload);
    const interestedIn = getInterestedInFromUserType(normalizedPayload.userType);
    const lookingForGender = getLookingForGenderFromUserType(normalizedPayload.userType);

    const { error } = await supabase
      .from("profiles")
      .update({
        interested_in: interestedIn,
        age_min: normalizedPayload.ageMin,
        age_max: normalizedPayload.ageMax,
        max_distance_km: normalizedPayload.maxDistanceKm,
        looking_for_gender: lookingForGender,
        age_preference_min: normalizedPayload.ageMin,
        age_preference_max: normalizedPayload.ageMax,
        distance_preference_km: normalizedPayload.maxDistanceKm,
        relationship_goal: normalizedPayload.relationshipGoal,
        preferences_completed: true,
      })
      .eq("id", user.id);

    if (error) {
      throw new Error(PREFERENCES_SAVE_ERROR);
    }

    const record: PreferencesPayload = {
      ...normalizedPayload,
      interestedIn,
      createdAt: new Date().toISOString(),
    };

    return { ok: true, data: record };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === PREFERENCES_SIGN_IN_ERROR
    ) {
      throw new Error(PREFERENCES_SIGN_IN_ERROR);
    }

    if (error instanceof Error && error.message === PREFERENCES_INPUT_ERROR) {
      throw new Error(PREFERENCES_INPUT_ERROR);
    }

    console.error("Error saving preferences.");
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
