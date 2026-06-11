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
const BASIC_INFO_SAVE_ERROR =
  "Basic profile information did not save. Check your connection and try again.";

export type BasicInfoPayload = {
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  userType: UserType;
  createdAt?: string;
};

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

    const firstName = payload.firstName.trim();
    const lastName = payload.lastName.trim();

    const { data, error } = await supabase.rpc("save_basic_info", {
      p_first_name: firstName,
      p_last_name: lastName,
      p_age: payload.age,
      p_user_type: payload.userType,
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
        firstName,
        lastName,
        age: payload.age,
        gender: record.gender,
        userType: record.user_type as UserType,
        createdAt: record.updated_at,
      },
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === BASIC_INFO_SIGN_IN_ERROR
    ) {
      throw error;
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
