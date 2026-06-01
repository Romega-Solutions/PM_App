import { useQuery } from "@tanstack/react-query";
import { getCurrentUserProfile } from "../api/profileApi";

/**
 * Query keys for the profile feature. Mutations (e.g. useUpdateProfile,
 * useUploadPhoto) invalidate `profileKeys.me` to refresh the cached profile.
 */
export const profileKeys = {
  all: ["profile"] as const,
  me: ["profile", "me"] as const,
};

/**
 * Reads the current user's profile from Supabase via TanStack Query.
 *
 * This is the TEMPLATE for converting the app's data hooks off the manual
 * useState/useEffect/try-catch pattern onto server-state caching. The `api/`
 * layer (`getCurrentUserProfile`) is unchanged; only the consumption changed.
 *
 * The public return shape ({ profile, loading, error, refresh }) is preserved
 * so existing consumers (e.g. EditProfileScreen) need no edits.
 */
export function useProfile(autoLoad = true) {
  const query = useQuery({
    queryKey: profileKeys.me,
    queryFn: async () => {
      const data = await getCurrentUserProfile();
      // Preserve the previous hook's behaviour: a null profile is an error
      // (and lets Query retry transient failures).
      if (!data) throw new Error("Failed to load profile");
      return data;
    },
    enabled: autoLoad,
  });

  return {
    profile: query.data ?? null,
    loading: query.isLoading,
    error: query.error as Error | null,
    refresh: query.refetch,
    // Newly available for free (background refresh indicator):
    isFetching: query.isFetching,
  };
}
