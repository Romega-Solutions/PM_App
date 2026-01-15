import SecondaryButton from "@/src/components/ui/SecondaryButton";
import { theme } from "@/src/theme";
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
  onSkipToAccountSetup?: () => void;
}

export default function VerifyEmailActions({
  countdown,
  onOpenEmailApp,
  onResend,
  onBackToSignIn,
  onSkipToAccountSetup,
}: Props) {
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
          colors={["#EF3E78", "#8D69F6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <Mail size={18} color="#FFF" style={{ marginRight: 8 }} />
        <Text style={styles.openBtnText}>Open Email App</Text>
      </TouchableOpacity>

      <SecondaryButton
        title="Resend Email"
        variant="white"
        onPress={onResend}
        accessibilityLabel="Resend Verification Email"
      />

      {/* Skip to Account Setup Button */}
      {onSkipToAccountSetup && (
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={onSkipToAccountSetup}
          activeOpacity={0.86}
          accessibilityRole="button"
          accessibilityLabel="Skip to Account Setup"
        >
          <Text style={styles.skipBtnText}>⚡ Skip & Continue Setup</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={onBackToSignIn}
        style={styles.backLink}
        accessibilityRole="button"
      >
        <Text style={styles.backText}>Back to Sign In</Text>
      </TouchableOpacity>

      {countdown > 0 ? (
        <Text style={styles.countdown}>Auto advancing in {countdown}s</Text>
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
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: theme.fontFamilies.body.bold,
  },
  skipBtn: {
    height: Platform.select({ ios: 56, android: 52 }),
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(141, 105, 246, 0.25)",
    borderWidth: 2,
    borderColor: "rgba(141, 105, 246, 0.6)",
  },
  skipBtnText: {
    color: "#8D69F6",
    fontSize: 16,
    fontFamily: theme.fontFamilies.body.bold,
  },
  backLink: {
    paddingVertical: 12,
    alignItems: "center",
  },
  backText: {
    color: "rgba(255,255,255,0.8)",
    textDecorationLine: "underline",
    fontFamily: theme.fontFamilies.body.regular,
  },
  countdown: {
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    marginTop: 6,
    fontFamily: theme.fontFamilies.body.regular,
  },
});
