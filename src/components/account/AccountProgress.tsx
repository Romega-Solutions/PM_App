import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "@/src/theme";

interface Props {
  steps: number;
  activeIndex: number; // zero-based
  size?: number;
  gap?: number;
  showBackButton?: boolean;
}

export default function AccountProgress({
  steps,
  activeIndex,
  size = 8,
  gap = 8,
  showBackButton = activeIndex > 0,
}: Props) {
  const router = useRouter();
  const currentStep = Math.min(activeIndex + 1, steps);

  return (
    <View style={styles.container}>
      {showBackButton ? (
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.82}
          accessibilityRole="button"
          accessibilityLabel="Go back to the previous setup step"
          accessibilityHint="Returns to the previous profile setup screen"
          hitSlop={8}
        >
          <ChevronLeft
            size={24}
            color={theme.colors.neutral.white}
            strokeWidth={2.4}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.backButtonPlaceholder} />
      )}

      <View style={styles.progressGroup}>
        <Text style={styles.stepLabel}>Step {currentStep} of {steps}</Text>
        <View
          style={[styles.row, { gap }]}
          accessibilityRole="progressbar"
          accessibilityLabel={`Profile setup step ${currentStep} of ${steps}`}
          accessibilityValue={{
            min: 1,
            max: steps,
            now: currentStep,
          }}
        >
          {Array.from({ length: steps }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  width: i === activeIndex ? Math.max(size * 3.5, 28) : size,
                  backgroundColor:
                    i <= activeIndex
                      ? theme.colors.dalisay[500]
                      : "rgba(255,255,255,0.25)",
                  borderRadius: 999,
                },
              ]}
              accessible={false}
            />
          ))}
        </View>
      </View>

      <View style={styles.backButtonPlaceholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  backButton: {
    alignItems: "center",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  backButtonPlaceholder: {
    height: 44,
    width: 44,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
  progressGroup: {
    alignItems: "center",
    flex: 1,
    gap: 8,
    paddingHorizontal: 8,
  },
  stepLabel: {
    color: "rgba(255,255,255,0.78)",
    fontFamily: theme.fontFamilies.body.semiBold,
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
  },
  dot: {
    height: 8,
  },
});
