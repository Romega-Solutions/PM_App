import { theme, withAlpha, useTheme } from "@/src/theme";
import type { LucideIcon } from "lucide-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";

export const MAIN_TAB_ICON_SIZE = theme.iconSizes.navigation;

const PILL_WIDTH = theme.componentSizes.tabIconPillWidth;
const PILL_HEIGHT = theme.componentSizes.tabIconPillHeight;

interface MainTabIconProps {
  icon: LucideIcon;
  focused: boolean;
  color: string;
  fillOnFocus?: boolean;
}

export function MainTabIcon({
  icon: Icon,
  focused,
  color,
  fillOnFocus = false,
}: MainTabIconProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        focused && {
          backgroundColor: withAlpha(colors.tabActive, 0.15),
          borderColor: colors.tabActive,
          borderWidth: 1.5,
        },
      ]}
    >
      {focused && (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            styles.focusOverlay,
            { backgroundColor: withAlpha(colors.secondary, 0.08) },
          ]}
        />
      )}
      <Icon
        size={MAIN_TAB_ICON_SIZE}
        color={color}
        strokeWidth={focused ? theme.strokeWidths.emphasis : theme.strokeWidths.default}
        fill={fillOnFocus && focused ? color : "transparent"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    borderColor: "transparent",
    borderRadius: theme.borderRadius.xl,
    height: PILL_HEIGHT,
    width: PILL_WIDTH,
  },
  focusOverlay: {
    borderRadius: theme.borderRadius.xl,
  },
});
