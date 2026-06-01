# PinayMate — Target Architecture (React Native + Expo)

**Date:** 2026-06-02
**Purpose:** the architecture to *aim* for — opinionated, current best-practice, and explained so it's learnable. It defines the destination for the gaps in [`ARCHITECTURE_AUDIT_2026-06-02.md`](ARCHITECTURE_AUDIT_2026-06-02.md).
**Stack it assumes:** Expo SDK 54 · React Native 0.81 · expo-router v6 · TypeScript strict · Zustand · Supabase.

---

## 1. Core principles (the "why")

1. **Feature-first, not type-first.** Group code by *what it does for the user* (`matching`, `messaging`), not by *what it is* (`components/`, `hooks/`). You change a feature in one folder; you rarely touch ten.
2. **Unidirectional dependencies.** Routes → features → shared → core. Lower layers never import upward; features don't import each other. Dependencies point *inward*, toward stable code.
3. **Thin routes.** `app/` is a routing manifest. A route file maps a URL to a screen — nothing else. All logic/UI lives in `src/`.
4. **Separate server state from client state.** Data that lives in Supabase is *server state* (cached, refetched, can be stale). Things like "is the filter sheet open" or "the auth session" are *client state*. They need different tools (see §4) — conflating them is the root of most RN data bugs.
5. **One layer owns each concern.** Networking lives in `api/`. Rendering lives in components. Orchestration lives in hooks. When a file does two of these, split it.
6. **Design for testability & size.** Small, single-purpose units (screens ≤ ~250 lines, stores ≤ ~150, components ≤ ~200). If you can't describe a file in one sentence, it's doing too much.

---

## 2. The layered model

```
┌────────────────────────────────────────────────────────────┐
│  app/                ROUTES — expo-router, thin wrappers      │  (URL → screen)
├────────────────────────────────────────────────────────────┤
│  src/features/<f>/screens/      SCREENS — compose UI          │  (render + layout)
│  src/features/<f>/components/    feature UI pieces            │
├────────────────────────────────────────────────────────────┤
│  src/features/<f>/hooks/        HOOKS — orchestration         │  (wire api+stores→UI)
├────────────────────────────────────────────────────────────┤
│  src/features/<f>/api/          DATA ACCESS — typed funcs     │  (the ONLY Supabase callers)
│  src/features/<f>/services/     pure logic (e.g. scoring)     │
├────────────────────────────────────────────────────────────┤
│  src/stores/      CLIENT STATE (Zustand)   src/config/ CORE  │  (session, ui, supabase client)
│  src/shared/ + src/theme/    cross-cutting primitives        │
└────────────────────────────────────────────────────────────┘
```

**The rule that makes it work:** a layer may only import from the layers **below** it. A screen never imports `config/supabase`; it calls a hook, which calls `api`, which calls Supabase. This is what makes screens testable, lets the DB schema change in one place, and keeps features swappable.

### Each layer's single job
- **Route (`app/`)** — `export default () => <Screen/>`. No state, no fetching, no styles.
- **Screen** — compose components, handle navigation params, render states (loading/empty/error/data). No raw Supabase, no inline business rules.
- **Component** — presentational; props in, events out. Styled from theme tokens (`useTheme()`), never hardcoded hex.
- **Hook** — the feature's brain: calls `api`, reads/writes stores, exposes `{ data, isLoading, error, actions }` to the screen.
- **api** — typed functions returning `Result<T>`; the **only** place `config/supabase` is imported. Maps DB rows → domain types (insulates the app from schema drift).
- **services** — pure functions, no I/O (e.g. `calculateMatchScore`). Trivially unit-testable.
- **stores** — *client* state only (see §4).

---

## 3. State: server vs client (the key lesson)

| | **Server state** | **Client state** |
|---|---|---|
| Examples | profiles, messages, likes, conversations | auth session, active filters, "sheet open", draft text |
| Truth lives in | Supabase | the app |
| Needs | caching, refetch, loading/error, dedup, invalidation | simple get/set, persistence |
| **Tool** | **TanStack Query** (recommended) *or* hooks-over-`api` (interim) | **Zustand** |

**Recommendation — adopt TanStack Query for server state.** It deletes the most error-prone code in the app: every screen's manual `useState(loading)/useEffect(fetch)/try-catch`. You write the `api` function once, wrap it in `useQuery`/`useMutation`, and get caching, retries, background refetch, and optimistic updates for free.

```ts
// features/matching/api/matchingApi.ts  — pure data access (only Supabase importer)
export async function fetchDiscoverProfiles(userId: string): Promise<ProfileCardData[]> { /* … */ }

// features/matching/hooks/useDiscover.ts  — orchestration
export function useDiscover(userId: string) {
  return useQuery({ queryKey: ['discover', userId], queryFn: () => fetchDiscoverProfiles(userId) });
}

// features/matching/screens/DiscoverScreen.tsx  — render only
const { data, isLoading, error } = useDiscover(userId);   // no supabase, no manual loading
```

**Keep Zustand for client state** — it's already used well here (`authStore` with `persist`/`partialize`). Don't put server data in Zustand; that's how caches go stale and screens desync.

> If you'd rather not add a dependency yet, the *interim* pattern is the same shape minus the library: a hook that owns `useState` for `{data, loading, error}` and calls the `api` function. Either way, **the screen stays dumb and Supabase stays in `api/`.**

---

## 4. Target folder structure

