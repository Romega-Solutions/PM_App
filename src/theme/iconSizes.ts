/**
 * Icon size tokens (lucide-react-native). Mirrors the type scale so icon sizing
 * stops being hand-set per component. Default UI / nav = `base` (24).
 */
export const iconSizes = {
  xs: 16, // dense metadata
  sm: 18, // chips, labels
  md: 20, // buttons
  base: 24, // default UI & tab bar
  lg: 28, // feature
  xl: 32, // empty-state / hero
} as const;

export type IconSize = keyof typeof iconSizes;
