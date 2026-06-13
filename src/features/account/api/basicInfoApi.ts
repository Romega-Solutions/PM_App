/**
 * Basic Info API
 *
 * Handles user basic information (name, age, gender, user type).
 * Single Responsibility: Basic profile info operations only.
 */

import { supabase } from "@/src/config/supabase";
import { UserType } from "../../auth/api/authApi";

const BASIC_INFO_SIGN_IN_ERROR =
  "Please sign in before saving basic profile information.";
const BASIC_INFO_INPUT_ERROR =
  "Check your basic profile information and try again.";
const BASIC_INFO_SAVE_ERROR =
  "Basic profile information did not save. Check your connection and try again.";
const MIN_PROFILE_AGE = 18;
const MAX_PROFILE_AGE = 100;

export type BasicInfoPayload = {
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  userType: UserType;
  createdAt?: string;
};

function isSupportedUserType(userType: UserType): boolean {
  return userType === "filipina" || userType === "foreigner";
}

function normalizeBasicInfoPayload(
  payload: Omit<BasicInfoPayload, "gender"> & { userType: UserType },
) {
  const firstName = payload.firstName.trim();
  const lastName = payload.lastName.trim();
  const age = Number.isFinite(payload.age) ? Math.trunc(payload.age) : NaN;

  if (
    !firstName ||
    !lastName ||
    !Number.isInteger(age) ||
    age < MIN_PROFILE_AGE ||
    age > MAX_PROFILE_AGE ||
    !isSupportedUserType(payload.userType)
  ) {
    throw new Error(BASIC_INFO_INPUT_ERROR);
  }

  return {
    firstName,
    lastName,
    age,
    userType: payload.userType,
  };
}

export async function saveBasicInfo(
  payload: Omit<BasicInfoPayload, "gender"> & { userType: UserType },
): Promise<{ ok: true; data: BasicInfoPayload }> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error(BASIC_INFO_SIGN_IN_ERROR);
    }

    const normalizedPayload = normalizeBasicInfoPayload(payload);

    const { data, error } = await supabase.rpc("save_basic_info", {
      p_first_name: normalizedPayload.firstName,
      p_last_name: normalizedPayload.lastName,
      p_age: normalizedPayload.age,
      p_user_type: normalizedPayload.userType,
    });

    if (error) {
      console.error("Error saving basic info.");
      throw new Error(BASIC_INFO_SAVE_ERROR);
    }

    const record = Array.isArray(data) ? data[0] : data;
    if (!record) {
      throw new Error(BASIC_INFO_SAVE_ERROR);
    }

    return {
      ok: true,
      data: {
        firstName: normalizedPayload.firstName,
        lastName: normalizedPayload.lastName,
        age: normalizedPayload.age,
        gender: record.gender,
        userType: record.user_type as UserType,
        createdAt: record.updated_at,
      },
    };
  } catch (error) {
    if (error instanceof Error && error.message === BASIC_INFO_SIGN_IN_ERROR) {
      throw new Error(BASIC_INFO_SIGN_IN_ERROR);
    }

    if (error instanceof Error && error.message === BASIC_INFO_INPUT_ERROR) {
      throw new Error(BASIC_INFO_INPUT_ERROR);
    }

    throw new Error(BASIC_INFO_SAVE_ERROR);
  }
}

export async function getBasicInfo(): Promise<BasicInfoPayload | null> {
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
      .select("*")
      .eq("id", user.id)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      firstName: data.first_name,
      lastName: data.last_name || "",
      age: data.age || 0,
      gender: data.gender,
      userType: data.user_type as UserType,
      createdAt: data.created_at,
    };
  } catch {
    console.error("Error fetching basic info.");
    return null;
  }
}

export async function clearBasicInfo(): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from("profiles")
        .update({ basic_info_completed: false })
        .eq("id", user.id);
    }
  } catch {
    console.error("Error clearing basic info.");
  }
}
