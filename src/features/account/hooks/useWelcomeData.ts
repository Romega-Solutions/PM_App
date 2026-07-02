import { useEffect, useState } from "react";
import { getBetaDemoProfile, useIsDemoSession } from "../../auth/demoMode";
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
  const isDemoMode = useIsDemoSession();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (isDemoMode) {
          const demoProfile = getBetaDemoProfile();
          const isFilipina = demoProfile.userType === "filipina";
          setData({
            firstName: demoProfile.firstName,
            userType: demoProfile.userType,
            basicInfo: {
              firstName: demoProfile.firstName,
              lastName: demoProfile.lastName,
              age: demoProfile.age,
              gender: isFilipina ? "female" : "male",
              userType: demoProfile.userType,
            },
            photos: [],
            location: {
              locationType: "manual",
              locationName: demoProfile.location,
              coordinates: null,
              timestamp: new Date(0).toISOString(),
            },
            verification: {
              selfieUri: "",
              documentUri: "",
              isVerified: false,
              mismatchReasons: [
                "Beta preview profile is not identity verified.",
              ],
            },
            preferences: {
              interestedIn: isFilipina ? "Men" : "Women",
              ageMin: 22,
              ageMax: 35,
              maxDistanceKm: 50,
              relationshipGoal: "long-term",
              userType: demoProfile.userType,
            },
            completionStats: {
              basicInfo: true,
              photos: false,
              location: true,
              verification: false,
              preferences: true,
            },
          });
          return;
        }

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
      } catch {
        console.error("Error fetching welcome data.");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isDemoMode]);

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
    } catch {
      console.error("Error reloading welcome data.");
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
