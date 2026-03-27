import { useEffect, useState } from "react";
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

export const useWelcomeData = () => {
  const [data, setData] = useState<WelcomeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all data from Supabase
        const [basicInfo, photos, location, verification, preferences] =
          await Promise.all([
            accountApi.getBasicInfo(),
            accountApi.getProfilePhotos(),
            accountApi.getLocation(),
            accountApi.getVerification(),
            accountApi.getPreferences(),
          ]);

        if (basicInfo) {
          setData({
            firstName: basicInfo.firstName,
            userType: basicInfo.userType,
            basicInfo: basicInfo, // ✅ Added
            photos: photos, // ✅ Added
            location: location, // ✅ Added
            verification: verification, // ✅ Added
            preferences: preferences, // ✅ Added
            completionStats: {
              basicInfo: !!basicInfo,
              photos: (photos?.length ?? 0) > 0,
              location: !!location,
              verification: verification?.isVerified ?? false,
              preferences: !!preferences,
            },
          });
        } else {
          setData(null);
        }
      } catch (error) {
        console.error("❌ Error fetching welcome data:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const reload = async () => {
    setLoading(true);
    try {
      const [basicInfo, photos, location, verification, preferences] =
        await Promise.all([
          accountApi.getBasicInfo(),
          accountApi.getProfilePhotos(),
          accountApi.getLocation(),
          accountApi.getVerification(),
          accountApi.getPreferences(),
        ]);

      if (basicInfo) {
        setData({
          firstName: basicInfo.firstName,
          userType: basicInfo.userType,
          basicInfo: basicInfo, // ✅ Added
          photos: photos, // ✅ Added
          location: location, // ✅ Added
          verification: verification, // ✅ Added
          preferences: preferences, // ✅ Added
          completionStats: {
            basicInfo: !!basicInfo,
            photos: (photos?.length ?? 0) > 0,
            location: !!location,
            verification: verification?.isVerified ?? false,
            preferences: !!preferences,
          },
        });
      }
    } catch (error) {
      console.error("❌ Error reloading welcome data:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    reload,
  } as const;
};
