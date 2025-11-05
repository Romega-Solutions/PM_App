import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type Profile = {
  firstName: string;
  lastName: string;
  age: number;
  bio: string;
  location: string;
  photos: string[];
  interests: string[];
};

type ProfileState = {
  profile: Partial<Profile>;

  // Actions
  updateProfile: (updates: Partial<Profile>) => void;
  clearProfile: () => void;
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: {},

      updateProfile: (updates) =>
        set((state) => ({
          profile: { ...state.profile, ...updates },
        })),

      clearProfile: () => set({ profile: {} }),
    }),
    {
      name: "profile-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
