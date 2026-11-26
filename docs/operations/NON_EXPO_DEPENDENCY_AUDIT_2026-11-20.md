# Non-Expo dependency audit — Expo SDK 57

Reviewed 2026-11-20 against Expo SDK 57, React Native 0.86.3, the New Architecture, repository imports, installed package metadata, package maintainers' documentation, Expo compatibility tools, npm audit, and PM_App quality gates.

## Runtime dependencies

| Package | Used | Status | Reason / action |
| --- | --- | --- | --- |
| `@ptomasroos/react-native-multi-slider` | Yes | Replace (follow-up) | Pure-JS range slider, so it does not bridge native code, but 2.2.2 was last published in 2020 and is unmaintained. Keep here; replace and visually test preference ranges separately. |
| `@react-native-async-storage/async-storage` | Yes | OK | Expo-aligned 2.2.0; persistence paths use it. Do not take the v3 major here. |
| `@react-native-community/slider` | Yes | OK | Expo-aligned 5.2.0 supports RN >=0.76 and the New Architecture. Expo currently selects 5.2.0. |
| `@supabase/supabase-js` | Yes | OK | JS client used by auth, storage, database, and realtime code; no native bridge. |
| `base64-arraybuffer` | Yes | OK | Small JS upload helper; no native bridge. |
| `lucide-react-native` | Yes | OK | Primary icon library with 65 imports; uses Expo-aligned `react-native-svg`. |
| `react`, `react-dom`, `react-native`, `react-native-web` | Yes | OK | Core versions aligned by Expo SDK 57; do not update independently. |
| `react-native-gesture-handler` | Yes | OK | Expo-aligned native dependency used by gesture flows. |
| `react-native-reanimated` | Yes | OK | 4.5.1 supports RN 0.86 and requires the New Architecture, matching this app. |
| `react-native-safe-area-context` | Yes | OK | Expo-aligned and used broadly for safe layouts. |
| `react-native-screens` | Peer | OK | Required by Expo Router/native navigation despite no direct app import. |
| `react-native-svg` | Peer | OK | Required by Lucide; Expo-aligned. |
| `react-native-url-polyfill` | Yes | Update (follow-up) | Imported by Supabase setup. Version 4 is a major, so migration is deferred. |
| `react-native-worklets` | Yes | OK | Expo-selected 0.10.1 paired with Reanimated 4.5.1. |
| `zod` | Yes | OK | JS-only validation dependency. |
| `zustand` | Yes | OK | JS-only state management used by multiple stores. |
| `react-native-vector-icons` | No | Removed | Deprecated legacy package with no imports. PM_App already uses Lucide. |

There are no direct `@react-navigation/*` dependencies or imports on the SDK 57 branch. Navigation is provided by Expo Router and managed transitive dependencies.

## Development dependencies

| Package/group | Status | Reason / action |
| --- | --- | --- |
| `@playwright/test` | OK | Used by beta and web smoke suites. |
| `@testing-library/react-native` | OK | Current test renderer with built-in matchers. |
| `@testing-library/jest-native` | Removed | Deprecated and unused. |
| `@types/jest`, `@types/node`, `@types/react` | OK | Compatible type support; major updates deferred. |
| `babel-plugin-import` | Removed | No Babel configuration or source usage. |
| `eslint` | OK | SDK-compatible v9 line; v10 is out of scope. |
| `jest`, `react-test-renderer` | OK | Kept on the SDK/Jest 29-compatible line. |
| `sharp` | OK | Used by repository image/export scripts. |
| `typescript` | OK | Expo SDK 57-aligned version. |

Expo-owned development packages remain on SDK 57-compatible lines. Atlas retains a documented dev-only transitive advisory.

## Overrides review

- Kept pins that still provide patched transitive versions without public API changes.
- Updated `body-parser` 1.20.8 → 1.20.9, `qs` 6.16.0 → 6.17.1, and `undici` 6.29.0 → 6.29.1.
- Updated locked TypeScript ESLint packages from 8.72.2 to 8.73.0 through normal semver resolution.
- Did not force Expo Router 58, Expo 52, Atlas 0.0.6, or major transitive overrides.
- Synchronized `dependency-audit-exceptions.json` with the current advisory set.

## Follow-ups

1. Replace `@ptomasroos/react-native-multi-slider` with a maintained range slider and run native interaction/accessibility tests.
2. Evaluate `react-native-url-polyfill` v4 with Supabase URL handling in a dedicated major-upgrade PR.
3. Revisit Expo Router/tooling advisories during SDK 58 or when SDK 57 patches arrive.

## Maintainer sources

- Slider compatibility: https://github.com/callstack/react-native-slider
- Reanimated compatibility: https://docs.swmansion.com/react-native-reanimated/docs/guides/compatibility/
- Jest Native deprecation: https://github.com/testing-library/jest-native
- Vector Icons migration: https://github.com/oblador/react-native-vector-icons/blob/master/MIGRATION.md
- Async Storage: https://github.com/react-native-async-storage/async-storage
- Safe Area Context: https://rnsac.appandflow.com/docs/
