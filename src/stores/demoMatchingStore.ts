import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type DemoMatchingState = {
  passedProfileIds: string[];
  matchedProfileIds: string[];
  hiddenProfileIds: string[];
  recordPass: (profileId: string) => void;
  recordMatch: (profileId: string) => void;
  hideProfile: (profileId: string) => void;
  resetDemoMatching: () => void;
};

function appendUnique(items: string[] | undefined, item: string): string[] {
  const current = items || [];
  return current.includes(item) ? current : [...current, item];
}

export const useDemoMatchingStore = create<DemoMatchingState>()(
  persist(
    (set) => ({
      passedProfileIds: [],
      matchedProfileIds: [],
      hiddenProfileIds: [],

      recordPass: (profileId) =>
        set((state) => ({
          passedProfileIds: appendUnique(state.passedProfileIds, profileId),
        })),

      recordMatch: (profileId) =>
        set((state) => ({
          matchedProfileIds: appendUnique(state.matchedProfileIds, profileId),
          passedProfileIds: (state.passedProfileIds || []).filter(
            (id) => id !== profileId,
          ),
        })),

      hideProfile: (profileId) =>
        set((state) => ({
          hiddenProfileIds: appendUnique(state.hiddenProfileIds, profileId),
        })),

      resetDemoMatching: () =>
        set({
          passedProfileIds: [],
          matchedProfileIds: [],
          hiddenProfileIds: [],
        }),
    }),
    {
      name: "demo-matching-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
