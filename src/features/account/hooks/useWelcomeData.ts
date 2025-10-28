import {
  accountApi,
  BasicInfoPayload,
  PreferencesPayload,
  SavedLocation,
  VerificationData,
} from "@/src/features/account/api/accountApi";
import { useEffect, useState } from "react";

export type WelcomeData = {
  basicInfo: BasicInfoPayload | null;
  location: SavedLocation | null;
  preferences: PreferencesPayload | null;
  verification: VerificationData | null;
  photos: string[];
  userType: string | null;
  loading: boolean;
};

export const useWelcomeData = () => {
  const [data, setData] = useState<WelcomeData>({
    basicInfo: null,
    location: null,
    preferences: null,
    verification: null,
    photos: [],
    userType: null,
    loading: true,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [basicInfo, location, preferences, verification, photos] =
          await Promise.all([
            accountApi.getBasicInfo(),
            accountApi.getLocation(),
            accountApi.getPreferences(),
            accountApi.getVerification(),
            accountApi.getProfilePhotos(),
          ]);

        // Extract userType from basicInfo
        const userType = basicInfo?.userType ?? null;

        setData({
          basicInfo,
          location,
          preferences,
          verification,
          photos,
          userType,
          loading: false,
        });
      } catch (err) {
        console.error("Failed to load welcome data:", err);
        setData((prev) => ({ ...prev, loading: false }));
      }
    };

    load();
  }, []);

  return data;
};
