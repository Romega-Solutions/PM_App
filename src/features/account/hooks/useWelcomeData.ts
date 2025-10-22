import { useEffect, useState } from "react";
import { accountApi, BasicInfoPayload, SavedLocation, PreferencesPayload, VerificationData } from "@/src/features/account/api/accountApi";

export type WelcomeData = {
  basicInfo: BasicInfoPayload | null;
  location: SavedLocation | null;
  preferences: PreferencesPayload | null;
  verification: VerificationData | null;
  photos: string[];
  loading: boolean;
};

export const useWelcomeData = () => {
  const [data, setData] = useState<WelcomeData>({
    basicInfo: null,
    location: null,
    preferences: null,
    verification: null,
    photos: [],
    loading: true,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [basicInfo, location, preferences, verification, photos] = await Promise.all([
          accountApi.getBasicInfo(),
          accountApi.getLocation(),
          accountApi.getPreferences(),
          accountApi.getVerification(),
          accountApi.getProfilePhotos(),
        ]);

        setData({
          basicInfo,
          location,
          preferences,
          verification,
          photos,
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