import React from "react";
import { View, StyleSheet } from "react-native";
import { theme } from "@/src/theme";

interface Props {
  steps: number;
  activeIndex: number; // zero-based
  size?: number;
  gap?: number;
}

export default function AccountProgress({ steps, activeIndex, size = 8, gap = 8 }: Props) {
  return (
    <View style={[styles.row, { gap }]}>
      {Array.from({ length: steps }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              width: i === activeIndex ? Math.max(size * 3.5, 28) : size,
              backgroundColor: i === activeIndex ? theme.colors.dalisay[500] : "rgba(255,255,255,0.25)",
              borderRadius: 999,
            },
          ]}
          accessibilityRole="progressbar"
          accessibilityState={{ busy: i === activeIndex }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row" },
  dot: {
    height: 8,
  },
});