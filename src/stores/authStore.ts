import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { UserType } from "../features/auth/api/authApi";

type User = {
  id: string;
  email: string;
  firstName: string;
  userType: UserType;
};

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User) => void;
  clearUser: () => void;
  updateUser: (updates: Partial<User>) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: true,
        }),

      clearUser: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
