import { supabase } from "@/src/config/supabase";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";
import {
  PROFILE_PHOTOS_BUCKET,
  resolveProfilePhotoUrl,
  toProfilePhotoStoragePath,
  withSignedProfilePhotos,
} from "./profilePhotoUrls";

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

type ProfileAction = "update" | "upload" | "uploadRejected" | "photos" | "delete";
const MAX_PROFILE_PHOTO_BYTES = 6 * 1024 * 1024;
const MAX_PROFILE_PHOTOS = 6;
const PROFILE_PHOTO_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
};
const PROFILE_PHOTO_EXTENSIONS_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
};
const PROFILE_PHOTO_INGEST_FUNCTION = "profile-photo-ingest";
const USER_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getSafeProfileError(action: ProfileAction): string {
  if (action === "upload") {
    return "Photo upload failed. Check your connection and try again.";
  }

  if (action === "uploadRejected") {
    return "Photo was not accepted. Use a JPEG, PNG, WebP or HEIC photo under 10 MB.";
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

function getProfilePhotoUploadType(uri: string, mimeType?: string) {
  const cleanUri = uri.split("?")[0].split("#")[0];
  const extension = cleanUri.split(".").pop()?.toLowerCase() ?? "";
  const contentType = PROFILE_PHOTO_TYPES[extension];

  if (contentType) {
    return {
      extension: extension === "jpeg" ? "jpg" : extension,
      contentType,
    };
  }

  const normalizedMimeType = mimeType?.split(";")[0]?.trim().toLowerCase() ?? "";
  const mimeExtension = PROFILE_PHOTO_EXTENSIONS_BY_TYPE[normalizedMimeType];

  if (!mimeExtension) {
    throw new Error("Unsupported profile photo type");
  }

  return { extension: mimeExtension, contentType: normalizedMimeType };
}

async function assertProfilePhotoUpload(uri: string, webBlob?: Blob) {
  const normalizedUri = uri.trim();

  if (!normalizedUri) {
    throw new Error("Profile photo URI is required");
  }

  if (Platform.OS === "web") {
    if (!webBlob) {
      throw new Error("Profile photo file does not exist");
    }

    if (webBlob.size <= 0 || webBlob.size > MAX_PROFILE_PHOTO_BYTES) {
      throw new Error("Profile photo size is not allowed");
    }

    const uploadType = getProfilePhotoUploadType(normalizedUri, webBlob.type);
    return uploadType;
  }

  const uploadType = getProfilePhotoUploadType(normalizedUri);
  const fileInfo = await FileSystem.getInfoAsync(normalizedUri);

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
 * Turns the UI's photo list (signed URLs, old public URLs or paths) into the
 * storage paths saved in profiles.photos.
 */
function normalizeUserScopedProfilePhotoPaths(
  photoUrls: string[],
  userId: string,
): string[] {
  if (!USER_ID_PATTERN.test(userId) || photoUrls.length > MAX_PROFILE_PHOTOS) {
    throw new Error("Invalid profile photo list");
  }

  const photoPaths: string[] = [];

  for (const photoUrl of photoUrls) {
    if (!photoUrl.trim()) {
      continue;
    }

    const filePath = toProfilePhotoStoragePath(photoUrl);

    if (!filePath || !filePath.startsWith(`${userId}/`)) {
      throw new Error("Invalid profile photo owner");
    }

    if (!photoPaths.includes(filePath)) {
      photoPaths.push(filePath);
    }
  }

  return photoPaths;
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

    return data ? await withSignedProfilePhotos(data as ProfileData) : null;
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

function getIngestErrorStatus(error: unknown): number | null {
  const context = (error as { context?: { status?: unknown } } | null)?.context;
  return typeof context?.status === "number" ? context.status : null;
}

/**
 * Upload a profile photo through the profile-photo-ingest Edge Function.
 *
 * The function is the only writer to the private profile-photos bucket: it
 * checks size (10 MB) and the real file type, strips EXIF/GPS and stores the
 * file in the signed-in member's folder. Returns the storage `path` (what
 * profiles.photos stores) and a short-lived signed `url` for display.
 */
export async function uploadProfilePhoto(
  uri: string,
  userId: string,
): Promise<{ success: boolean; url?: string; path?: string; error?: string }> {
  try {
    if (!USER_ID_PATTERN.test(userId)) {
      return { success: false, error: getSafeProfileError("upload") };
    }

    const normalizedUri = uri.trim();

    // Read file payload
    let fileBody: Blob | ArrayBuffer;
    let webBlob: Blob | undefined;
    if (Platform.OS === "web") {
      const response = await fetch(normalizedUri);
      if (!response.ok) {
        throw new Error("Profile photo file does not exist");
      }

      webBlob = await response.blob();
      fileBody = webBlob;
    } else {
      const base64 = await FileSystem.readAsStringAsync(normalizedUri, {
        encoding: "base64",
      });
      fileBody = decode(base64);
    }

    // Client checks are a quick first pass; the Edge Function enforces the rules.
    const { contentType } = await assertProfilePhotoUpload(normalizedUri, webBlob);

    const { data, error } = await supabase.functions.invoke(
      PROFILE_PHOTO_INGEST_FUNCTION,
      {
        body: fileBody,
        headers: { "Content-Type": contentType },
      },
    );

    if (error) {
      const status = getIngestErrorStatus(error);
      console.error("Profile photo upload failed.");
      return {
        success: false,
        error: getSafeProfileError(
          status === 413 || status === 415 || status === 422
            ? "uploadRejected"
            : "upload",
        ),
      };
    }

    const returnedPath = (data as { path?: unknown } | null)?.path;
    const path =
      typeof returnedPath === "string" ? toProfilePhotoStoragePath(returnedPath) : null;

    if (!path || !path.startsWith(`${userId}/`)) {
      console.error("Profile photo upload returned an unexpected path.");
      return { success: false, error: getSafeProfileError("upload") };
    }

    const url = (await resolveProfilePhotoUrl(path)) ?? undefined;

    return { success: true, url, path };
  } catch {
    console.error("Failed to upload photo.");
    return { success: false, error: getSafeProfileError("upload") };
  }
}

/**
 * Update user's photos array in profile.
 * Accepts display URLs or paths; stores storage paths.
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

    const photoPaths = normalizeUserScopedProfilePhotoPaths(photoUrls, user.id);

    const { error } = await supabase
      .from("profiles")
      .update({
        photos: photoPaths,
        photos_completed: photoPaths.length > 0,
      })
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
 * Delete profile photo from storage.
 * Accepts a path, a signed URL or an old public URL.
 */
export async function deleteProfilePhoto(
  photoUrl: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const filePath = toProfilePhotoStoragePath(photoUrl);

    if (!filePath) {
      return { success: false, error: getSafeProfileError("delete") };
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.id || !filePath.startsWith(`${user.id}/`)) {
      return { success: false, error: getSafeProfileError("delete") };
    }

    const { error } = await supabase.storage
      .from(PROFILE_PHOTOS_BUCKET)
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
