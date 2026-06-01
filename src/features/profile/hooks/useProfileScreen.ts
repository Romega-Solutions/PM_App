/**
 * useProfileScreen
 *
 * Encapsulates all data-fetching and mutation logic used exclusively by
 * ProfileScreen:
 *   - Reads the profile row (session + profiles table) via TanStack Query,
 *     reusing `profileKeys` from useProfile.
 *   - Exposes a sign-out mutation backed by `signOutUser()`.
 *
 * Architecture rule A3: supabase is imported only inside api/ — this hook
 * delegates all Supabase work to profileApi.ts.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfileScreenData, signOutUser } from "../api/profileApi";
import { profileKeys } from "./useProfile";

// Extend the shared key registry with a screen-specific key.
// Using a distinct key avoids colliding with the broader "profile me" cache
// (which uses getUser, not getSession + column-specific select).
export const profileScreenKeys = {
  ...profileKeys,
  screen: ["profile", "screen"] as const,
};

/**
 * Data hook for ProfileScreen.
 *
 * Returns:
 *  - `profileRow`  — raw DB row (ProfileScreenRow | null); null = no session
 *  - `loading`     — true while the initial fetch is in-flight
 *  - `error`       — Error | null
 *  - `refresh`     — manually trigger a refetch
 *  - `signOut`     — async function; call to sign out (wraps useMutation)
 *  - `isSigningOut` — true while sign-out is pending
 */
export function useProfileScreen() {
  const queryClient = useQueryClient();

  // --- read: session + profile row ---
  const query = useQuery({
    queryKey: profileScreenKeys.screen,
    queryFn: async () => {
      // getProfileScreenData returns null for unauthenticated visitors;
      // we surface that to the screen via profileRow === null rather than
      // throwing, so Query does NOT retry on a missing session.
      const data = await getProfileScreenData();
      return data; // may be null
    },
    // Retry only on genuine failures, not on null (unauthenticated) returns.
    retry: (failureCount, error) => {
      if (!error) return false;
      return failureCount < 2;
    },
  });

  // --- write: sign out ---
  const signOutMutation = useMutation({
    mutationFn: signOutUser,
    onSuccess: () => {
      // Invalidate both the screen key and the broader profile cache so
      // any other useProfile consumers reflect the logged-out state.
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });

  return {
    profileRow: query.data ?? null,
    loading: query.isLoading,
    error: query.error as Error | null,
    refresh: query.refetch,
    signOut: signOutMutation.mutateAsync,
    isSigningOut: signOutMutation.isPending,
  };
}
