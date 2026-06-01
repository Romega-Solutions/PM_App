<!-- Hallmark · audit · pre-emit critique: P5 H5 E5 S5 R4 V4 -->

# PinayMate — Design System Audit (Light/Dark Mode + Typography)

**Date:** 2026-06-01
**Scope:** `src/theme/` (colors, typography), `src/shared/utils/spacing.ts`, `tailwind.config.js`, theme consumption across `src/` + `app/`, OS theme config in `app.json`.
**Verb:** `hallmark audit` — read-only. No source files were edited to produce this report.
**Method:** static read of the token layer + grep census of how tokens are actually consumed.
**Visual companion:** [`design-tokens.html`](design-tokens.html) — open in a browser for an interactive style guide of every token (brand ramps, light/dark grounds, live WCAG contrast, type/spacing/radii). Light = shipping; dark = the proposed theme from this audit's roadmap.

> **This is the "example audit" template.** Every finding follows the same four-field shape — **Tell · Where · Severity · Fix** — grouped by severity and closed with a count. Reuse this structure for the next subsystem audit (navigation, forms, accessibility, etc.): same headings, same severity ladder (`critical` ships broken/as-slop · `major` looks unfinished/AI-generated · `minor` small taste/consistency issue), same remediation-roadmap tail.

---

## TL;DR

The token **foundation is sound** — three real font families with full weight ranges (all loaded), a semantic-alias layer, a clean 4-pt spacing scale, and brand colors with named identities (`amihan`/`dalisay`/`luna`). But the system **is not enforced and is light-only**:

- **Dark mode is advertised, not built.** `app.json` opts the app into OS dark-mode switching (`userInterfaceStyle: "automatic"`) while the theme exposes a single, static, light-only palette and nothing in the codebase ever reads the OS color scheme.
- **The theme is bypassed at scale.** ~233 hardcoded hex values and ~300 `rgba()` literals live in components; only **7 files** import `semanticColors`. The tokens are decorative, not load-bearing — which is also why dark mode can't simply be "switched on."
- **A real typography bug ships in the tokens:** `textStyles` set `lineHeight` to unitless multipliers (`1.1`, `1.5`), but React Native treats `lineHeight` as absolute points — so any multi-line text using these styles collapses.

**Score: 3 critical · 4 major · 4 minor = 11 findings.**

### Remediation status — updated 2026-06-01 (token foundation landed)

The token **foundation** has been implemented (verified: `tsc` 0 errors · `expo lint` 0 errors · `jest` 42/42 incl. a new theme-contract suite):

| # | Finding | Status |
|---|---------|--------|
| C1 | Dark mode declared, unimplemented | **Foundation done** — `lightColors`/`darkColors` + `getSemanticColors()` + `useTheme()` hook; root wired; `userInterfaceStyle` set to `"light"` (honest) until adoption. *Flip to `"automatic"` after C3.* |
| C2 | Unitless `lineHeight` | ✅ **Fixed** — `lineHeightFor(size, ratio)`; all `textStyles` now absolute points. |
| C3 | Token bypass (~233 hex/~300 rgba) | ⏳ **Remaining** — the component adoption sweep (the unlock for live dark mode). |
| M1 | No dark neutral ramp | ✅ Filled `neutral` 400/500/700/800 + dark grounds. |
| M2 | Thin semantic layer | ✅ Added `border`/`borderStrong`/`divider`/`overlay`/`backdrop`/`disabled`/`placeholder`/`on*`/`textTertiary`. |
| M3 | Duplicated/drifting source | ✅ `tailwind.config.js` re-synced to `colors.ts` (incl. `neutral.black`, new steps). |
| M4 | Incomplete `textStyles` | ✅ Added `h4`/`h5`/`bodyLarge`/`bodySmall`/`button`/`label`/`input`/`overline`. |
| m1 | NativeWind font names | ✅ Mapped to registered faces (`DMSans-Regular`, etc.). |
| m2 | Non-uniform ramps | ✅ Brand ramps filled to a consistent step set (amihan/dalisay/luna 800; status 300/700). |
| m3 | Ad-hoc per-screen dark surfaces | ⏳ Folds into the C3 sweep (promote to tokens). |
| m4 | Status 2-step only | ✅ Added 300 (dark ink) + 700 (light-tint text) per status family. |

