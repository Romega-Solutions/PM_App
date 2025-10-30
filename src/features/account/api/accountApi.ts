import { supabase } from "@/src/config/supabase";
import { UserType } from "../../auth/api/authApi";

// ============= BASIC INFO =============
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

// ============= PROFILE PHOTOS =============
export async function saveProfilePhoto(uri: string): Promise<{ ok: true; data: { photos: string[] } }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error("Not authenticated");
    }

    // Get existing photos
    const { data: profile } = await supabase
      .from('profiles')
      .select('photos')
      .eq('id', user.id)
      .single();

    const existingPhotos = profile?.photos || [];
    const newPhotos = [uri, ...existingPhotos].slice(0, 6);

    // Update photos array
    const { error } = await supabase
      .from('profiles')
      .update({
        photos: newPhotos,
        photos_completed: newPhotos.length > 0,
      })
      .eq('id', user.id);

    if (error) throw error;

    console.log("✅ Saved photo to Supabase");
    return { ok: true, data: { photos: newPhotos } };
  } catch (error) {
    console.error("❌ Error saving photo:", error);
    throw error;
  }
}

export async function getProfilePhotos(): Promise<string[]> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return [];
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('photos')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      return [];
    }

    return data.photos || [];
  } catch (error) {
    console.error("❌ Error fetching photos:", error);
    return [];
  }
}

export async function removeProfilePhoto(uri: string): Promise<{ ok: true; data: string[] }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error("Not authenticated");
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('photos')
      .eq('id', user.id)
      .single();

    const existingPhotos = profile?.photos || [];
    const newPhotos = existingPhotos.filter((p: string) => p !== uri);

    const { error } = await supabase
      .from('profiles')
      .update({
        photos: newPhotos,
        photos_completed: newPhotos.length > 0,
      })
      .eq('id', user.id);

    if (error) throw error;

    console.log("✅ Removed photo from Supabase");
    return { ok: true, data: newPhotos };
  } catch (error) {
    console.error("❌ Error removing photo:", error);
    throw error;
  }
}

// ============= LOCATION =============
export type SavedLocation = {
  locationType: "current" | "manual";
  locationName: string;
  coordinates?: { lat: number; lng: number } | null;
  timestamp: string;
};

export async function saveLocation(payload: SavedLocation): Promise<{ ok: true; data: SavedLocation }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error("Not authenticated");
    }

    const record = { ...payload, timestamp: new Date().toISOString() };

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
  } catch (error) {
    console.error("❌ Error fetching location:", error);
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
  } catch (error) {
    console.error("❌ Error clearing location:", error);
  }
}

// ============= VERIFICATION =============
export type VerificationData = {
  selfieUri: string;
  documentUri: string;
  extractedFirstName?: string;
  extractedLastName?: string;
  extractedAge?: number;
  isVerified: boolean;
  verifiedAt?: string;
  mismatchReasons?: string[];
};

export function compareVerificationData(
  extracted: { firstName?: string; lastName?: string; age?: number },
  stored: BasicInfoPayload | null
): { match: boolean; reasons: string[] } {
  if (!stored) return { match: false, reasons: ["No basic info found"] };
  const reasons: string[] = [];
  const normalize = (s: string) => s.trim().toLowerCase();
  
  if (extracted.firstName && normalize(extracted.firstName) !== normalize(stored.firstName)) {
    reasons.push(`First name mismatch: "${extracted.firstName}" vs "${stored.firstName}"`);
  }
  if (extracted.lastName && normalize(extracted.lastName) !== normalize(stored.lastName)) {
    reasons.push(`Last name mismatch: "${extracted.lastName}" vs "${stored.lastName}"`);
  }
  if (extracted.age !== undefined && extracted.age !== stored.age) {
    reasons.push(`Age mismatch: ${extracted.age} vs ${stored.age}`);
  }
  
  return { match: reasons.length === 0, reasons };
}

export async function saveVerification(payload: VerificationData): Promise<{ ok: true; data: VerificationData }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error("Not authenticated");
    }

    const record = { 
      ...payload, 
      verifiedAt: payload.isVerified ? new Date().toISOString() : undefined 
    };

    const { error } = await supabase
      .from('profiles')
      .update({
        verification_selfie: record.selfieUri,
        verification_document: record.documentUri,
        verification_extracted_first_name: record.extractedFirstName,
        verification_extracted_last_name: record.extractedLastName,
        verification_extracted_age: record.extractedAge,
        is_verified: record.isVerified,
        verified_at: record.verifiedAt,
        verification_mismatch_reasons: record.mismatchReasons,
        verification_completed: true,
      })
      .eq('id', user.id);

    if (error) throw error;

    console.log("✅ Saved verification to Supabase");
    return { ok: true, data: record };
  } catch (error) {
    console.error("❌ Error saving verification:", error);
    throw error;
  }
}

export async function getVerification(): Promise<VerificationData | null> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('verification_selfie, verification_document, verification_extracted_first_name, verification_extracted_last_name, verification_extracted_age, is_verified, verified_at, verification_mismatch_reasons')
      .eq('id', user.id)
      .single();

    if (error || !data || !data.verification_selfie) {
      return null;
    }

    return {
      selfieUri: data.verification_selfie,
      documentUri: data.verification_document,
      extractedFirstName: data.verification_extracted_first_name,
      extractedLastName: data.verification_extracted_last_name,
      extractedAge: data.verification_extracted_age,
      isVerified: data.is_verified,
      verifiedAt: data.verified_at,
      mismatchReasons: data.verification_mismatch_reasons,
    };
  } catch (error) {
    console.error("❌ Error fetching verification:", error);
    return null;
  }
}

export async function clearVerification(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase
        .from('profiles')
        .update({
          verification_completed: false,
          is_verified: false,
          verification_selfie: null,
          verification_document: null,
        })
        .eq('id', user.id);
    }
  } catch (error) {
    console.error("❌ Error clearing verification:", error);
  }
}

// ============= PREFERENCES =============
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

export const accountApi = {
  saveBasicInfo,
  getBasicInfo,
  clearBasicInfo,
  saveProfilePhoto,
  getProfilePhotos,
  removeProfilePhoto,
  saveLocation,
  getLocation,
  clearLocation,
  saveVerification,
  getVerification,
  clearVerification,
  compareVerificationData,
  savePreferences,
  getPreferences,
  clearPreferences,
};

export default accountApi;