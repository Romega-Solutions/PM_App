import { supabase } from "@/src/config/supabase";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
    deleteProfilePhoto,
    updateProfilePhotos,
    uploadProfilePhoto,
} from "../api/profileApi";

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
        setError("Permission to access gallery is required");
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
        setError("Not authenticated");
        return { success: false };
      }

      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const uploadResult = await uploadProfilePhoto(imageUri, user.id);

      clearInterval(progressInterval);
      setProgress(100);

      if (!uploadResult.success || !uploadResult.url) {
        setError(uploadResult.error || "Upload failed");
        return { success: false };
      }

      // Add new photo to the beginning of the array
      const updatedPhotos = [uploadResult.url, ...existingPhotos];

      // Update profile with new photos array
      const updateResult = await updateProfilePhotos(updatedPhotos);

      if (!updateResult.success) {
        setError(updateResult.error || "Failed to update profile");
        return { success: false };
      }

      return { success: true, url: uploadResult.url };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
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
        setError(deleteResult.error || "Failed to delete photo");
        return false;
      }

      // Remove from profile photos array
      const updatedPhotos = existingPhotos.filter((url) => url !== photoUrl);
      const updateResult = await updateProfilePhotos(updatedPhotos);

      if (!updateResult.success) {
        setError(updateResult.error || "Failed to update profile");
        return false;
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
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
