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
const PHOTO_INPUT_ERROR = "Choose a profile photo and try again.";
const MAX_PROFILE_PHOTOS = 6;

function normalizePhotoUri(uri: string): string {
  const normalizedUri = uri.trim();

  if (!normalizedUri) {
    throw new Error(PHOTO_INPUT_ERROR);
  }

  return normalizedUri;
}

function normalizePhotoList(photos: unknown): string[] {
  if (!Array.isArray(photos)) {
    return [];
  }

  return photos.filter(
    (photo): photo is string => typeof photo === "string" && photo.trim().length > 0,
  );
}

function getProfilePhotoOwnerPath(photoUrl: string): string | null {
  const marker = "/profile-photos/";
  const markerIndex = photoUrl.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  const ownerPath = decodeURIComponent(photoUrl.slice(markerIndex + marker.length).split("?")[0])
    .replace(/^\/+/, "");

  if (!ownerPath || ownerPath.includes("..") || ownerPath.includes("\\")) {
    return null;
  }

  return ownerPath;
}

function isUserScopedProfilePhoto(photoUrl: string, userId: string): boolean {
  const ownerPath = getProfilePhotoOwnerPath(photoUrl.trim());

  return Boolean(ownerPath?.startsWith(`${userId}/`));
}

export async function saveProfilePhoto(uri: string): Promise<{ ok: true; data: { photos: string[] } }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error(PHOTO_SIGN_IN_ERROR);
    }

    const normalizedUri = normalizePhotoUri(uri);

    // Get existing photos
    const { data: profile } = await supabase
      .from('profiles')
      .select('photos')
      .eq('id', user.id)
      .single();

    const uploadResult = await uploadProfilePhoto(normalizedUri, user.id);
    if (!uploadResult.success || !uploadResult.url) {
      throw new Error(PHOTO_SAVE_ERROR);
    }

    const existingPhotos = normalizePhotoList(profile?.photos).filter(
      (photo) =>
        photo !== uploadResult.url && isUserScopedProfilePhoto(photo, user.id),
    );
    const newPhotos = [uploadResult.url, ...existingPhotos].slice(0, MAX_PROFILE_PHOTOS);

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
    if (error instanceof Error && error.message === PHOTO_SIGN_IN_ERROR) {
      throw new Error(PHOTO_SIGN_IN_ERROR);
    }

    if (error instanceof Error && error.message === PHOTO_INPUT_ERROR) {
      throw new Error(PHOTO_INPUT_ERROR);
    }

    console.error("Error saving photo.");
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

    const normalizedUri = normalizePhotoUri(uri);

    const { data: profile } = await supabase
      .from('profiles')
      .select('photos')
      .eq('id', user.id)
      .single();

    const existingPhotos = normalizePhotoList(profile?.photos).filter((photo) =>
      isUserScopedProfilePhoto(photo, user.id),
    );

    if (!existingPhotos.includes(normalizedUri)) {
      return { ok: true, data: existingPhotos };
    }

    if (normalizedUri.includes("/profile-photos/")) {
      const deleteResult = await deleteProfilePhoto(normalizedUri);
      if (!deleteResult.success) {
        throw new Error(PHOTO_REMOVE_ERROR);
      }
    }

    const newPhotos = existingPhotos.filter((photo) => photo !== normalizedUri);

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
    if (error instanceof Error && error.message === PHOTO_SIGN_IN_ERROR) {
      throw new Error(PHOTO_SIGN_IN_ERROR);
    }

    if (error instanceof Error && error.message === PHOTO_INPUT_ERROR) {
      throw new Error(PHOTO_INPUT_ERROR);
    }

    console.error("Error removing photo.");
    throw new Error(PHOTO_REMOVE_ERROR);
  }
}
