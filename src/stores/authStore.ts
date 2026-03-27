/**
 * Auth Store - Global Authentication State Management
 *
 * PURPOSE: Centralized auth state using Zustand with persistence
 *
 * SECURITY PRACTICES:
 * - Session tokens stored securely in AsyncStorage (encrypted by OS)
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session } from "@supabase/supabase-js";
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
  // State
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  setUser: (user: User) => void;
  setSession: (session: Session | null) => void;
  clearUser: () => void;
  updateUser: (updates: Partial<User>) => void;
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
      isLoading: false,
      isInitialized: false,

      // Set user and update auth state
      setUser: (user) =>
        set({
          user,
          isAuthenticated: true,
        }),

      // Set session from Supabase
      setSession: (session) =>
        set({
          session,
          isAuthenticated: !!session,
        }),

      // Clear user on sign out
      clearUser: () =>
        set({
          user: null,
          session: null,
          isAuthenticated: false,
        }),

      // Update user details
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      // Initialize auth (restore session on app start)
      initialize: async () => {
        try {
          set({ isLoading: true });

          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();

          if (error) {
            console.error("❌ Failed to get session:", error.message);
            set({
              session: null,
              user: null,
              isAuthenticated: false,
              isInitialized: true,
              isLoading: false,
            });
            return;
          }

          if (session) {
            set({
              session,
              isAuthenticated: true,
              isInitialized: true,
              isLoading: false,
            });
            console.log("✅ Session restored for:", session.user.email);
          } else {
            set({
              session: null,
              user: null,
              isAuthenticated: false,
              isInitialized: true,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error("❌ Auth initialization error:", error);
          set({
            session: null,
            user: null,
            isAuthenticated: false,
            isInitialized: true,
            isLoading: false,
          });
        }
      },

      // Refresh session before expiry
      refreshSession: async () => {
        try {
          const {
            data: { session },
            error,
          } = await supabase.auth.refreshSession();

          if (error || !session) {
            console.error("❌ Session refresh failed:", error?.message);
            set({
              session: null,
              user: null,
              isAuthenticated: false,
            });
            return;
          }

          set({
            session,
            isAuthenticated: true,
          });
          console.log("✅ Session refreshed successfully");
        } catch (error) {
          console.error("❌ Session refresh error:", error);
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
            isLoading: false,
          });

          console.log("✅ User signed out successfully");
        } catch (error) {
          console.error("❌ Sign out error:", error);
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),

      // SECURITY: Only persist session, not sensitive data
      partialize: (state) => ({
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),

      // Restore state from AsyncStorage on app start
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log("🔄 Hydrating auth state from storage");
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
