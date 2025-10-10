import React from "react";
import { DimensionValue, Platform, Text, TouchableOpacity } from "react-native";

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

/**
 * SecondaryButton Component
 * Outline button with brand colors and transparency
 * Used for secondary actions and alternative CTAs
 */
export default function SecondaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  width = "100%",
  variant = "purple",
  accessibilityLabel,
  accessibilityHint,
}: SecondaryButtonProps) {
  const BUTTON_HEIGHT = Platform.select({ ios: 56, android: 52 });
  const BORDER_RADIUS = Platform.select({ ios: 28, android: 26 });
  const FONT_SIZE = Platform.select({ ios: 18, android: 17 });

  // Variant-specific colors
  const getVariantColors = () => {
    switch (variant) {
      case "purple":
        return {
          backgroundColor: "rgba(141, 105, 246, 0.12)", // #8D69F6 with transparency
          borderColor: "rgba(141, 105, 246, 0.4)", // #8D69F6 border
          shadowColor: "#8D69F6", // Purple shadow
          textShadowColor: "rgba(141, 105, 246, 0.5)", // Purple glow
        };
      case "pink":
        return {
          backgroundColor: "rgba(239, 62, 120, 0.12)", // #EF3E78 with transparency
          borderColor: "rgba(239, 62, 120, 0.4)", // #EF3E78 border
          shadowColor: "#EF3E78", // Pink shadow
          textShadowColor: "rgba(239, 62, 120, 0.5)", // Pink glow
        };
      case "white":
        return {
          backgroundColor: "rgba(255, 255, 255, 0.12)", // White with transparency
          borderColor: "rgba(255, 255, 255, 0.4)", // White border
          shadowColor: "#FFFFFF", // White shadow
          textShadowColor: "rgba(255, 255, 255, 0.5)", // White glow
        };
      default:
        return {
          backgroundColor: "rgba(141, 105, 246, 0.12)",
          borderColor: "rgba(141, 105, 246, 0.4)",
          shadowColor: "#8D69F6",
          textShadowColor: "rgba(141, 105, 246, 0.5)",
        };
    }
  };

  const colors = getVariantColors();

  return (
    <TouchableOpacity
      style={{
        backgroundColor: colors.backgroundColor,
        borderRadius: BORDER_RADIUS,
        height: BUTTON_HEIGHT,
        borderWidth: Platform.select({ ios: 1.5, android: 2 }),
        borderColor: colors.borderColor,
        justifyContent: "center",
        alignItems: "center",
        width: width,
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: Platform.select({ ios: 0.25, android: 0.2 }),
        shadowRadius: 12,
        elevation: 6,
        opacity: disabled || loading ? 0.6 : 1,
      }}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled || loading}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
    >
      <Text
        style={{
          color: "#FFFFFF",
          fontSize: FONT_SIZE,
          fontFamily: "HelloParis",
          fontWeight: "600",
          letterSpacing: Platform.select({ ios: 0.5, android: 0.3 }),
          textShadowColor: colors.textShadowColor,
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 4,
        }}
      >
        {loading ? "Loading..." : title}
      </Text>
    </TouchableOpacity>
  );
}
