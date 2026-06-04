import { colors, semanticColors, lightColors, darkColors } from "./colors";
import { borderRadius, spacing } from "../shared/utils/spacing";
import { fontFamilies, fontSizes, textStyles } from "./typography";
import { iconSizes } from "./iconSizes";
import {
  componentSizes,
  hitSlop,
  interaction,
  motion,
  strokeWidths,
  touchTargets,
} from "./interaction";

// Re-export everything
export {
  colors,
  semanticColors,
  lightColors,
  darkColors,
  getSemanticColors,
} from "./colors";
export type { SemanticColors, ColorScheme } from "./colors";
export { borderRadius, spacing } from "../shared/utils/spacing";
export {
  fontFamilies,
  fontSizes,
  lineHeights,
  textStyles,
  lineHeightFor,
} from "./typography";
export { iconSizes } from "./iconSizes";
export type { IconSize } from "./iconSizes";
export {
  componentSizes,
  hitSlop,
  interaction,
  motion,
  strokeWidths,
  touchTargets,
} from "./interaction";
export { useTheme } from "./useTheme";
export type { AppTheme } from "./useTheme";
export { withAlpha } from "./colorUtils";

// Export a complete theme object (defaults to the light semantic palette)
export const theme = {
  colors,
  semanticColors,
  lightColors,
  darkColors,
  fontFamilies,
  fontSizes,
  textStyles,
  spacing,
  borderRadius,
  iconSizes,
  interaction,
  touchTargets,
  componentSizes,
  hitSlop,
  strokeWidths,
  motion,
} as const;

// Type exports for TypeScript
export type Theme = typeof theme;
export type Colors = typeof colors;
