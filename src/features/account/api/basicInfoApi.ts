/**
 * Basic Info API
 * 
 * Handles user basic information (name, age, gender, user type).
 * Single Responsibility: Basic profile info operations only.
 */

import { supabase } from "@/src/config/supabase";
import { UserType } from "../../auth/api/authApi";

export type BasicInfoPayload = {
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  userType: UserType;
  createdAt?: string;
};

function getGenderFromUserType(userType: UserType): string {
  return userType === "filipina" ? "female" : "male";
}

export async function saveBasicInfo(
  payload: Omit<BasicInfoPayload, "gender"> & { userType: UserType }
): Promise<{ ok: true; data: BasicInfoPayload }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error("Not authenticated");
    }

    const gender = getGenderFromUserType(payload.userType);

    const { data, error } = await supabase
      .from('profiles')
      .update({
        first_name: payload.firstName.trim(),
        last_name: payload.lastName.trim(),
        age: payload.age,
        gender: gender,
        user_type: payload.userType,
        basic_info_completed: true,
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error("❌ Error saving basic info:", error);
      throw error;
    }

    console.log("✅ Saved basic info to Supabase:", data);

    return {
      ok: true,
      data: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        age: payload.age,
        gender,
        userType: payload.userType,
        createdAt: data.updated_at,
      },
    };
  } catch (error) {
    console.error("❌ Failed to save basic info:", error);
    throw error;
  }
}

export async function getBasicInfo(): Promise<BasicInfoPayload | null> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      firstName: data.first_name,
      lastName: data.last_name || '',
      age: data.age || 0,
      gender: data.gender,
      userType: data.user_type as UserType,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error("❌ Error fetching basic info:", error);
    return null;
  }
}

export async function clearBasicInfo(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase
        .from('profiles')
        .update({ basic_info_completed: false })
        .eq('id', user.id);
    }
  } catch (error) {
    console.error("❌ Error clearing basic info:", error);
  }
}
