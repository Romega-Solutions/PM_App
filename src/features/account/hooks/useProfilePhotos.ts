import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useState } from "react";
import { isBetaDemoModeEnabled } from "@/src/features/auth/demoMode";
import { accountApi } from "../api/accountApi";

export const useProfilePhotos = () => {
  const isDemoMode = isBetaDemoModeEnabled();
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [error, setError] = useState<string>("");

  const load = useCallback(async () => {
    setLoadingInitial(true);
    setError("");

    if (isDemoMode) {
      setPhotos([]);
      setLoadingInitial(false);
      return;
    }

    try {
      const existing = await accountApi.getProfilePhotos();
      setPhotos(existing ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load your profile photos."
      );
    } finally {
      setLoadingInitial(false);
    }
  }, [isDemoMode]);

  useEffect(() => {
    load();
  }, [load]);

  const pickFromGallery = useCallback(async (): Promise<string | null> => {
    setError("");
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError("Photo library permission is required to add a profile photo.");
      return null;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });
    if (res.canceled) return null;
    return res.assets[0].uri;
  }, []);

  const takePhoto = useCallback(async (): Promise<string | null> => {
    setError("");
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setError("Camera permission is required to take a profile photo.");
      return null;
    }
    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });
    if (res.canceled) return null;
    return res.assets[0].uri;
  }, []);

  const uploadPhoto = useCallback(async (uri: string) => {
    setLoading(true);
    setError("");

    if (isDemoMode) {
      const nextPhotos = [uri, ...photos.filter((photo) => photo !== uri)].slice(0, 6);
      setPhotos(nextPhotos);
      setLoading(false);
      return nextPhotos;
    }

    try {
      const res = await accountApi.saveProfilePhoto(uri);
      if (res?.ok) {
        setPhotos(res.data.photos);
        return res.data.photos;
      }
      throw new Error("Upload failed");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save that photo."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isDemoMode, photos]);

  const removePhoto = useCallback(async (uri: string) => {
    setLoading(true);
    setError("");

    if (isDemoMode) {
      const nextPhotos = photos.filter((photo) => photo !== uri);
      setPhotos(nextPhotos);
      setLoading(false);
      return nextPhotos;
    }

    try {
      const res = await accountApi.removeProfilePhoto(uri);
      if (res?.ok) setPhotos(res.data);
      return res.data;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to remove that photo."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isDemoMode, photos]);

  return {
    photos,
    loading,
    loadingInitial,
    error,
    pickFromGallery,
    takePhoto,
    uploadPhoto,
    removePhoto,
    reload: load,
  } as const;
};
