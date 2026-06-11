import { create } from "zustand";
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

export const useSignupStore = create<SignupState>()((set, get) => ({
  signupData: null,

  saveSignupData: (data) => {
    const signupData: SignupData = {
      ...data,
      timestamp: new Date().toISOString(),
    };

    set({ signupData });
  },

  getSignupData: () => {
    const { signupData } = get();

    if (!signupData) {
      return null;
    }

    // Check if expired (24 hours)
    const timestamp = new Date(signupData.timestamp);
    const hoursSinceSignup =
      (Date.now() - timestamp.getTime()) / (1000 * 60 * 60);

    if (hoursSinceSignup > 24) {
      set({ signupData: null });
      return null;
    }

    return signupData;
  },

  clearSignupData: () => {
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
}));
