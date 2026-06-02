/**
 * PinayMate color tokens — primitive ramps + scheme-aware semantic layer.
 *
 * Source of truth for color. `tailwind.config.js` mirrors the `colors` ramps —
 * keep the two in sync (see docs/design/DESIGN_SYSTEM_AUDIT_2026-06-01.md).
 * Visual reference: docs/design/design-tokens.html.
 *
 * Layers:
 *   colors        — raw primitive ramps (filled to a consistent step set).
 *   lightColors   — current shipping semantic theme.
 *   darkColors    — dark semantic theme (purple-tinted ink grounds).
 *   getSemanticColors(scheme) — pick a theme; use the useTheme() hook in components.
 *   semanticColors — backward-compatible alias of lightColors.
 */
import { withAlpha } from './colorUtils';

// ── Primitive ramps ──────────────────────────────────────────────────────────
export const colors = {
  // Amihan (Primary Pink/Red)
  amihan: {
    50: '#FFF7FB',
    100: '#F6D0F1',
    200: '#F0B6DF',
    300: '#E1ABDA',
    400: '#F090C6',
    500: '#EF3E78', // Main
    600: '#D7346B',
    700: '#B31460',
    800: '#7A0E45', // added — fills ramp gap
    900: '#4D0034',
    950: '#33001F', // added — completes ramp
  },

  // Dalisay (Secondary Purple)
  dalisay: {
    50: '#F8F5FF',
    100: '#E3DCF9',
    200: '#C5B1E4',
    300: '#B085F6',
    400: '#A47CF2',
    500: '#8D69F6', // Main
    600: '#6F4EF0',
    700: '#5A3BAF',
    800: '#46307F', // added — fills ramp gap
    900: '#2E1E5A',
    950: '#340839',
  },

  // Luna (Accent Blue)
  luna: {
    50: '#F4F8FF',
    100: '#C0D2F4',
    200: '#A0BAEE',
    300: '#81A5E9',
    400: '#6D90EA',
    500: '#5C83E9', // Main
    600: '#3F6FE4',
    700: '#1C4EBE',
    800: '#143A9E', // added — fills ramp gap
    900: '#0B2D8E',
    950: '#061C57', // added — completes ramp
  },

  // Neutral (Grays) — filled ramp; 400/500/700/800 added for borders + dark surfaces
  neutral: {
    50: '#FAF9FB',
    100: '#F2F1F4',
    200: '#ECEBF0',
    300: '#E7E6EB',
    400: '#C9C7CF', // added — light divider / border
    500: '#84828C', // added — tertiary text / placeholder (≥3:1 on white)
    600: '#6A6A72',
    700: '#48474E', // added — dark border
    800: '#2A2A30', // added — dark surface
    900: '#1A1A1A',
    950: '#0C0C0E', // added — completes ramp
    white: '#FFFFFF',
    black: '#000000',
  },

  // Status — 100 tint · 300 (dark-theme ink) · 600 solid · 700 (light-tint text)
  success: { 100: '#E7F6EF', 300: '#6FE0B0', 600: '#22A574', 700: '#15724F' },
  warning: { 100: '#FFF6E5', 300: '#FCD34D', 600: '#F59E0B', 700: '#B45309' },
  error: { 100: '#FDE8EC', 300: '#F26B86', 600: '#D52C4D', 700: '#A81D3A' },
} as const;

// ── Dark surface grounds (purple-tinted ink; off the neutral ramp) ───────────
const darkGround = {
  bg: '#141019',
  surface: '#1E1A26',
  surfaceElevated: '#252030',
  raised: '#2A2533',
  border: '#383143',
  borderStrong: '#7A7488', // ≥3:1 on dark surface (interactive edge floor)
  textSecondary: '#B8B4C0',
  textTertiary: '#8C8796',
  successBg: '#0E2E22',
  warningBg: '#3A2A07',
  errorBg: '#3A1119',
} as const;

