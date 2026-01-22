import React from "react";
import { Platform, StyleSheet, View } from "react-native";

const ACCENT_PINK = "#EF3E78";
const ACCENT_PURPLE = "#8D69F6";
const FOCUSED_CONTAINER_WIDTH = Platform.OS === "ios" ? 56 : 52;
const FOCUSED_CONTAINER_HEIGHT = Platform.OS === "ios" ? 36 : 34;

interface TabIconContainerProps {
  focused: boolean;
  color: string;
  children: React.ReactNode;
}

export const TabIconContainer: React.FC<TabIconContainerProps> = ({
  focused,
  color,
  children,
}) => (
  <View
    style={[
      styles.iconContainer,
      {
        backgroundColor: focused ? "rgba(239, 62, 120, 0.15)" : "transparent",
        borderWidth: focused ? 1.5 : 0,
        borderColor: focused ? ACCENT_PINK : "transparent",
      },
    ]}
  >
    {children}
    {focused && (
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: 16,
            backgroundColor: "rgba(141, 105, 246, 0.08)",
          },
        ]}
      />
    )}
  </View>
);

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    width: FOCUSED_CONTAINER_WIDTH,
    height: FOCUSED_CONTAINER_HEIGHT,
    ...Platform.select({
      ios: {
        shadowColor: ACCENT_PINK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0,
        shadowRadius: 8,
      },
      android: {
        elevation: 0,
      },
    }),
  },
});
