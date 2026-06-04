import { theme, useTheme, withAlpha } from "@/src/theme";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import { Platform, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface BackButtonProps {
  onPress?: () => void;
  accessibilityLabel?: string;
}

export default function BackButton({
  onPress,
  accessibilityLabel = "Go back",
}: BackButtonProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        {
          top: insets.top + theme.spacing.md,
          left: theme.spacing.md,
          backgroundColor: pressed
            ? withAlpha(colors.onPrimary, 0.18)
            : withAlpha(colors.onPrimary, 0.12),
          shadowColor: colors.brandOverlay,
        },
      ]}
      onPress={handlePress}
      hitSlop={theme.hitSlop.sm}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <ArrowLeft
        size={theme.iconSizes.navigation}
        color={colors.onPrimary}
        strokeWidth={theme.strokeWidths.emphasis}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    zIndex: 10,
    width: theme.componentSizes.iconButton,
    height: theme.componentSizes.iconButton,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