// ── Semantic layer ───────────────────────────────────────────────────────────
export const lightColors = {
  // brand
  primary: colors.amihan[500],
  primaryLight: colors.amihan[100],
  primaryDark: colors.amihan[700],
  primaryInk: colors.amihan[700], // brand text/link on light
  onPrimary: colors.neutral.white,

  secondary: colors.dalisay[500],
  secondaryLight: colors.dalisay[100],
  secondaryDark: colors.dalisay[700],
  secondaryInk: colors.dalisay[700],
  onSecondary: colors.neutral.white,

  accent: colors.luna[500],
  accentInk: colors.luna[700],
  onAccent: colors.neutral.white,

  // surfaces
  background: colors.neutral.white,
  surface: colors.neutral[50],
  surfaceElevated: colors.neutral.white,
  raised: colors.neutral[100],
  brandBackground: '#0F0814',
  brandSurface: withAlpha(colors.neutral.white, 0.08),
  brandSurfaceElevated: withAlpha(colors.neutral.white, 0.12),
  brandBorder: withAlpha(colors.neutral.white, 0.14),
  brandOverlay: withAlpha(colors.neutral.black, 0.55),
  brandScrim: withAlpha(colors.neutral.black, 0.72),
  tabBar: withAlpha(colors.neutral[950], 0.92),
  tabBarBorder: withAlpha(colors.neutral.white, 0.12),
  tabActive: colors.amihan[500],
  tabInactive: colors.neutral[500],
  chip: withAlpha(colors.amihan[500], 0.1),
  chipBorder: withAlpha(colors.amihan[500], 0.22),

  // lines
  border: colors.neutral[200],
  borderStrong: colors.neutral[500], // ≥3:1 on light surface (interactive edge floor)
  divider: colors.neutral[200],

  // text
  text: colors.neutral[900],
  textSecondary: colors.neutral[600],
  textTertiary: colors.neutral[500],
  placeholder: colors.neutral[500],

  // states
  disabled: colors.neutral[300],
  disabledText: colors.neutral[400],
  overlay: 'rgba(26,26,26,0.45)',
  backdrop: 'rgba(26,26,26,0.65)',

  // status
  success: colors.success[600],
  successBg: colors.success[100],
  successInk: colors.success[700],
  warning: colors.warning[600],
  warningBg: colors.warning[100],
  warningInk: colors.warning[700],
  error: colors.error[600],
  errorBg: colors.error[100],
  errorInk: colors.error[700],
  danger: colors.error[600],
  dangerBg: colors.error[100],
  dangerInk: colors.error[700],
  onStatus: colors.neutral.white,
} satisfies Record<string, string>;

export type SemanticColors = Record<keyof typeof lightColors, string>;
export type ColorScheme = 'light' | 'dark';

export const darkColors = {
  // brand
  primary: colors.amihan[500],
  primaryLight: colors.amihan[300],
  primaryDark: colors.amihan[700],
  primaryInk: colors.amihan[400], // lighter pink reads on dark
  onPrimary: colors.neutral.white,

  secondary: colors.dalisay[500],
  secondaryLight: colors.dalisay[200],
  secondaryDark: colors.dalisay[700],
  secondaryInk: colors.dalisay[300],
  onSecondary: colors.neutral.white,

  accent: colors.luna[500],
  accentInk: colors.luna[300],
  onAccent: colors.neutral.white,

  // surfaces
  background: darkGround.bg,
  surface: darkGround.surface,
  surfaceElevated: darkGround.surfaceElevated,
  raised: darkGround.raised,
  brandBackground: darkGround.bg,
  brandSurface: withAlpha(colors.neutral.white, 0.08),
  brandSurfaceElevated: withAlpha(colors.neutral.white, 0.12),
  brandBorder: withAlpha(colors.neutral.white, 0.14),
  brandOverlay: withAlpha(colors.neutral.black, 0.55),
  brandScrim: withAlpha(colors.neutral.black, 0.72),
  tabBar: withAlpha(colors.neutral[950], 0.92),
  tabBarBorder: withAlpha(colors.neutral.white, 0.12),
  tabActive: colors.amihan[500],
  tabInactive: darkGround.textTertiary,
  chip: withAlpha(colors.neutral.white, 0.08),
  chipBorder: withAlpha(colors.neutral.white, 0.14),

  // lines
  border: darkGround.border,
  borderStrong: darkGround.borderStrong,
  divider: darkGround.raised,

  // text
  text: colors.neutral[50],
  textSecondary: darkGround.textSecondary,
  textTertiary: darkGround.textTertiary,
  placeholder: darkGround.textTertiary,

  // states
  disabled: darkGround.border,
  disabledText: darkGround.borderStrong,
  overlay: 'rgba(0,0,0,0.60)',
  backdrop: 'rgba(0,0,0,0.72)',

  // status
  success: colors.success[600],
  successBg: darkGround.successBg,
  successInk: colors.success[300],
  warning: colors.warning[600],
  warningBg: darkGround.warningBg,
  warningInk: colors.warning[300],
  error: colors.error[600],
  errorBg: darkGround.errorBg,
  errorInk: colors.error[300],
  danger: colors.error[600],
  dangerBg: darkGround.errorBg,
  dangerInk: colors.error[300],
  onStatus: colors.neutral.white,
} satisfies SemanticColors;

/** Pick the semantic theme for a color scheme. Prefer the `useTheme()` hook in components. */
export const getSemanticColors = (scheme: ColorScheme): SemanticColors =>
  scheme === 'dark' ? darkColors : lightColors;

/**
 * Backward-compatible alias. Existing imports of `semanticColors` keep working
 * (light theme). New/migrated code should read colors via `useTheme()`.
 */
export const semanticColors = lightColors;
