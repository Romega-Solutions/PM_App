import * as ImagePicker from "expo-image-picker";
import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { accountApi } from "../api/accountApi";

export const photosKeys = {
  all: ["account", "photos"] as const,
} as const;

export const useProfilePhotos = () => {
  const qc = useQueryClient();

  // ----- READ: server state → useQuery -----
  const query = useQuery({
    queryKey: photosKeys.all,
    queryFn: async () => {
      const existing = await accountApi.getProfilePhotos();
      return existing ?? [];
    },
  });

  // ----- WRITE: upload → useMutation -----
  const uploadMutation = useMutation({
    mutationFn: async (uri: string) => {
      const res = await accountApi.saveProfilePhoto(uri);
      if (!res?.ok) throw new Error("Upload failed");
      return res.data.photos as string[];
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: photosKeys.all });
    },
  });

  // ----- WRITE: remove → useMutation -----
  const removeMutation = useMutation({
    mutationFn: async (uri: string) => {
      const res = await accountApi.removeProfilePhoto(uri);
      return res?.data as string[];
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: photosKeys.all });
    },
  });

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

  const uploadPhoto = useCallback(
    (uri: string) => uploadMutation.mutateAsync(uri),
    [uploadMutation]
  );

  const removePhoto = useCallback(
    (uri: string) => removeMutation.mutateAsync(uri),
    [removeMutation]
  );

  // loading is true while either write mutation is in-flight
  const loading = uploadMutation.isPending || removeMutation.isPending;

  return {
    photos: query.data ?? [],
    loading,
    loadingInitial: query.isLoading,
    pickFromGallery,
    takePhoto,
    uploadPhoto,
    removePhoto,
    reload: query.refetch,
  } as const;
};
