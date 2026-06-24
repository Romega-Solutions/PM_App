import { useState } from "react";
import { isBetaDemoModeEnabled } from "@/src/features/auth/demoMode";
import { UpdateProfileData, updateUserProfile } from "../api/profileApi";

const PROFILE_UPDATE_ERROR =
  "Profile changes did not save. Check your connection and try again.";

export function useUpdateProfile() {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (data: UpdateProfileData): Promise<boolean> => {
    try {
      setUpdating(true);
      setError(null);

      if (isBetaDemoModeEnabled()) {
        return true;
      }

      const result = await updateUserProfile(data);

      if (!result.success) {
        setError(result.error || PROFILE_UPDATE_ERROR);
        return false;
      }

      return true;
    } catch {
      setError(PROFILE_UPDATE_ERROR);
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
