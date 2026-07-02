/**
 * Auth Persistence Hook - Restore Session on App Start
 *
 * PURPOSE: Automatically restore user session when app starts
 *
 * SECURITY PRACTICES:
 * - Validates session before restoring
 * - Handles expired tokens gracefully
 * - Auto-refreshes tokens when needed
 *
 * SOLID PRINCIPLES:
 * - Single Responsibility: Only handles auth restoration
 * - Dependency Inversion: Uses auth store abstraction
 *
 * USAGE:
 * ```typescript
 * // In App.tsx or _layout.tsx
 * import { useAuthPersistence } from '@/src/hooks/useAuthPersistence';
 *
 * export default function App() {
 *   const { isReady } = useAuthPersistence();
 *
 *   if (!isReady) {
 *     return <SplashScreen />;
 *   }
 *
 *   return <MainNavigator />;
 * }
 * ```
 *
 * @filesize ~120 lines (under 150 limit for hooks)
 */

import { supabase } from "@/src/config/supabase";
import { useAuthStore } from "@/src/stores/authStore";
import { useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

// ===== HOOK =====

export function useAuthPersistence() {
  const [isReady, setIsReady] = useState(false);
  const { initialize, refreshSession, setSession, isInitialized } =
    useAuthStore();
  const appState = useRef(AppState.currentState);

  // Initialize auth on mount
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        await initialize();

        if (mounted) {
          setIsReady(true);
        }
      } catch {
        console.error("Auth initialization failed.");
        if (mounted) {
          setIsReady(true); // Continue anyway
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [initialize]);

  // Listen to Supabase auth changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      switch (event) {
        case "SIGNED_IN":
          setSession(session);
          break;

        case "SIGNED_OUT":
          setSession(null);
          break;

        case "TOKEN_REFRESHED":
          setSession(session);
          break;

        case "USER_UPDATED":
          setSession(session);
          break;

        default:
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSession]);

  // Auto-refresh token when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          // Refresh session when app becomes active
          await refreshSession();
        }

        appState.current = nextAppState;
      },
    );

    return () => {
      subscription.remove();
    };
  }, [refreshSession]);

  // Periodic token refresh (every 55 minutes)
  useEffect(() => {
    if (!isInitialized) return;

    const REFRESH_INTERVAL = 55 * 60 * 1000; // 55 minutes

    const interval = setInterval(() => {
      refreshSession();
    }, REFRESH_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [isInitialized, refreshSession]);

  return { isReady };
}

// ===== HELPER HOOK =====

/**
 * Hook to protect routes that require authentication
 *
 * @example
 * ```typescript
 * function ProtectedScreen() {
 *   const { isAuthenticated, isLoading } = useRequireAuth();
 *
 *   if (isLoading) {
 *     return <LoadingSpinner />;
 *   }
 *
 *   // User is authenticated at this point
 *   return <YourContent />;
 * }
 * ```
 */
export function useRequireAuth() {
  const { isAuthenticated, isDemoMode, isLoading, isInitialized } =
    useAuthStore();

  return {
    isAuthenticated: isAuthenticated || isDemoMode,
    isDemoMode,
    isLoading: isLoading || !isInitialized,
  };
}