**Next:** the C3 adoption sweep — migrate components off literals onto `useTheme().colors`, feature by feature, then set `userInterfaceStyle: "automatic"`.

---

## Inventory (what exists today)

| Layer | File | State |
|-------|------|-------|
| Color scales | `src/theme/colors.ts` | `amihan`, `dalisay`, `luna`, `neutral`, `success`/`warning`/`error` — light-tuned, uneven steps |
| Semantic aliases | `src/theme/colors.ts:70-89` | `semanticColors` — **single static map, light-only** |
| Typography | `src/theme/typography.ts` | `fontFamilies` (3 families), `fontSizes`, `lineHeights`, `textStyles` |
| Spacing/radius | `src/shared/utils/spacing.ts` | 4-pt `spacing`, `borderRadius` — clean |
| Tailwind mirror | `tailwind.config.js` | colors + fonts **hand-duplicated** from `colors.ts` |
| Fonts loaded | `app/_layout.tsx:16-43` | HelloParis (5) · Lora (8) · DM Sans (9) — all registered ✅ |
| OS theme | `app.json:9` | `userInterfaceStyle: "automatic"` |

---

## 🔴 Critical

### C1 · Dark mode is declared but unimplemented
- **Tell:** App opts into OS light/dark switching, but there is no dark palette and no code path that responds to the OS scheme. On a device set to Dark, the UI renders its fixed light surfaces with no compensation.
- **Where:**
  - `app.json:9` → `"userInterfaceStyle": "automatic"`
  - `src/theme/colors.ts:70-89` → `semanticColors` is one static object (`background: white`, `text: neutral[900]`) with no dark variant.
  - `app/_layout.tsx:90` → `<StatusBar style="dark" .../>` hardcoded.
  - No `useColorScheme()` / `Appearance` usage anywhere in `src/` or `app/` (grep: 0 hits).
- **Fix:** Either (a) set `userInterfaceStyle` to `"light"` to honestly lock light mode for now, **or** (b) make `semanticColors` scheme-aware and select it via `useColorScheme()` (see *Remediation* → target token shape). Don't ship "automatic" against a light-only palette.

### C2 · React Native treats `lineHeight` as points, not a multiplier
- **Tell:** `textStyles` set `lineHeight` to `1.1` / `1.5` / `1.75`, which RN interprets as **absolute dp**, not a ratio. A heading with `lineHeight: 1.1` gets a ~1px line box — multi-line text clips and overlaps.
- **Where:** `src/theme/typography.ts:49-53` (`lineHeights`) consumed raw in `textStyles` `h1`/`h2`/`h3` (`lineHeight: lineHeights.tight` → `1.1`) and `body`/`caption` (`1.5`). e.g. `typography.ts:68`.
- **Fix:** Multiply the ratio by the font size when defining each style, e.g. `lineHeight: Math.round(fontSizes['4xl'] * 1.1)`, or store absolute values per style. Keep the ratios as a `lineHeightRatios` helper, not as the value passed to RN.

### C3 · The theme is bypassed at scale — tokens are not load-bearing
- **Tell:** Components overwhelmingly hardcode colors instead of importing tokens, so the design system can't be themed, re-skinned, or darkened from one place. This is the root blocker for C1.
- **Where:** ~**233** hardcoded `#hex` and ~**300** `rgba()` literals across `src/` + `app/` (excluding `src/theme/`); only **7** files import `semanticColors` vs **34** importing anything from `@/src/theme`. Heaviest: `src/features/matching/**` and `src/features/profile/**`.
- **Fix:** Treat token adoption as a migration. Add the missing semantic tokens (M2), then sweep feature-by-feature replacing literals with `semanticColors.*`. Add an ESLint guard (e.g. `no-restricted-syntax` flagging hex/rgba in `style`/`StyleSheet`) so new literals can't creep back in.

