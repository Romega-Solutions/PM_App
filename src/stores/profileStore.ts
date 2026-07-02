/**
 * Profile Store - Current User Profile State
 *
 * PURPOSE: Manage the logged-in user's profile data
 *
 * SECURITY PRACTICES:
 * - Only stores non-sensitive profile data
 * - Profile data synchronized with database
 * - Cleared on sign out
 *
 * SOLID PRINCIPLES:
 * - Single Responsibility: Only manages current user profile
 * - Open/Closed: Easy to extend with new profile fields
 *
 * @filesize ~120 lines (under 150 limit for stores)
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "./persistStorage";

// ===== TYPES =====

export type Profile = {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  bio: string;
  location: string;
  city: string;
  country: string;
  photos: string[];
  interests: string[];
  lookingFor?: string;
  height?: number;
  education?: string;
  languages?: string[];
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

type ProfileState = {
  // State
  profile: Partial<Profile> | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setProfile: (profile: Partial<Profile>) => void;
  updateProfile: (updates: Partial<Profile>) => void;
  clearProfile: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
};

// ===== STORE =====

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      // Initial State
      profile: null,
      isLoading: false,
      error: null,

      // Set complete profile
      setProfile: (profile) =>
        set({
          profile,
          error: null,
        }),

      // Update profile fields
      updateProfile: (updates) =>
        set((state) => ({
          profile: state.profile
            ? {
                ...state.profile,
                ...updates,
                updatedAt: new Date().toISOString(),
              }
            : updates,
          error: null,
        })),

      // Clear profile (on sign out)
      clearProfile: () =>
        set({
          profile: null,
          error: null,
        }),

      // Set loading state
      setLoading: (loading) => set({ isLoading: loading }),

      // Set error message
      setError: (error) => set({ error }),
    }),
    {
      name: "profile-storage",
      storage: createJSONStorage(() => AsyncStorage),

      // Only persist profile data (no loading/error states)
      partialize: (state) => ({
        profile: state.profile,
      }),
    },
  ),
);

// ===== HELPERS =====

/**
 * Get current profile ID
 */
export const getCurrentProfileId = (): string | null => {
  return useProfileStore.getState().profile?.id || null;
};

/**
 * Check if profile is complete
 */
export const isProfileComplete = (): boolean => {
  const { profile } = useProfileStore.getState();
  if (!profile) return false;

  return !!(
    profile.firstName &&
    profile.lastName &&
    profile.age &&
    profile.bio &&
    profile.location &&
    profile.photos &&
    profile.photos.length >= 2
  );
};
