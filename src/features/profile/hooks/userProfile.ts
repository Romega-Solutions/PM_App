import { useEffect, useState } from "react";
import {
  BETA_DEMO_PROFILE,
  isBetaDemoModeEnabled,
} from "@/src/features/auth/demoMode";
import { getCurrentUserProfile, ProfileData } from "../api/profileApi";

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
        setProfile({
          id: BETA_DEMO_PROFILE.id,
          email: "beta.preview@pinaymate.demo",
          first_name: BETA_DEMO_PROFILE.firstName,
          last_name: BETA_DEMO_PROFILE.lastName,
          age: BETA_DEMO_PROFILE.age,
          user_type: BETA_DEMO_PROFILE.userType,
          occupation: "Product demo reviewer",
          education: "Demo University",
          location_name: BETA_DEMO_PROFILE.location,
          photos: BETA_DEMO_PROFILE.photoUri ? [BETA_DEMO_PROFILE.photoUri] : [],
          is_verified: BETA_DEMO_PROFILE.isVerified,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
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