---

## 🟠 Major

### M1 · `neutral` has no dark-surface ramp
- **Tell:** Grays jump `50 → 100 → 200 → 300 → 600 → 900`; there is no `400`/`500`/`700`/`800`. There are no mid-dark grays to build dark-mode surfaces, elevated cards, or borders from.
- **Where:** `src/theme/colors.ts:43-52`.
- **Fix:** Fill the ramp to a full `50…900` (add `400/500/700/800`). A dark theme needs at least `surface`, `surfaceElevated`, `border`, `text`, `textSecondary` mapped to genuine dark grays.

### M2 · Semantic layer is too thin — components invent the missing tokens
- **Tell:** `semanticColors` covers `primary/secondary/accent/background/surface/text/textSecondary/status` but omits `border`, `divider`, `overlay`/`backdrop`, `disabled`, and on-color pairs (`onPrimary`, `onSurface`). That gap is exactly what the ~300 `rgba()` literals (C3) are filling ad-hoc.
- **Where:** `src/theme/colors.ts:70-89`.
- **Fix:** Extend `semanticColors` with `border`, `divider`, `overlay`, `disabled`, `onPrimary`, `onSurface`, `placeholder`. These become the dark-mode swap points later.

### M3 · Color source of truth is duplicated and already drifting
- **Tell:** The palette is hand-copied into both `src/theme/colors.ts` and `tailwind.config.js`. They've already diverged — `tailwind.config.js` `neutral` omits `black`, which exists in `colors.ts`. Any change must be made twice or the two silently disagree.
- **Where:** `src/theme/colors.ts:42-52` vs `tailwind.config.js:44-52`.
- **Fix:** Make one the source. Import the JS tokens into `tailwind.config.js` (`const { colors } = require('./src/theme/colors')`) so Tailwind and `StyleSheet` can never drift.

### M4 · `textStyles` is incomplete — gaps get filled inline
- **Tell:** Only `logo`, `h1–h3`, `body`, `bodyBold`, `caption` exist. No `h4/h5`, `button`, `label`, `input`, `overline`, `bodySmall`/`bodyLarge`. Screens reach past the token layer and set `fontSize`/`fontFamily` directly (part of the C3 census).
- **Where:** `src/theme/typography.ts:56-97`.
- **Fix:** Add the missing roles, especially `button`, `label`, `input` (the highest-frequency UI text). Pair each with a correct absolute `lineHeight` per C2.

---

## 🟡 Minor

### m1 · NativeWind font names don't match registered fonts
- **Tell:** `tailwind.config.js` maps `font-body`→`"DMSans"`, `font-header`→`"Lora"`, `font-logo`→`"HelloParis"`, but the fonts are registered as `DMSans-Regular`, `Lora-Bold`, `HelloParis-Bold`, etc. NativeWind font classes won't resolve to the loaded faces.
- **Where:** `tailwind.config.js:66-78` vs `app/_layout.tsx:16-43`.
- **Fix:** Low urgency (NativeWind is barely used per `CLAUDE.md`). When NativeWind use grows, map class names to actual registered family names, or register family aliases.

### m2 · Color scales are non-uniform / off-family in places
- **Tell:** Steps are inconsistent across hues — `amihan` skips `800`/`950`, `dalisay` has a `950` but no `800`, `luna` has neither. And `amihan[300]` (`#E1ABDA`) reads lilac/desaturated next to its pink neighbors `200` (`#F0B6DF`) and `400` (`#F090C6`) — a hue wobble in the ramp.
- **Where:** `src/theme/colors.ts:3-40`.
- **Fix:** Normalize every hue to the same step set and keep hue constant down each ramp (vary lightness/chroma only). Generating ramps in OKLCH keeps them perceptually even.

