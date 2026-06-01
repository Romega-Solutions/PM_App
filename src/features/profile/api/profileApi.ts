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

/**
 * Get current user's profile
 */
export async function getCurrentUserProfile(): Promise<ProfileData | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.log("❌ No authenticated user");
      return null;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("❌ Error fetching profile:", error);
      return null;
    }

    console.log("✅ Profile fetched:", data);
    return data;
  } catch (error) {
    console.error("❌ Failed to get user profile:", error);
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
      return { success: false, error: "Not authenticated" };
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("❌ Error updating profile:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Profile updated successfully");
    return { success: true };
  } catch (error: any) {
    console.error("❌ Failed to update profile:", error);
    return { success: false, error: error.message || "Unknown error" };
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
    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: "base64",
    });

    // Generate unique filename
    const fileExt = uri.split(".").pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from("profile-photos")
      .upload(fileName, decode(base64), {
        contentType: `image/${fileExt}`,
        upsert: true,
      });

    if (error) {
      console.error("❌ Upload error:", error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("profile-photos").getPublicUrl(fileName);

    console.log("✅ Photo uploaded:", publicUrl);
    return { success: true, url: publicUrl };
  } catch (error: any) {
    console.error("❌ Failed to upload photo:", error);
    return { success: false, error: error.message || "Upload failed" };
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
      return { success: false, error: "Not authenticated" };
    }

    const { error } = await supabase
      .from("profiles")
      .update({ photos: photoUrls })
      .eq("id", user.id);

    if (error) {
      console.error("❌ Error updating photos:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Photos updated successfully");
    return { success: true };
  } catch (error: any) {
    console.error("❌ Failed to update photos:", error);
    return { success: false, error: error.message || "Unknown error" };
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
      return { success: false, error: "Invalid photo URL" };
    }

    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from("profile-photos")
      .remove([filePath]);

    if (error) {
      console.error("❌ Error deleting photo:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Photo deleted successfully");
    return { success: true };
  } catch (error: any) {
    console.error("❌ Failed to delete photo:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}
