import { useColorScheme } from 'react-native';
import { getSemanticColors, type ColorScheme, type SemanticColors } from './colors';

export interface AppTheme {
  scheme: ColorScheme;
  isDark: boolean;
  colors: SemanticColors;
}

/**
 * Scheme-aware theme hook. Reads the OS color scheme and returns the matching
 * semantic palette. Use this in components instead of importing `semanticColors`
 * directly, so the UI follows light/dark.
 *
 * Note: dark mode only takes effect once `app.json` `userInterfaceStyle` is set
 * to `"automatic"`; it is currently `"light"` until component adoption is complete
 * (see docs/design/DESIGN_SYSTEM_AUDIT_2026-06-01.md).
 */
export function useTheme(): AppTheme {
  const scheme: ColorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return {
    scheme,
    isDark: scheme === 'dark',
    colors: getSemanticColors(scheme),
  };
}
