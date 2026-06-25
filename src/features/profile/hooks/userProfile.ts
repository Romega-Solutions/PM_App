import { useEffect, useState } from "react";
import {
  isBetaDemoModeEnabled,
} from "@/src/features/auth/demoMode";
import { getCurrentUserProfile, ProfileData } from "../api/profileApi";
import { getDemoProfileApiData } from "../data/demoProfileStore";

const PROFILE_LOAD_ERROR =
  "Profile could not be loaded. Check your connection and try again.";

export function useProfile(autoLoad = true) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<Error | null>(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isBetaDemoModeEnabled()) {
        setProfile(getDemoProfileApiData());
        return;
      }

      const data = await getCurrentUserProfile();

      if (data) {
        setProfile(data);
      } else {
        setError(new Error(PROFILE_LOAD_ERROR));
      }
    } catch {
      console.error("Error loading profile.");
      setError(new Error(PROFILE_LOAD_ERROR));
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    loadProfile();
  };

  useEffect(() => {
    if (autoLoad) {
      loadProfile();
    }
  }, [autoLoad]);

  return {
    profile,
    loading,
    error,
    refresh,
  };
}
