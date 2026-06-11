/**
 * Photos API
 * 
 * Handles profile photo management (add, remove, list).
 * Single Responsibility: Photo operations only.
 */

import { supabase } from "@/src/config/supabase";
import {
  deleteProfilePhoto,
  uploadProfilePhoto,
} from "../../profile/api/profileApi";

const PHOTO_SIGN_IN_ERROR = "Please sign in before changing profile photos.";
const PHOTO_SAVE_ERROR =
  "Profile photo did not save. Check your connection and try again.";
const PHOTO_REMOVE_ERROR =
  "Profile photo could not be removed. Check your connection and try again.";

export async function saveProfilePhoto(uri: string): Promise<{ ok: true; data: { photos: string[] } }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error(PHOTO_SIGN_IN_ERROR);
    }

    // Get existing photos
    const { data: profile } = await supabase
      .from('profiles')
      .select('photos')
      .eq('id', user.id)
      .single();

    const uploadResult = await uploadProfilePhoto(uri, user.id);
    if (!uploadResult.success || !uploadResult.url) {
      throw new Error(PHOTO_SAVE_ERROR);
    }

    const existingPhotos = profile?.photos || [];
    const newPhotos = [uploadResult.url, ...existingPhotos].slice(0, 6);

    // Update photos array
    const { error } = await supabase
      .from('profiles')
      .update({
        photos: newPhotos,
        photos_completed: newPhotos.length > 0,
      })
      .eq('id', user.id);

    if (error) {
      await deleteProfilePhoto(uploadResult.url).catch(() => undefined);
      throw new Error(PHOTO_SAVE_ERROR);
    }

    return { ok: true, data: { photos: newPhotos } };
  } catch (error) {
    console.error("Error saving photo.");
    if (error instanceof Error && error.message === PHOTO_SIGN_IN_ERROR) {
      throw error;
    }

    throw new Error(PHOTO_SAVE_ERROR);
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
  } catch {
    console.error("Error fetching photos.");
    return [];
  }
}

export async function removeProfilePhoto(uri: string): Promise<{ ok: true; data: string[] }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error(PHOTO_SIGN_IN_ERROR);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('photos')
      .eq('id', user.id)
      .single();

    if (uri.includes("/profile-photos/")) {
      const deleteResult = await deleteProfilePhoto(uri);
      if (!deleteResult.success) {
        throw new Error(PHOTO_REMOVE_ERROR);
      }
    }

    const existingPhotos = profile?.photos || [];
    const newPhotos = existingPhotos.filter((p: string) => p !== uri);

    const { error } = await supabase
      .from('profiles')
      .update({
        photos: newPhotos,
        photos_completed: newPhotos.length > 0,
      })
      .eq('id', user.id);

    if (error) {
      throw new Error(PHOTO_REMOVE_ERROR);
    }

    return { ok: true, data: newPhotos };
  } catch (error) {
    console.error("Error removing photo.");
    if (error instanceof Error && error.message === PHOTO_SIGN_IN_ERROR) {
      throw error;
    }

    throw new Error(PHOTO_REMOVE_ERROR);
  }
}
