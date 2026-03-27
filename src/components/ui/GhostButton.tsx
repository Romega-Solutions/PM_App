import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, Platform } from "react-native";
import { theme } from "@/src/theme";

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
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.button, isDisabled && styles.buttonDisabled]}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessible
    >
      {loading ? (
        <ActivityIndicator size="small" color="rgba(255,255,255,0.85)" />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={[styles.text, isDisabled && styles.textDisabled]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    paddingVertical: Platform.OS === "ios" ? 16 : 14,
    paddingHorizontal: 24,
    minHeight: Platform.OS === "ios" ? 56 : 52,
    backgroundColor: "transparent",
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  text: {
    fontSize: 16,
    fontFamily: theme.fontFamilies?.body?.semiBold ?? "System",
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  textDisabled: {
    opacity: 0.6,
  },
  icon: {
    marginRight: 4,
  },
});