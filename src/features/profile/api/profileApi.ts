import { supabase } from "@/src/config/supabase";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";

export interface ProfileData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  age?: number;
  gender?: string;
  user_type?: string;
  occupation?: string;
  education?: string;
  location_name?: string;
  photos?: string[];
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  age?: number;
  occupation?: string;
  education?: string;
  location_name?: string;
}

const PROFILE_UPDATE_FIELDS = [
  "first_name",
  "last_name",
  "age",
  "occupation",
  "education",
  "location_name",
] as const satisfies readonly (keyof UpdateProfileData)[];

type ProfileAction = "update" | "upload" | "photos" | "delete";
const MAX_PROFILE_PHOTO_BYTES = 6 * 1024 * 1024;
const PROFILE_PHOTO_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
};

function getSafeProfileError(action: ProfileAction): string {
  if (action === "upload") {
    return "Photo upload failed. Check your connection and try again.";
  }

  if (action === "photos") {
    return "Profile photos did not save. Check your connection and try again.";
  }

  if (action === "delete") {
    return "Photo could not be removed. Check your connection and try again.";
  }

  return "Profile changes did not save. Check your connection and try again.";
}

function sanitizeProfileUpdates(
  updates: UpdateProfileData,
): Partial<UpdateProfileData> {
  const sanitized: Partial<UpdateProfileData> = {};

  for (const field of PROFILE_UPDATE_FIELDS) {
    if (updates[field] !== undefined) {
      sanitized[field] = updates[field] as never;
    }
  }

  return sanitized;
}

function getProfilePhotoUploadType(uri: string) {
  const cleanUri = uri.split("?")[0].split("#")[0];
  const extension = cleanUri.split(".").pop()?.toLowerCase() ?? "";
  const contentType = PROFILE_PHOTO_TYPES[extension];

  if (!contentType) {
    throw new Error("Unsupported profile photo type");
  }

  return {
    extension: extension === "jpeg" ? "jpg" : extension,
    contentType,
  };
}

async function assertProfilePhotoUpload(uri: string) {
  const uploadType = getProfilePhotoUploadType(uri);
  const fileInfo = await FileSystem.getInfoAsync(uri);

  if (!fileInfo.exists) {
    throw new Error("Profile photo file does not exist");
  }

  const size = "size" in fileInfo ? fileInfo.size : null;

  if (typeof size !== "number" || size <= 0 || size > MAX_PROFILE_PHOTO_BYTES) {
    throw new Error("Profile photo size is not allowed");
  }

  return uploadType;
}

/**
 * Get current user's profile
 */
export async function getCurrentUserProfile(): Promise<ProfileData | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching profile.");
      return null;
    }

    return data;
  } catch {
    console.error("Failed to get user profile.");
    return null;
  }
}

/**
 * Update current user's profile
 */
export async function updateUserProfile(
  updates: UpdateProfileData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Please sign in to update your profile." };
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        ...sanitizeProfileUpdates(updates),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating profile.");
      return { success: false, error: getSafeProfileError("update") };
    }

    return { success: true };
  } catch {
    console.error("Failed to update profile.");
    return { success: false, error: getSafeProfileError("update") };
  }
}

/**
 * Upload profile photo to Supabase Storage
 */
export async function uploadProfilePhoto(
  uri: string,
  userId: string,
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const { extension, contentType } = await assertProfilePhotoUpload(uri);

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: "base64",
    });

    // Generate unique filename
    const fileName = `${userId}/${Date.now()}.${extension}`;

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from("profile-photos")
      .upload(fileName, decode(base64), {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error("Profile photo upload failed.");
      return { success: false, error: getSafeProfileError("upload") };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("profile-photos").getPublicUrl(fileName);

    return { success: true, url: publicUrl };
  } catch {
    console.error("Failed to upload photo.");
    return { success: false, error: getSafeProfileError("upload") };
  }
}

/**
 * Update user's photos array in profile
 */
export async function updateProfilePhotos(
  photoUrls: string[],
): Promise<{ success: boolean; error?: string }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Please sign in to update your photos." };
    }

    const { error } = await supabase
      .from("profiles")
      .update({ photos: photoUrls })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating photos.");
      return { success: false, error: getSafeProfileError("photos") };
    }

    return { success: true };
  } catch {
    console.error("Failed to update photos.");
    return { success: false, error: getSafeProfileError("photos") };
  }
}

/**
 * Delete profile photo from storage
 */
export async function deleteProfilePhoto(
  photoUrl: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Extract file path from URL
    const urlParts = photoUrl.split("/profile-photos/");
    if (urlParts.length < 2) {
      return { success: false, error: getSafeProfileError("delete") };
    }

    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from("profile-photos")
      .remove([filePath]);

    if (error) {
      console.error("Error deleting photo.");
      return { success: false, error: getSafeProfileError("delete") };
    }

    return { success: true };
  } catch {
    console.error("Failed to delete photo.");
    return { success: false, error: getSafeProfileError("delete") };
  }
}
