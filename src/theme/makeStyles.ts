import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { useAppTheme, AppTheme } from "./ThemeContext";

export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  styleFactory: (theme: AppTheme) => T
) {
  return () => {
    const theme = useAppTheme();
    return useMemo(() => StyleSheet.create(styleFactory(theme)), [theme]);
  };
}
