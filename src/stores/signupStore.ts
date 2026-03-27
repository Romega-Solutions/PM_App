import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { UserType } from "../features/auth/api/authApi";

type SignupData = {
  email: string;
  firstName: string;
  userType: UserType;
  timestamp: string;
};

type SignupState = {
  signupData: SignupData | null;

  // Actions
  saveSignupData: (data: Omit<SignupData, "timestamp">) => void;
  getSignupData: () => SignupData | null;
  clearSignupData: () => void;
  isExpired: () => boolean;
};

export const useSignupStore = create<SignupState>()(
  persist(
    (set, get) => ({
      signupData: null,

      saveSignupData: (data) => {
        const signupData: SignupData = {
          ...data,
          timestamp: new Date().toISOString(),
        };

        console.log("💾 Signup data saved to Zustand:", signupData);
        set({ signupData });
      },

      getSignupData: () => {
        const { signupData } = get();

        if (!signupData) {
          console.log("ℹ️ No signup data in store");
          return null;
        }

        // Check if expired (24 hours)
        const timestamp = new Date(signupData.timestamp);
        const hoursSinceSignup =
          (Date.now() - timestamp.getTime()) / (1000 * 60 * 60);

        if (hoursSinceSignup > 24) {
          console.log("⏰ Signup data expired (>24h), clearing...");
          set({ signupData: null });
          return null;
        }

        console.log("📦 Retrieved signup data from store:", signupData);
        return signupData;
      },

      clearSignupData: () => {
        console.log("🗑️ Signup data cleared from store");
        set({ signupData: null });
      },

      isExpired: () => {
        const { signupData } = get();
        if (!signupData) return true;

        const timestamp = new Date(signupData.timestamp);
        const hoursSinceSignup =
          (Date.now() - timestamp.getTime()) / (1000 * 60 * 60);

        return hoursSinceSignup > 24;
      },
    }),
    {
      name: "signup-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
