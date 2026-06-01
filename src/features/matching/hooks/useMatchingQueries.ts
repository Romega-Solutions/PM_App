/**
 * useMatchingQueries
 *
 * TanStack Query hooks for the matching feature.
 * All Supabase access is delegated to matchingApi — screens must not import
 * @/src/config/supabase directly (architecture rule A3).
 *
 * Hooks exported:
 *   useCurrentUser        – authenticated user (queryKey: ["currentUser"])
 *   useDiscoverProfiles   – discover feed for a user (queryKey: ["discover", userId])
 *   useMatches            – mutual matches list   (queryKey: ["likes", userId])
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  fetchDiscoverProfiles,
  getCurrentUser,
  getMatches,
  likeProfile,
  passProfile,
  superLikeProfile,
} from "../api/matchingApi";
import type { Profile, SwipeResult } from "../types";

// ---------------------------------------------------------------------------
// useCurrentUser
// ---------------------------------------------------------------------------

/**
 * Resolves the currently authenticated Supabase user.
 * Screens use this instead of calling `supabase.auth.getUser()` directly.
 *
 * `data`      – the Supabase User object or null (unauthenticated / bypass)
 * `isLoading` – true on the initial fetch
 * `error`     – any auth error that is NOT AuthSessionMissingError
 * `refetch`   – manual refetch trigger
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data, error } = await getCurrentUser();
      // AuthSessionMissingError is expected for bypass/unauthenticated testers;
      // surface it as null rather than throwing so callers get `data === null`.
      if (
        error &&
        !(
          typeof error === "object" &&
          error !== null &&
          "name" in error &&
          error.name === "AuthSessionMissingError"
        )
      ) {
        throw error;
      }
      return data ?? null;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 min — user identity rarely changes mid-session
  });
}

// ---------------------------------------------------------------------------
// useDiscoverProfiles
// ---------------------------------------------------------------------------

/**
 * Fetches and caches discover profiles for `userId`.
 * Disabled (skipped) when `userId` is null/undefined.
 *
 * `data`      – Profile[] | null
 * `isLoading` – true on first fetch
 * `error`     – underlying Supabase/network error
 * `refetch`   – manual trigger (used to load-more in DiscoverScreen)
 */
export function useDiscoverProfiles(userId: string | null, limit = 20) {
  return useQuery({
    queryKey: ["discover", userId, limit],
    queryFn: async () => {
      const { data, error } = await fetchDiscoverProfiles(userId!, limit);
      if (error) throw error;
      return (data ?? []) as Profile[];
    },
    enabled: !!userId,
    retry: 1,
    staleTime: 2 * 60 * 1000, // 2 min
  });
}

// ---------------------------------------------------------------------------
// useMatches
// ---------------------------------------------------------------------------

/**
 * Fetches and caches the mutual-matches list for `userId`.
 * Disabled (skipped) when `userId` is null/undefined.
 *
 * `data`      – Match[] | null
 * `isLoading` – true on first fetch
 * `error`     – underlying Supabase/network error
 * `refetch`   – manual refetch trigger
 */
export function useMatches(userId: string | null) {
  return useQuery({
    queryKey: ["likes", userId],
    queryFn: async () => {
      const { data, error } = await getMatches(userId!);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
    retry: 1,
    staleTime: 2 * 60 * 1000,
  });
}

// ---------------------------------------------------------------------------
// Swipe mutations — optimistic-invalidation pattern
// ---------------------------------------------------------------------------

/**
 * Mutation: like a profile.
 * Invalidates the discover feed after success so the liked profile is removed.
 *
 * `mutate({ fromUserId, toUserId })` → resolves to SwipeResult
 */
export function useLikeProfile(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation<SwipeResult, Error, { fromUserId: string; toUserId: string }>({
    mutationFn: ({ fromUserId, toUserId }) => likeProfile(fromUserId, toUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discover", userId] });
    },
  });
}

/**
 * Mutation: pass (skip) a profile.
 * Invalidates the discover feed after success.
 */
export function usePassProfile(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean; error?: string }, Error, { fromUserId: string; toUserId: string }>({
    mutationFn: ({ fromUserId, toUserId }) => passProfile(fromUserId, toUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discover", userId] });
    },
  });
}

/**
 * Mutation: super-like a profile.
 * Currently delegates to likeProfile; invalidates the discover feed.
 */
export function useSuperLikeProfile(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation<SwipeResult, Error, { fromUserId: string; toUserId: string }>({
    mutationFn: ({ fromUserId, toUserId }) =>
      superLikeProfile(fromUserId, toUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discover", userId] });
    },
  });
}
