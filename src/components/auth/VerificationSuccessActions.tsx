import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import SecondaryButton from "@/src/components/ui/SecondaryButton";
import { theme } from "@/src/theme";

interface Props {
  countdown: number;
  onContinue: () => void;
  onCancel: () => void;
}

export default function VerificationSuccessActions({ countdown, onContinue, onCancel }: Props) {
  return (
    <View style={styles.container}>
      <PrimaryButton title="Continue Setup" onPress={onContinue} />
      <SecondaryButton title="Back to Sign In" variant="white" onPress={onCancel} />
      <Text style={styles.note}>
        Automatically continuing in {countdown}s
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", gap: 12, paddingHorizontal: theme.spacing.lg },
  note: {
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    marginTop: 6,
    fontFamily: theme.fontFamilies.body.regular,
    fontSize: Platform.select({ ios: 14, android: 14, web: 14 }),
  },
});