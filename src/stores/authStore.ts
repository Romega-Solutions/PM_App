/**
 * Auth Store - Global Authentication State Management
 *
 * PURPOSE: Centralized auth state using Zustand with persistence
 *
 * SECURITY PRACTICES:
 * - Session tokens use SecureStore on native builds and web-compatible storage on web
 * - Auto token refresh before expiry
 * - Proper cleanup on sign out
 * - No sensitive data persisted (passwords, etc.)
 *
 * SOLID PRINCIPLES:
 * - Single Responsibility: Only manages authentication state
 * - Dependency Inversion: Depends on Supabase abstraction
 *
 * @filesize ~150 lines (under 150 limit for stores)
 */

import { supabase } from "@/src/config/supabase";
import { authStorage } from "@/src/config/authStorage";
import {
  getPersistedDemoUserType,
  isBetaDemoModeEnabled,
  type DemoPreviewUserType,
} from "@/src/features/auth/demoMode";
import type { Session } from "@supabase/supabase-js";
import { create } from "zustand";
import { createJSONStorage, persist } from "./persistStorage";
import type { UserType } from "../features/auth/api/authApi";

type User = {
  id: string;
  email: string;
  firstName: string;
  userType: UserType;
};

type AuthState = {
  // State
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  demoUserType: DemoPreviewUserType;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  setUser: (user: User) => void;
  setSession: (session: Session | null) => void;
  clearUser: () => void;
  updateUser: (updates: Partial<User>) => void;
  startDemoSession: (userType?: DemoPreviewUserType) => void;
  endDemoSession: () => void;
  initialize: () => Promise<void>;
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      session: null,
      isAuthenticated: false,
      isDemoMode: false,
      demoUserType: getPersistedDemoUserType(),
      isLoading: false,
      isInitialized: false,

      // Set user and update auth state
      setUser: (user) =>
        set({
          user,
          isAuthenticated: true,
          isDemoMode: false,
        }),

      // Set session from Supabase
      setSession: (session) =>
        set({
          session,
          isAuthenticated: !!session,
          isDemoMode: session ? false : get().isDemoMode,
        }),

      // Clear user on sign out
      clearUser: () =>
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          isDemoMode: false,
        }),

      // Update user details
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      startDemoSession: (userType = "foreigner") => {
        if (!isBetaDemoModeEnabled()) return;

        set({
          user: null,
          session: null,
          isAuthenticated: false,
          isDemoMode: true,
          demoUserType: userType,
          isInitialized: true,
          isLoading: false,
        });
      },

      endDemoSession: () =>
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          isDemoMode: false,
          demoUserType: "foreigner",
        }),

      // Initialize auth (restore session on app start)
      initialize: async () => {
        try {
          set({ isLoading: true });
          const keepDemoMode = get().isDemoMode && isBetaDemoModeEnabled();
          const demoUserType = get().demoUserType || getPersistedDemoUserType();

          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();

          if (error) {
            console.error("Failed to restore auth session.");
            set({
              session: null,
              user: null,
              isAuthenticated: false,
              isDemoMode: keepDemoMode,
              demoUserType,
              isInitialized: true,
              isLoading: false,
            });
            return;
          }

          if (session) {
            set({
              session,
              isAuthenticated: true,
              isDemoMode: false,
              demoUserType,
              isInitialized: true,
              isLoading: false,
            });
          } else {
            set({
              session: null,
              user: null,
              isAuthenticated: false,
              isDemoMode: keepDemoMode,
              demoUserType,
              isInitialized: true,
              isLoading: false,
            });
          }
        } catch {
          console.error("Auth initialization failed.");
          set({
            session: null,
            user: null,
            isAuthenticated: false,
            isDemoMode: get().isDemoMode && isBetaDemoModeEnabled(),
            demoUserType: get().demoUserType || getPersistedDemoUserType(),
            isInitialized: true,
            isLoading: false,
          });
        }
      },

      // Refresh session before expiry
      refreshSession: async () => {
        if (get().isDemoMode) return;

        try {
          const {
            data: { session },
            error,
          } = await supabase.auth.refreshSession();

          if (error || !session) {
            console.error("Session refresh failed.");
            set({
              session: null,
              user: null,
              isAuthenticated: false,
              isDemoMode: false,
              demoUserType: "foreigner",
            });
            return;
          }

          set({
            session,
            isAuthenticated: true,
            isDemoMode: false,
          });
        } catch {
          console.error("Session refresh failed.");
        }
      },

      // Sign out user
      signOut: async () => {
        try {
          set({ isLoading: true });
          await supabase.auth.signOut();

          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isDemoMode: false,
            demoUserType: "foreigner",
            isLoading: false,
          });
        } catch {
          console.error("Sign out failed.");
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => authStorage),

      // SECURITY: Only persist session state, not passwords or profile details.
      // Native builds use SecureStore through authStorage.
      partialize: (state) => ({
        session: state.session,
        isAuthenticated: state.isAuthenticated,
        isDemoMode: state.isDemoMode,
        demoUserType: state.demoUserType,
      }),

      // Restore state from the configured auth storage on app start
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.initialize();
        }
      },
    },
  ),
);

// Helper functions
export const getCurrentUserId = (): string | null => {
  return useAuthStore.getState().user?.id || null;
};

export const isUserAuthenticated = (): boolean => {
  return useAuthStore.getState().isAuthenticated;
};
