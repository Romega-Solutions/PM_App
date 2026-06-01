/**
 * useCurrentUserId Hook
 *
 * Resolves the authenticated user's ID for messaging screens.
 * Routes through the api/ layer (getCurrentUserId) so that screens
 * never import @/src/config/supabase directly — satisfying rule A3.
 *
 * @module features/messaging/hooks/useCurrentUserId
 */

import { useQuery } from "@tanstack/react-query";
import { getCurrentUserId } from "../api/conversationsApi";

// ─── Query Key ────────────────────────────────────────────────────────────────

export const currentUserKeys = {
  id: ["messaging", "currentUserId"] as const,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseCurrentUserIdReturn {
  currentUserId: string;
  loading: boolean;
  error: Error | null;
}

/**
 * Returns the current authenticated user's ID.
 * Keeps the result in TanStack Query cache so repeated callers (e.g.
 * MessagesScreen + ChatScreen mounted simultaneously) share a single fetch.
 */
export function useCurrentUserId(): UseCurrentUserIdReturn {
  const query = useQuery({
    queryKey: currentUserKeys.id,
    queryFn: async (): Promise<string> => {
      const { userId, error } = await getCurrentUserId();
      if (error) throw error;
      return userId ?? "";
    },
    // Auth session is stable for the lifetime of the screen; 5 min stale time
    // avoids re-fetching on every render while still revalidating on reconnect.
    staleTime: 5 * 60 * 1_000,
  });

  return {
    currentUserId: query.data ?? "",
    loading: query.isLoading,
    error: query.error as Error | null,
  };
}
