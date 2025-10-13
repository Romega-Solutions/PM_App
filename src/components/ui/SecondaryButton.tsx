// src/components/ui/SecondaryButton.tsx
import React from "react";
import {
  ActivityIndicator,
  DimensionValue,
  Platform,
  Text,
  TouchableOpacity,
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

/**
 * SecondaryButton
 * Outline button for secondary actions.
 * Title/head/body mapping: Title = HelloParis, Head = Lora, Body/UI = DMSans.
 * This component uses Body/UI font.
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

  const colors = (() => {
    switch (variant) {
      case "purple":
        return {
          bg: "rgba(141, 105, 246, 0.12)",
          border: "rgba(141, 105, 246, 0.4)",
          shadow: "#8D69F6",
          textGlow: "rgba(141, 105, 246, 0.5)",
        };
      case "pink":
        return {
          bg: "rgba(239, 62, 120, 0.12)",
          border: "rgba(239, 62, 120, 0.4)",
          shadow: "#EF3E78",
          textGlow: "rgba(239, 62, 120, 0.5)",
        };
      case "white":
        return {
          bg: "rgba(255, 255, 255, 0.12)",
          border: "rgba(255, 255, 255, 0.4)",
          shadow: "#FFFFFF",
          textGlow: "rgba(255, 255, 255, 0.5)",
        };
      default:
        return {
          bg: "rgba(141, 105, 246, 0.12)",
          border: "rgba(141, 105, 246, 0.4)",
          shadow: "#8D69F6",
          textGlow: "rgba(141, 105, 246, 0.5)",
        };
    }
  })();

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={{
        backgroundColor: colors.bg,
        borderRadius: BORDER_RADIUS,
        height: BUTTON_HEIGHT,
        borderWidth: Platform.select({ ios: 1.5, android: 2 }),
        borderColor: colors.border,
        justifyContent: "center",
        alignItems: "center",
        width,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: Platform.select({ ios: 0.25, android: 0.2 }) as number,
        shadowRadius: 12,
        elevation: 6,
        opacity: isDisabled ? 0.6 : 1,
      }}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isDisabled}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingHorizontal: 16,
        }}
      >
        {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : null}

        <Text
          style={{
            color: "#FFFFFF",
            fontSize: FONT_SIZE,
            fontFamily: "DMSans-SemiBold", // Body/UI font per mapping
            letterSpacing: Platform.select({ ios: 0.5, android: 0.3 }),
            textShadowColor: colors.textGlow,
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 4,
          }}
        >
          {loading ? "Loading..." : title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
