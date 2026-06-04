import SecondaryButton from "@/src/components/ui/SecondaryButton";
import { colors, theme, useTheme, withAlpha } from "@/src/theme";
import { LinearGradient } from "expo-linear-gradient";
import { Mail } from "lucide-react-native";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  countdown: number;
  onOpenEmailApp: () => void;
  onResend: () => void;
  onBackToSignIn: () => void;
}

export default function VerifyEmailActions({
  countdown,
  onOpenEmailApp,
  onResend,
  onBackToSignIn,
}: Props) {
  const { colors: themeColors } = useTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.openBtn}
        onPress={onOpenEmailApp}
        activeOpacity={0.86}
        accessibilityRole="button"
        accessibilityLabel="Open Email App"
      >
        <LinearGradient
          colors={[themeColors.primary, themeColors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <Mail size={18} color={themeColors.onPrimary} style={{ marginRight: 8 }} />
        <Text style={styles.openBtnText}>Open Email App</Text>
      </TouchableOpacity>

      <SecondaryButton
        title="Resend Email"
        variant="white"
        onPress={onResend}
        accessibilityLabel="Resend Verification Email"
      />

      <TouchableOpacity
        onPress={onBackToSignIn}
        style={styles.backLink}
        accessibilityRole="button"
      >
        <Text style={[styles.backText, { color: withAlpha(colors.neutral.white, 0.8) }]}>
          Back to Sign In
        </Text>
      </TouchableOpacity>

      {countdown > 0 ? (
        <Text style={[styles.countdown, { color: withAlpha(colors.neutral.white, 0.75) }]}>
          Auto advancing in {countdown}s
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 14,
  },
  openBtn: {
    height: Platform.select({ ios: 56, android: 52 }),
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    overflow: "hidden",
    elevation: 10,
  },
  openBtnText: {
    color: colors.neutral.white,
    fontSize: 17,
    fontFamily: theme.fontFamilies.body.bold,
  },
  backLink: {
    paddingVertical: 12,
    alignItems: "center",
  },
  backText: {
    textDecorationLine: "underline",
    fontFamily: theme.fontFamilies.body.regular,
  },
  countdown: {
    textAlign: "center",
    marginTop: 6,
    fontFamily: theme.fontFamilies.body.regular,
  },
});
