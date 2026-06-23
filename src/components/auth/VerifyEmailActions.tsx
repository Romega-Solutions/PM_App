import SecondaryButton from "@/src/components/ui/SecondaryButton";
import { useAppTheme, makeStyles } from "@/src/theme";
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
  const theme = useAppTheme();
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.openBtn}
        onPress={onOpenEmailApp}
        activeOpacity={0.86}
        accessibilityRole="button"
        accessibilityLabel="Open Email App"
        accessibilityHint="Opens your email app so you can tap the latest PinayMate verification link"
      >
        <LinearGradient
          colors={[theme.semanticColors.primary, theme.semanticColors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <Mail size={18} color={theme.colors.neutral.white} style={{ marginRight: 8 }} />
        <Text style={styles.openBtnText}>Open Email App</Text>
      </TouchableOpacity>

      <SecondaryButton
        title="Resend Email"
        variant="white"
        onPress={onResend}
        accessibilityLabel="Resend Verification Email"
        accessibilityHint="Sends a new verification link to your signup email"
      />

      <TouchableOpacity
        onPress={onBackToSignIn}
        style={styles.backLink}
        accessibilityRole="button"
        accessibilityLabel="Back to sign in"
        accessibilityHint="Returns to sign in if your email is already verified"
      >
        <Text style={styles.backText}>Back to Sign In</Text>
      </TouchableOpacity>

      {countdown > 0 ? (
        <Text style={styles.countdown}>Auto advancing in {countdown}s</Text>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
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
    color: theme.colors.neutral.white,
    fontSize: 17,
    fontFamily: theme.fontFamilies.body.bold,
  },
  backLink: {
    minHeight: 44,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
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
}));
