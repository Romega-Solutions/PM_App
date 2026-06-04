import { theme, useTheme, withAlpha, type SemanticColors } from "@/src/theme";
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

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  width?: DimensionValue;
  variant?: "purple" | "pink" | "white";
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

type VariantStyle = {
  backgroundColor: string;
  borderColor: string;
  shadowColor: string;
  textColor: string;
};

const getVariantStyle = (
  colors: SemanticColors,
  variant: "purple" | "pink" | "white",
): VariantStyle => {
  if (variant === "pink") {
    return {
      backgroundColor: withAlpha(colors.primary, 0.12),
      borderColor: withAlpha(colors.primary, 0.4),
      shadowColor: colors.primary,
      textColor: colors.onPrimary,
    };
  }

  if (variant === "white") {
    return {
      backgroundColor: withAlpha(colors.onPrimary, 0.12),
      borderColor: withAlpha(colors.onPrimary, 0.38),
      shadowColor: colors.onPrimary,
      textColor: colors.onPrimary,
    };
  }

  return {
    backgroundColor: withAlpha(colors.secondary, 0.12),
    borderColor: withAlpha(colors.secondary, 0.4),
    shadowColor: colors.secondary,
    textColor: colors.onSecondary,
  };
};

export default function SecondaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  width: customWidth = "100%",
  variant = "purple",
  accessibilityLabel,
  accessibilityHint,
}: SecondaryButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;
  const variantStyle = getVariantStyle(colors, variant);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        {
          width: customWidth,
          backgroundColor: variantStyle.backgroundColor,
          borderColor: variantStyle.borderColor,
          shadowColor: variantStyle.shadowColor,
          opacity: isDisabled ? 0.56 : pressed ? 0.88 : 1,
        },
      ]}
      onPress={onPress}
      disabled={isDisabled}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      android_ripple={{ color: withAlpha(variantStyle.textColor, 0.14) }}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color={variantStyle.textColor} />
        ) : null}

        <Text style={[styles.text, { color: variantStyle.textColor }]}>
          {loading ? "Loading..." : title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: theme.componentSizes.button,
    borderRadius: theme.borderRadius.full,
    borderWidth: Platform.select({ ios: 1.5, android: 2, web: 1.5 }),
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: Platform.select({ ios: 0.24, android: 0.18, web: 0.18 }),
    shadowRadius: 12,
    elevation: 6,
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
