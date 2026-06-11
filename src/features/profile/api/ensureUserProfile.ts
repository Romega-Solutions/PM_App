import { supabase } from "@/src/config/supabase";
import type { UserType } from "../../auth/api/authApi";

export type EnsuredProfile = {
  id: string;
  user_type: UserType;
  first_name: string;
  basic_info_completed?: boolean;
  photos_completed?: boolean;
  location_completed?: boolean;
  preferences_completed?: boolean;
};

export type EnsureUserProfileInput = {
  userId: string;
  email?: string | null;
  userType?: string | null;
  firstName?: string | null;
};

const PROFILE_COMPLETION_SELECT =
  "id, user_type, first_name, basic_info_completed, photos_completed, location_completed, preferences_completed";

function normalizeUserType(userType?: string | null): UserType {
  return userType === "filipina" ? "filipina" : "foreigner";
}

function getGenderFromUserType(userType: UserType): "female" | "male" {
  return userType === "filipina" ? "female" : "male";
}

export async function ensureUserProfile({
  userId,
  email,
  userType,
  firstName,
}: EnsureUserProfileInput): Promise<EnsuredProfile> {
  const { data: existingProfile, error: fetchError } = await supabase
    .from("profiles")
    .select(PROFILE_COMPLETION_SELECT)
    .eq("id", userId)
    .single();

  if (!fetchError && existingProfile) {
    return existingProfile as EnsuredProfile;
  }

  if (fetchError?.code && fetchError.code !== "PGRST116") {
    throw fetchError;
  }

  const normalizedUserType = normalizeUserType(userType);
  const gender = getGenderFromUserType(normalizedUserType);

  const { data: newProfile, error: insertError } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      email,
      first_name: firstName || "",
      user_type: normalizedUserType,
      gender,
      looking_for_gender: gender === "female" ? "male" : "female",
      age_preference_min: 18,
      age_preference_max: 70,
    })
    .select(PROFILE_COMPLETION_SELECT)
    .single();

  if (insertError) {
    throw insertError;
  }

  return newProfile as EnsuredProfile;
}
