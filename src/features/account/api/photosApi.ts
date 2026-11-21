/**
 * Photos API
 *
 * Handles profile photo management (add, remove, list).
 * Single Responsibility: Photo operations only.
 *
 * profiles.photos stores storage paths; every list returned here is signed
 * display URLs (see profilePhotoUrls.ts). Inputs may be either.
 */

import { supabase } from "@/src/config/supabase";
import {
  deleteProfilePhoto,
  uploadProfilePhoto,
} from "../../profile/api/profileApi";
import {
  isOwnProfilePhoto,
  resolveProfilePhotoUrls,
  toProfilePhotoStoragePath,
} from "../../profile/api/profilePhotoUrls";

const PHOTO_SIGN_IN_ERROR = "Please sign in before changing profile photos.";
const PHOTO_SAVE_ERROR =
  "Profile photo did not save. Check your connection and try again.";
const PHOTO_REMOVE_ERROR =
  "Profile photo could not be removed. Check your connection and try again.";
const PHOTO_INPUT_ERROR = "Choose a profile photo and try again.";
const PHOTO_REJECTED_ERROR =
  "Photo was not accepted. Use a JPEG, PNG, WebP or HEIC photo under 10 MB.";
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

/** Own photos only, as unique storage paths, in order. */
function toOwnPhotoPaths(photos: unknown, userId: string): string[] {
  const paths: string[] = [];

  for (const photo of normalizePhotoList(photos)) {
    if (!isOwnProfilePhoto(photo, userId)) continue;
    const path = toProfilePhotoStoragePath(photo);
    if (path && !paths.includes(path)) paths.push(path);
  }

  return paths;
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
    if (!uploadResult.success || !uploadResult.path) {
      throw new Error(
        uploadResult.error === PHOTO_REJECTED_ERROR ? PHOTO_REJECTED_ERROR : PHOTO_SAVE_ERROR,
      );
    }

    const newPath = uploadResult.path;
    const existingPaths = toOwnPhotoPaths(profile?.photos, user.id).filter(
      (path) => path !== newPath,
    );
    const newPhotos = [newPath, ...existingPaths].slice(0, MAX_PROFILE_PHOTOS);

    // Update photos array
    const { error } = await supabase
      .from('profiles')
      .update({
        photos: newPhotos,
        photos_completed: newPhotos.length > 0,
      })
      .eq('id', user.id);

    if (error) {
      await deleteProfilePhoto(newPath).catch(() => undefined);
      throw new Error(PHOTO_SAVE_ERROR);
    }

    return { ok: true, data: { photos: await resolveProfilePhotoUrls(newPhotos) } };
  } catch (error) {
    if (error instanceof Error && error.message === PHOTO_SIGN_IN_ERROR) {
      throw new Error(PHOTO_SIGN_IN_ERROR);
    }

    if (error instanceof Error && error.message === PHOTO_INPUT_ERROR) {
      throw new Error(PHOTO_INPUT_ERROR);
    }

    if (error instanceof Error && error.message === PHOTO_REJECTED_ERROR) {
      throw new Error(PHOTO_REJECTED_ERROR);
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

    return await resolveProfilePhotoUrls(data.photos || []);
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
    const removedPath = toProfilePhotoStoragePath(normalizedUri);

    const { data: profile } = await supabase
      .from('profiles')
      .select('photos')
      .eq('id', user.id)
      .single();

    const existingPaths = toOwnPhotoPaths(profile?.photos, user.id);

    if (!removedPath || !existingPaths.includes(removedPath)) {
      return { ok: true, data: await resolveProfilePhotoUrls(existingPaths) };
    }

    const deleteResult = await deleteProfilePhoto(removedPath);
    if (!deleteResult.success) {
      throw new Error(PHOTO_REMOVE_ERROR);
    }

    const newPhotos = existingPaths.filter((path) => path !== removedPath);

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

    return { ok: true, data: await resolveProfilePhotoUrls(newPhotos) };
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
