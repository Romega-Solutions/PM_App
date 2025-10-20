import { colors, semanticColors } from "./colors";
import { borderRadius, spacing } from "./spacing";
import { fontFamilies, fontSizes, textStyles } from "./typography";

// Re-export everything
export { colors, semanticColors } from "./colors";
export { borderRadius, spacing } from "./spacing";
export { fontFamilies, fontSizes, lineHeights, textStyles } from "./typography";

// Export a complete theme object
export const theme = {
  colors,
  semanticColors,
  fontFamilies,
  fontSizes,
  textStyles,
  spacing,
  borderRadius,
} as const;

// Type exports for TypeScript
export type Theme = typeof theme;
export type Colors = typeof colors;
export type SemanticColors = typeof semanticColors;
