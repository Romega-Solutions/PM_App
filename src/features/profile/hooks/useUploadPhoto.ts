import { supabase } from "@/src/config/supabase";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
    deleteProfilePhoto,
    updateProfilePhotos,
    uploadProfilePhoto,
} from "../api/profileApi";

const PHOTO_PERMISSION_ERROR =
  "Photo library permission is required to choose a profile photo.";
const PHOTO_SIGN_IN_ERROR = "Please sign in before changing profile photos.";
const PHOTO_UPLOAD_ERROR =
  "Photo upload failed. Check your connection and try again.";
const PHOTO_DELETE_ERROR =
  "Photo could not be removed. Check your connection and try again.";

export function useUploadPhoto() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * Pick image from gallery and upload
   */
  const pickAndUploadPhoto = async (
    existingPhotos: string[] = [],
  ): Promise<{ success: boolean; url?: string }> => {
    try {
      // Request permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        setError(PHOTO_PERMISSION_ERROR);
        return { success: false };
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) {
        return { success: false };
      }

      const imageUri = result.assets[0].uri;

      // Upload photo
      setUploading(true);
      setError(null);
      setProgress(0);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError(PHOTO_SIGN_IN_ERROR);
        return { success: false };
      }

      // Show optimistic progress while the storage SDK completes the upload.
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const uploadResult = await uploadProfilePhoto(imageUri, user.id);

      clearInterval(progressInterval);
      setProgress(100);

      if (!uploadResult.success || !uploadResult.url) {
        setError(uploadResult.error || PHOTO_UPLOAD_ERROR);
        return { success: false };
      }

      // Add new photo to the beginning of the array
      const updatedPhotos = [uploadResult.url, ...existingPhotos];

      // Update profile with new photos array
      const updateResult = await updateProfilePhotos(updatedPhotos);

      if (!updateResult.success) {
        setError(updateResult.error || PHOTO_UPLOAD_ERROR);
        return { success: false };
      }

      return { success: true, url: uploadResult.url };
    } catch {
      setError(PHOTO_UPLOAD_ERROR);
      return { success: false };
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  /**
   * Delete a photo from storage and profile
   */
  const deletePhoto = async (
    photoUrl: string,
    existingPhotos: string[],
  ): Promise<boolean> => {
    try {
      setError(null);

      // Remove from storage
      const deleteResult = await deleteProfilePhoto(photoUrl);

      if (!deleteResult.success) {
        setError(deleteResult.error || PHOTO_DELETE_ERROR);
        return false;
      }

      // Remove from profile photos array
      const updatedPhotos = existingPhotos.filter((url) => url !== photoUrl);
      const updateResult = await updateProfilePhotos(updatedPhotos);

      if (!updateResult.success) {
        setError(updateResult.error || PHOTO_DELETE_ERROR);
        return false;
      }

      return true;
    } catch {
      setError(PHOTO_DELETE_ERROR);
      return false;
    }
  };

  return {
    pickAndUploadPhoto,
    deletePhoto,
    uploading,
    progress,
    error,
  };
}
