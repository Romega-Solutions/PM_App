import React from "react";
import { View, StyleSheet } from "react-native";
import { colors, useTheme, withAlpha } from "@/src/theme";

interface Props {
  steps: number;
  activeIndex: number; // zero-based
  size?: number;
  gap?: number;
}

export default function AccountProgress({ steps, activeIndex, size = 8, gap = 8 }: Props) {
  const { colors: themeColors } = useTheme();
  const currentStep = Math.min(Math.max(activeIndex + 1, 1), steps);

  return (
    <View
      style={[styles.row, { gap }]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Account setup progress, step ${currentStep} of ${steps}`}
      accessibilityValue={{ min: 1, max: steps, now: currentStep }}
    >
      {Array.from({ length: steps }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              width: i === activeIndex ? Math.max(size * 3.5, 28) : size,
              backgroundColor:
                i === activeIndex
                  ? themeColors.secondary
                  : withAlpha(colors.neutral.white, 0.25),
              borderRadius: 999,
            },
          ]}
          accessible={false}
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
