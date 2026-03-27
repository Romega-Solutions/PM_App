import { useEffect, useState } from "react";
import { getCurrentUserProfile, ProfileData } from "../api/profileApi";

export function useProfile(autoLoad = true) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<Error | null>(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getCurrentUserProfile();

      if (data) {
        setProfile(data);
      } else {
        setError(new Error("Failed to load profile"));
      }
    } catch (err) {
      console.error("❌ Error loading profile:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
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
