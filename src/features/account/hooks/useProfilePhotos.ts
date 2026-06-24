import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useState } from "react";
import { accountApi } from "../api/accountApi";

export const useProfilePhotos = () => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);

  const load = useCallback(async () => {
    setLoadingInitial(true);
    try {
      const existing = await accountApi.getProfilePhotos();
      setPhotos(existing ?? []);
    } finally {
      setLoadingInitial(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pickFromGallery = useCallback(async (): Promise<string | null> => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return null;
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
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return null;
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
    try {
      const res = await accountApi.saveProfilePhoto(uri);
      if (res?.ok) {
        setPhotos(res.data.photos);
        return res.data.photos;
      }
      throw new Error("Upload failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const removePhoto = useCallback(async (uri: string) => {
    setLoading(true);
    try {
      const res = await accountApi.removeProfilePhoto(uri);
      if (res?.ok) setPhotos(res.data);
      return res.data;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    photos,
    loading,
    loadingInitial,
    pickFromGallery,
    takePhoto,
    uploadPhoto,
    removePhoto,
    reload: load,
  } as const;
};
