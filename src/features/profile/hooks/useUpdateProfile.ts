import { useState } from "react";
import { UpdateProfileData, updateUserProfile } from "../api/profileApi";

export function useUpdateProfile() {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (data: UpdateProfileData): Promise<boolean> => {
    try {
      setUpdating(true);
      setError(null);

      const result = await updateUserProfile(data);

      if (!result.success) {
        setError(result.error || "Failed to update profile");
        return false;
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return false;
    } finally {
      setUpdating(false);
    }
  };

  return {
    updateProfile,
    updating,
    error,
  };
}
