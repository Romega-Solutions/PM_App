import { useQuery } from "@tanstack/react-query";
import type { UserType } from "../../auth/api/authApi";
import {
  accountApi,
  type BasicInfoPayload,
  type PreferencesPayload,
  type SavedLocation,
  type VerificationData,
} from "../api/accountApi";

// ✅ Fixed: Match the structure you're using in WelcomeCompleteScreen
type WelcomeData = {
  firstName: string;
  userType: UserType;
  basicInfo: BasicInfoPayload | null;
  photos: string[];
  location: SavedLocation | null;
  verification: VerificationData | null;
  preferences: PreferencesPayload | null;
  completionStats: {
    basicInfo: boolean;
    photos: boolean;
    location: boolean;
    verification: boolean;
    preferences: boolean;
  };
};

export const welcomeKeys = {
  all: ["account", "welcome"] as const,
} as const;

export const useWelcomeData = () => {
  // ----- READ: 5 parallel Supabase reads → single useQuery -----
  const query = useQuery({
    queryKey: welcomeKeys.all,
    queryFn: async (): Promise<WelcomeData | null> => {
      const [basicInfo, photos, location, verification, preferences] =
        await Promise.all([
          accountApi.getBasicInfo(),
          accountApi.getProfilePhotos(),
          accountApi.getLocation(),
          accountApi.getVerification(),
          accountApi.getPreferences(),
        ]);

      if (!basicInfo) return null;

      return {
        firstName: basicInfo.firstName,
        userType: basicInfo.userType,
        basicInfo,
        photos,
        location,
        verification,
        preferences,
        completionStats: {
          basicInfo: !!basicInfo,
          photos: (photos?.length ?? 0) > 0,
          location: !!location,
          verification: verification?.isVerified ?? false,
          preferences: !!preferences,
        },
      };
    },
    // On error, treat the data as null (mirrors the previous catch behaviour)
    throwOnError: false,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    reload: query.refetch,
  } as const;
};
