import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMatchPreferences,
  updateMatchPreferences,
  type MatchPreferences,
} from "../api/settingsApi";

export const settingsKeys = {
  all: ["settings"] as const,
  matchPreferences: ["settings", "matchPreferences"] as const,
};

/**
 * Reads + writes the current user's match preferences via TanStack Query.
 * Saving invalidates the cached preferences so any consumer refreshes.
 */
export function useMatchPreferences() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: settingsKeys.matchPreferences,
    queryFn: getMatchPreferences,
  });

  const mutation = useMutation({
    mutationFn: (prefs: MatchPreferences) => updateMatchPreferences(prefs),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: settingsKeys.matchPreferences }),
  });

  return {
    preferences: query.data ?? null,
    loading: query.isLoading,
    error: (query.error ?? mutation.error) as Error | null,
    saving: mutation.isPending,
    savePreferences: mutation.mutateAsync,
  };
}
