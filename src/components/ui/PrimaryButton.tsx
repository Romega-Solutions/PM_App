import { theme, useTheme, withAlpha } from "@/src/theme";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  DimensionValue,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  showChevron?: boolean;
  disabled?: boolean;
  loading?: boolean;
  width?: DimensionValue;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function PrimaryButton({
  title,
  onPress,
  showChevron = true,
  disabled = false,
  loading = false,
  width: customWidth = "100%",
  accessibilityLabel,
  accessibilityHint,
}: PrimaryButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        {
          width: customWidth,
          opacity: isDisabled ? 0.56 : pressed ? 0.9 : 1,
          shadowColor: colors.primary,
        },
      ]}
      onPress={onPress}
      disabled={isDisabled}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      android_ripple={{ color: withAlpha(colors.onPrimary, 0.18) }}
    >
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.onPrimary} />
        ) : null}

        <Text style={[styles.text, { color: colors.onPrimary }]}>
          {loading ? "Loading..." : title}
        </Text>

        {showChevron && !loading ? (
          <ChevronRight
            size={theme.iconSizes.control}
            color={colors.onPrimary}
            strokeWidth={theme.strokeWidths.emphasis}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: theme.componentSizes.button,
    borderRadius: theme.borderRadius.full,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: Platform.select({ ios: 0.38, android: 0.28, web: 0.24 }),
    shadowRadius: 18,
    elevation: 10,
    overflow: "hidden",
  },
  content: {
    minHeight: theme.componentSizes.button,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.touchGap,
    paddingHorizontal: theme.spacing.lg,
  },
  text: {
    ...theme.textStyles.button,
    textAlign: "center",
  },
});