### m3 · Dark surfaces already exist — but per-screen, not tokenized
- **Tell:** Several screens are visually dark using local constants instead of tokens, so a future dark theme will fight them. Evidence the app *wants* dark surfaces — they just aren't systematized.
- **Where:** `app/(auth)/welcome.tsx:24` (`rgba(15,8,20,0.85)`); `app/(main)/profile-settings/*` (`BRAND_BG` + `<StatusBar barStyle="light-content">`, e.g. `privacy.tsx:42`).
- **Fix:** Promote these into tokens (`semanticColors.brandDark` / a dark scheme) and have the screens consume them, so they move with the system.

### m4 · Status colors have only two steps
- **Tell:** `success`/`warning`/`error` expose only `100` + `600` — no pressed/hover step and no on-color, so interactive status surfaces get hand-mixed.
- **Where:** `src/theme/colors.ts:54-66`.
- **Fix:** Add at least a `700` (pressed) and an `on*` text color per status.

---

## Remediation roadmap (to continue the project)

Ordered so each phase unblocks the next.

1. **Decide the mode contract (1 line, today).** If dark mode isn't ready, set `app.json` `userInterfaceStyle: "light"` to stop advertising a feature that isn't there. Flip back to `"automatic"` only when Phase 4 lands. *(Resolves C1's dishonesty immediately.)*
2. **Fix the `lineHeight` bug (small, isolated).** Convert ratios → absolute points in `textStyles`; add `button`/`label`/`input` roles while you're in the file. *(C2 + M4.)*
3. **Single source of truth + fuller tokens.** Import `colors.ts` into `tailwind.config.js`; fill the `neutral` ramp; add `border`/`divider`/`overlay`/`disabled`/`on*` to `semanticColors`. *(M1 + M2 + M3.)*
4. **Make `semanticColors` scheme-aware.** Split into `lightColors` / `darkColors`, select via `useColorScheme()`, expose through a tiny `useTheme()` hook (or React context). Wire `<StatusBar>` to the active scheme.
5. **Token-adoption sweep + lint guard.** Feature by feature, replace the ~233 hex / ~300 rgba literals with semantic tokens; add an ESLint rule so literals can't return. *(C3 — the largest item; do it incrementally.)*

### Target token shape (illustrative, for Phase 4)

```ts
// src/theme/colors.ts — scheme-aware semantic layer
const lightColors = {
  background: colors.neutral.white,
  surface: colors.neutral[50],
  surfaceElevated: colors.neutral.white,
  border: colors.neutral[200],
  text: colors.neutral[900],
  textSecondary: colors.neutral[600],
  onPrimary: colors.neutral.white,
  // …primary/secondary/accent/status
} as const;

const darkColors: typeof lightColors = {
  background: colors.neutral[900],
  surface: '#15131A',          // promote welcome.tsx / BRAND_BG here
  surfaceElevated: '#1F1C26',
  border: colors.neutral[700],  // add this step (M1)
  text: colors.neutral[50],
  textSecondary: colors.neutral[300],
  onPrimary: colors.neutral.white,
  // …
};

export const getSemanticColors = (scheme: 'light' | 'dark') =>
  scheme === 'dark' ? darkColors : lightColors;
```

```ts
// src/theme/useTheme.ts
import { useColorScheme } from 'react-native';
export function useTheme() {
  const scheme = useColorScheme() ?? 'light';
  return { scheme, colors: getSemanticColors(scheme) };
}
```

> Note: this requires components to read colors at render time (hook/context), not at module load. That migration is the same sweep as C3 — which is why adoption (Phase 5) is the unlock for real dark mode, not the palette itself.

---

## What's already good (don't regress these)

- Three genuine, well-loaded font families with full weight ranges (`app/_layout.tsx:16-43`) — no fake/system fallbacks shipping as the design.
- Named brand identities (`amihan`/`dalisay`/`luna`) with a semantic-alias indirection layer — the right architecture, just under-adopted.
- Clean 4-pt spacing + radius scale (`spacing.ts`) — keep it; extend the same discipline to color.
- Custom font files used instead of `fontWeight` + family combos — correct for RN custom fonts.

---

*Generated via the `hallmark audit` verb. Read-only — apply fixes in a follow-up change set, smallest-blast-radius first (roadmap order).*
