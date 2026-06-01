/**
 * TanStack Query client — the shared server-state cache.
 *
 * Owns SERVER state (anything fetched from Supabase: profiles, matches,
 * messages). Client/UI state stays in Zustand (`src/stores/`). See
 * `docs/architecture/TARGET_ARCHITECTURE.md` for the server-vs-client split.
 *
 * React Native focus refetching is wired via `focusManager` + `AppState` in
 * `app/_layout.tsx` (per TanStack Query's RN guide). `onlineManager`
 * (NetInfo / expo-network) is intentionally NOT wired yet — add it when the
 * app needs offline-awareness.
 */
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Treat data as fresh for 30s — avoids refetch storms on quick nav.
      staleTime: 30_000,
      // Keep unused cache 5 min before garbage collection.
      gcTime: 5 * 60_000,
      // Mobile networks are flaky — retry transient failures twice.
      retry: 2,
      // Refetch when the app returns to the foreground (via focusManager) or
      // regains connectivity. Default behaviour, made explicit here.
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
