/**
 * Matching Store - Matching Preferences & Filters State
 *
 * PURPOSE: Store user's matching preferences and discovery filters
 *
 * SECURITY PRACTICES:
 * - Only stores user preferences (no sensitive data)
 * - Persisted locally for better UX
 *
 * SOLID PRINCIPLES:
 * - Single Responsibility: Only manages matching preferences
 * - Open/Closed: Easy to add new filter types
 *
 * @filesize ~130 lines (under 150 limit for stores)
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// ===== TYPES =====

export interface MatchFilters {
  ageRange: [number, number];
  maxDistance: number;
  interestedIn: string[];
  showVerifiedOnly: boolean;
  lookingFor: string[];
}

export interface MatchPreferences {
  filters: MatchFilters;
  lastUpdated: string;
}

type MatchingState = {
  // State
  filters: MatchFilters;
  isFilterActive: boolean;

  // Actions
  setFilters: (filters: Partial<MatchFilters>) => void;
  updateAgeRange: (range: [number, number]) => void;
  updateMaxDistance: (distance: number) => void;
  toggleVerifiedOnly: () => void;
  setInterestedIn: (interests: string[]) => void;
  setLookingFor: (lookingFor: string[]) => void;
  resetFilters: () => void;
  setFilterActive: (active: boolean) => void;
};

// Default filter values
const DEFAULT_FILTERS: MatchFilters = {
  ageRange: [18, 35],
  maxDistance: 50, // km
  interestedIn: [],
  showVerifiedOnly: false,
  lookingFor: [],
};

// ===== STORE =====

export const useMatchingStore = create<MatchingState>()(
  persist(
    (set) => ({
      // Initial State
      filters: DEFAULT_FILTERS,
      isFilterActive: false,

      // Set multiple filters at once
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
          isFilterActive: true,
        })),

      // Update age range filter
      updateAgeRange: (range) =>
        set((state) => ({
          filters: { ...state.filters, ageRange: range },
          isFilterActive: true,
        })),

      // Update max distance filter
      updateMaxDistance: (distance) =>
        set((state) => ({
          filters: { ...state.filters, maxDistance: distance },
          isFilterActive: true,
        })),

      // Toggle verified only filter
      toggleVerifiedOnly: () =>
        set((state) => ({
          filters: {
            ...state.filters,
            showVerifiedOnly: !state.filters.showVerifiedOnly,
          },
          isFilterActive: true,
        })),

      // Set interested in filter
      setInterestedIn: (interests) =>
        set((state) => ({
          filters: { ...state.filters, interestedIn: interests },
          isFilterActive: true,
        })),

      // Set looking for filter
      setLookingFor: (lookingFor) =>
        set((state) => ({
          filters: { ...state.filters, lookingFor },
          isFilterActive: true,
        })),

      // Reset to default filters
      resetFilters: () =>
        set({
          filters: DEFAULT_FILTERS,
          isFilterActive: false,
        }),

      // Set filter active state
      setFilterActive: (active) => set({ isFilterActive: active }),
    }),
    {
      name: "matching-storage",
      storage: createJSONStorage(() => AsyncStorage),

      // Persist all state
      partialize: (state) => ({
        filters: state.filters,
        isFilterActive: state.isFilterActive,
      }),
    },
  ),
);

// ===== HELPERS =====

/**
 * Get current filter values
 */
export const getCurrentFilters = (): MatchFilters => {
  return useMatchingStore.getState().filters;
};

/**
 * Check if any filters are active
 */
export const hasActiveFilters = (): boolean => {
  return useMatchingStore.getState().isFilterActive;
};

/**
 * Check if filters differ from defaults
 */
export const isFilterModified = (): boolean => {
  const { filters } = useMatchingStore.getState();
  return JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);
};
