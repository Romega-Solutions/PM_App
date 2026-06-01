import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateProfileData, updateUserProfile } from "../api/profileApi";
import { profileKeys } from "./useProfile";

export function useUpdateProfile() {
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: UpdateProfileData): Promise<boolean> => {
      const result = await updateUserProfile(data);
      if (!result.success) {
        throw new Error(result.error || "Failed to update profile");
      }
      return true;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: profileKeys.me });
    },
    onError: (err: Error) => {
      if (__DEV__) {
        console.warn("[useUpdateProfile] update failed:", err.message);
      }
    },
  });

  /**
   * Wraps mutateAsync with a boolean return so consumers don't need to
   * catch — preserves the original `updateProfile(data) => Promise<boolean>`
   * public contract.
   */
  const updateProfile = async (data: UpdateProfileData): Promise<boolean> => {
    try {
      return await mutation.mutateAsync(data);
    } catch {
      return false;
    }
  };

  return {
    updateProfile,
    updating: mutation.isPending,
    error: mutation.error ? (mutation.error as Error).message : null,
  };
}