```
app/                                  # ROUTES ONLY (every file ≤ ~15 lines)
  _layout.tsx                         # providers: SafeArea, QueryClient, theme, fonts, auth
  (auth)/ (main)/ (modals)/           # route groups → re-export src screens

src/
  features/
    <feature>/                        # self-contained; the unit of change
      api/        <name>Api.ts         # ONLY Supabase callers; return typed Result<T>
      services/   <name>.ts            # pure logic, no I/O
      hooks/      use<Thing>.ts        # orchestration (useQuery/useMutation + stores)
      components/ <Thing>.tsx          # feature-scoped presentational UI
      screens/    <Thing>Screen.tsx    # compose; render loading/empty/error/data
      types/      index.ts             # feature domain types
      index.ts                        # PUBLIC API barrel — the only entry others import
  stores/                             # Zustand: client state (auth, ui), persisted where needed
  config/                             # supabase client, queryClient, deepLinking, env
  shared/
    utils/                            # responsive(scale), formatting, result helpers
    types/                            # cross-feature types (UserType, etc.)
    hooks/                            # truly app-wide hooks
  components/ui/                      # design-system primitives (Button, Card, Input…) on tokens
  theme/                             # tokens + useTheme() (done)
```

**Features:** `auth · account · matching · messaging · profile · settings` (new — pull profile-settings out of `app/`).

---

## 5. Anatomy of a feature (the template to copy)

A feature is a small app. To add "favorites":
1. `api/favoritesApi.ts` — `addFavorite`, `listFavorites` (typed, Supabase here).
2. `hooks/useFavorites.ts` — `useQuery(listFavorites)` + `useMutation(addFavorite)` with cache invalidation.
3. `components/FavoriteButton.tsx` — presentational.
4. `screens/FavoritesScreen.tsx` — composes the above; renders states.
5. `types/index.ts` — `Favorite`.
6. `index.ts` — `export { FavoritesScreen } from './screens/FavoritesScreen'`.
7. Route: `app/(main)/favorites.tsx` → `export { FavoritesScreen as default } from '@/src/features/favorites'`.

**Data flow (one direction):** `Route → Screen → useFavorites → favoritesApi → Supabase` and back. Cross-feature need? Import the other feature's **barrel** (`@/src/features/x`), never its internals.

---

## 6. The enforceable rules

| Rule | Limit / pattern | Why |
|------|------|-----|
| Thin routes | `app/**` ≤ ~15 lines, re-export only | routing ≠ logic |
| Supabase isolation | `config/supabase` imported **only** in `api/` (+ `stores/auth`, `config`) | schema changes in one place; testable screens |
| Feature isolation | import features via their `index.ts` barrel; no deep paths; no internal cross-feature imports | swappable, low coupling |
| Tokens only | colors/space/type via `useTheme()` / theme tokens; no hex/rgba literals | theming + dark mode (see design audit) |
| File size | screen ≤ 250 · store ≤ 150 · component ≤ 200 · util ≤ 250 | single responsibility |
| Server vs client | server data in Query; client state in Zustand | no stale caches / desync |
| Tests next to code | `api/__tests__`, `hooks/__tests__` | refactor safety |

Enforce mechanically where possible: an **`eslint-plugin-boundaries`** (or `no-restricted-imports`) rule to forbid `config/supabase` outside `api/`, forbid deep feature imports, and forbid hex in styles. Mechanical rules beat code review for consistency.

---

## 7. Current → target (what to change)

| Area | Today | Target |
|------|-------|--------|
| Routes | ~11 fat route files (full screens in `app/`) | thin re-exports; screens in `src/features/*` |
| profile-settings | 6 screens live in `app/` | new `src/features/settings/` |
| Data access | ~9 screens call Supabase directly | all queries in `api/`, consumed via hooks/Query |
| Server state | manual `useState`+`useEffect` per screen | TanStack Query (or hooks-over-api) |
| Feature API | deep imports, 27 cross-feature refs | per-feature `index.ts` barrels + `shared/types` |
| Big files | `ChatScreen` 1038, 10 files >400 | decomposed into hooks + components |
| Stores | 3 over ~150 lines | split by concern |
| Styling | 385 hex/rgba literals | `useTheme()` tokens (design audit) |
| Utils | `moderateScale` ×11 | one `shared/utils/responsive.ts` |

---

## 8. Migration phases (safe order)

1. **Providers + Query setup** — add `QueryClientProvider` (+ SafeArea/theme) in `app/_layout.tsx`; create `config/queryClient.ts`. No behavior change yet.
2. **`features/settings/`** — move the 6 profile-settings screens out of `app/`; add `settingsApi`. Proves the end-to-end pattern on a low-risk surface.
3. **Data-access extraction, feature by feature** — pull Supabase into `api/`, expose `useX` hooks (Query), add `api` tests *before* refactoring screens. Order: profile → matching → messaging → auth.
4. **Decompose monoliths** — `ChatScreen` and the 400+ screens into hooks + components.
5. **Barrels + shared types + responsive util + thin the remaining routes.**
6. **Lock it in** — add the ESLint boundary rules so it can't regress.

Each phase ships green (`tsc`/`jest`/`lint`) and is independently reviewable. This is the same spine as the design-token adoption sweep — both centralize what's been copy-pasted across screens.

---

## 9. Learn more (authoritative, current)

- **Expo Router** — file-based routing, layouts, groups: https://docs.expo.dev/router/introduction/
- **Expo project structure & development**: https://docs.expo.dev/develop/
- **TanStack Query (React Native)** — server-state: https://tanstack.com/query/latest/docs/framework/react/react-native
- **Zustand** — client state, persist: https://zustand.docs.pmnd.rs/
- **React Native architecture & performance**: https://reactnative.dev/docs/performance
- **Supabase + Expo**: https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native
- *(Use Context7 in-editor after a restart for live, version-pinned API docs of any of these.)*

> **The one sentence to remember:** *Routes stay thin, Supabase stays in `api/`, server state goes in Query, client state goes in Zustand, and features talk only through their barrels.* Everything else follows from that.
