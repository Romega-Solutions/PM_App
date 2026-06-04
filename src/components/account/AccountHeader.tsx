import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { colors, theme, withAlpha } from "@/src/theme";

const TITLE_SIZE = 32;

interface Props {
  title?: string;
  subtitle?: string;
}

export default function AccountHeader({
  title = "Tell us about yourself",
  subtitle = "Let's start with the basics to create your profile",
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", marginBottom: 12 },
  title: {
    fontSize: TITLE_SIZE,
    color: theme.colors.neutral.white,
    fontFamily: theme.fontFamilies.header.semiBold,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: Platform.select({ ios: 15, android: 15, web: 15 }),
    color: withAlpha(colors.neutral.white, 0.85),
    fontFamily: theme.fontFamilies.body.regular,
    textAlign: "center",
    paddingHorizontal: theme.spacing.md,
  },
});
