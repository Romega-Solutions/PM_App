/**
 * Photos API
 *
 * Handles profile photo management (add, remove, list).
 * Single Responsibility: Photo operations only.
 */

import { supabase } from "@/src/config/supabase";

export async function saveProfilePhoto(
  uri: string,
): Promise<{ ok: true; data: { photos: string[] } }> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Not authenticated");
    }

    // Get existing photos
    const { data: profile } = await supabase
      .from("profiles")
      .select("photos")
      .eq("id", user.id)
      .single();

    const existingPhotos = profile?.photos || [];
    const newPhotos = [uri, ...existingPhotos].slice(0, 6);

    // Update photos array
    const { error } = await supabase
      .from("profiles")
      .update({
        photos: newPhotos,
        photos_completed: newPhotos.length > 0,
      })
      .eq("id", user.id);

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
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return [];
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("photos")
      .eq("id", user.id)
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

export async function removeProfilePhoto(
  uri: string,
): Promise<{ ok: true; data: string[] }> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Not authenticated");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("photos")
      .eq("id", user.id)
      .single();

    const existingPhotos = profile?.photos || [];
    const newPhotos = existingPhotos.filter((p: string) => p !== uri);

    const { error } = await supabase
      .from("profiles")
      .update({
        photos: newPhotos,
        photos_completed: newPhotos.length > 0,
      })
      .eq("id", user.id);

    if (error) throw error;

    console.log("✅ Removed photo from Supabase");
    return { ok: true, data: newPhotos };
  } catch (error) {
    console.error("❌ Error removing photo:", error);
    throw error;
  }
}
