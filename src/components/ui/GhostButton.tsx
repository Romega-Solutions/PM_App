import { useAppTheme, makeStyles } from "@/src/theme";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface GhostButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  icon?: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function GhostButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  loadingLabel,
  icon,
  accessibilityLabel,
  accessibilityHint,
}: GhostButtonProps) {
  const theme = useAppTheme();
  const styles = useStyles();

  const isDisabled = disabled || loading;
  const visibleTitle = loading ? (loadingLabel ?? "Working...") : title;
  const screenReaderLabel = loading
    ? `${accessibilityLabel || title}. ${loadingLabel ?? "In progress."}`
    : accessibilityLabel || title;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.button, isDisabled && styles.buttonDisabled]}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={screenReaderLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLiveRegion={loading ? "polite" : "none"}
      accessible
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color="rgba(255,255,255,0.85)" />
        ) : icon ? (
          <View style={styles.icon}>{icon}</View>
        ) : null}
        <Text
          style={[styles.text, isDisabled && styles.textDisabled]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.82}
          maxFontSizeMultiplier={1.25}
        >
          {visibleTitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const useStyles = makeStyles((theme) => ({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    paddingVertical: Platform.OS === "ios" ? 16 : 14,
    paddingHorizontal: 24,
    minHeight: Platform.OS === "ios" ? 56 : 52,
    minWidth: 48,
    backgroundColor: "transparent",
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    justifyContent: "center",
    maxWidth: "100%",
  },
  text: {
    fontSize: 16,
    fontFamily: theme.fontFamilies?.body?.semiBold ?? "System",
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    letterSpacing: 0,
    flexShrink: 1,
  },
  textDisabled: {
    opacity: 0.6,
  },
  icon: {
    marginRight: 4,
  },
}));
