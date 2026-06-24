import React, { createContext, useContext, useMemo } from "react";
import { colors as defaultColors, semanticColors as defaultSemanticColors } from "./colors";
import { spacing, borderRadius } from "../shared/utils/spacing";
import { fontFamilies, fontSizes, lineHeights, textStyles } from "./typography";

export type Colors = typeof defaultColors;
export type SemanticColors = typeof defaultSemanticColors;

export interface AppTheme {
  colors: Colors;
  semanticColors: SemanticColors;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  fontFamilies: typeof fontFamilies;
  fontSizes: typeof fontSizes;
  lineHeights: typeof lineHeights;
  textStyles: typeof textStyles;
  isDark: boolean;
}

const defaultTheme: AppTheme = {
  colors: defaultColors,
  semanticColors: defaultSemanticColors,
  spacing,
  borderRadius,
  fontFamilies,
  fontSizes,
  lineHeights,
  textStyles,
  isDark: true, // App is dark mode first
};

const ThemeContext = createContext<AppTheme>(defaultTheme);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isDark = true;

  const themeValue = useMemo<AppTheme>(() => {
    return {
      ...defaultTheme,
      isDark,
    };
  }, [isDark]);

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = (): AppTheme => {
  return useContext(ThemeContext);
};
