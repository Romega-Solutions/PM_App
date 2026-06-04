import AuthLayout from "@/src/components/auth/AuthLayout";
import { colors, theme, withAlpha } from "@/src/theme";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <AuthLayout showBackButton onBackPress={() => router.back()}>
      <View style={styles.container}>
        <Text style={styles.title} accessibilityRole="header">
          Privacy Policy
        </Text>
        <Text style={styles.body}>
          PinayMate Privacy Policy content will appear here. For now, this route
          exists so users can review the app legal destination from the welcome
          flow.
        </Text>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
  },
  title: {
    color: colors.neutral.white,
    fontFamily: theme.fontFamilies.header.semiBold,
    fontSize: 32,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  body: {
    color: withAlpha(colors.neutral.white, 0.82),
    fontFamily: theme.fontFamilies.body.regular,
    fontSize: 15,
    lineHeight: 23,
    textAlign: "center",
  },
});
