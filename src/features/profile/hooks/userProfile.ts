import { useCallback, useEffect, useState } from "react";
import {
  useIsDemoSession,
} from "@/src/features/auth/demoMode";
import { getCurrentUserProfile, ProfileData } from "../api/profileApi";
import { getDemoProfileApiData } from "../data/demoProfileStore";

const PROFILE_LOAD_ERROR =
  "Profile could not be loaded. Check your connection and try again.";

export function useProfile(autoLoad = true) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<Error | null>(null);
  const isDemoMode = useIsDemoSession();

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (isDemoMode) {
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
  }, [isDemoMode]);

  const refresh = () => {
    void loadProfile();
  };

  useEffect(() => {
    if (autoLoad) {
      void loadProfile();
    }
  }, [autoLoad, loadProfile]);

  return {
    profile,
    loading,
    error,
    refresh,
  };
}
