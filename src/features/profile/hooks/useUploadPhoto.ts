import { supabase } from "@/src/config/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
    deleteProfilePhoto,
    updateProfilePhotos,
    uploadProfilePhoto,
} from "../api/profileApi";
import { profileKeys } from "./useProfile";

export function useUploadPhoto() {
  // Progress is client-only UI state — TanStack Query has no upload-progress
  // model, so we keep it in local useState.
  const [progress, setProgress] = useState(0);
  const qc = useQueryClient();

  /**
   * Pick image from gallery, upload to Supabase Storage, and update the
   * profile's photos array. Returns { success, url? } matching the original
   * contract; throws are caught internally so consumers get a boolean signal.
   */
  const uploadMutation = useMutation({
    mutationFn: async (
      existingPhotos: string[],
    ): Promise<{ success: boolean; url?: string }> => {
      // Request permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        throw new Error("Permission to access gallery is required");
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) {
        // Cancellation is not an error — signal via success: false without throwing
        return { success: false };
      }

      const imageUri = result.assets[0].uri;

      setProgress(0);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Not authenticated");
      }

      // Simulate progress for UX (client-side only — not a server concept)
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const uploadResult = await uploadProfilePhoto(imageUri, user.id);

      clearInterval(progressInterval);
      setProgress(100);

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || "Upload failed");
      }

      // Add new photo to the beginning of the array
      const updatedPhotos = [uploadResult.url, ...existingPhotos];

      const updateResult = await updateProfilePhotos(updatedPhotos);

      if (!updateResult.success) {
        throw new Error(updateResult.error || "Failed to update profile");
      }

      return { success: true, url: uploadResult.url };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: profileKeys.me });
    },
    onError: (err: Error) => {
      if (__DEV__) {
        console.warn("[useUploadPhoto] upload failed:", err.message);
      }
    },
    onSettled: () => {
      setProgress(0);
    },
  });

  /**
   * Delete a photo from Supabase Storage and remove it from the profile's
   * photos array. Returns boolean matching the original contract.
   */
  const deleteMutation = useMutation({
    mutationFn: async ({
      photoUrl,
      existingPhotos,
    }: {
      photoUrl: string;
      existingPhotos: string[];
    }): Promise<boolean> => {
      const deleteResult = await deleteProfilePhoto(photoUrl);

      if (!deleteResult.success) {
        throw new Error(deleteResult.error || "Failed to delete photo");
      }

      const updatedPhotos = existingPhotos.filter((url) => url !== photoUrl);
      const updateResult = await updateProfilePhotos(updatedPhotos);

      if (!updateResult.success) {
        throw new Error(updateResult.error || "Failed to update profile");
      }

      return true;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: profileKeys.me });
    },
    onError: (err: Error) => {
      if (__DEV__) {
        console.warn("[useUploadPhoto] delete failed:", err.message);
      }
    },
  });

  /**
   * Public wrapper — preserves original signature:
   *   pickAndUploadPhoto(existingPhotos?) => Promise<{ success: boolean; url?: string }>
   */
  const pickAndUploadPhoto = async (
    existingPhotos: string[] = [],
  ): Promise<{ success: boolean; url?: string }> => {
    try {
      return await uploadMutation.mutateAsync(existingPhotos);
    } catch {
      return { success: false };
    }
  };

  /**
   * Public wrapper — preserves original signature:
   *   deletePhoto(photoUrl, existingPhotos) => Promise<boolean>
   */
  const deletePhoto = async (
    photoUrl: string,
    existingPhotos: string[],
  ): Promise<boolean> => {
    try {
      return await deleteMutation.mutateAsync({ photoUrl, existingPhotos });
    } catch {
      return false;
    }
  };

  // Derive a combined error string from whichever mutation last errored,
  // matching the original single `error: string | null` shape.
  const errorObj = uploadMutation.error ?? deleteMutation.error ?? null;
  const error = errorObj ? (errorObj as Error).message : null;

  return {
    pickAndUploadPhoto,
    deletePhoto,
    uploading: uploadMutation.isPending || deleteMutation.isPending,
    progress,
    error,
  };
}
