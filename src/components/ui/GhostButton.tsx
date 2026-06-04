import { theme, useTheme, withAlpha } from "@/src/theme";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface GhostButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function GhostButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  icon,
  accessibilityLabel,
  accessibilityHint,
}: GhostButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        {
          opacity: isDisabled ? 0.48 : pressed ? 0.78 : 1,
          backgroundColor: pressed ? withAlpha(colors.onPrimary, 0.08) : "transparent",
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessible
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.onPrimary} />
      ) : (
        <View style={styles.content}>
          {icon ? <View style={styles.icon}>{icon}</View> : null}
          <Text style={[styles.text, { color: colors.onPrimary }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.xl,
    minHeight: theme.componentSizes.button,
    paddingVertical: theme.spacing.related,
    paddingHorizontal: theme.spacing.lg,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.touchGap,
  },
  text: {
    ...theme.textStyles.button,
    textAlign: "center",
  },
  icon: {
    marginRight: 0,
  },
});
