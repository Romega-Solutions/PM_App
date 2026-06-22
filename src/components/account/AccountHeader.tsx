import React from "react";
import { View, Text, StyleSheet, Dimensions, Platform } from "react-native";
import { useAppTheme, makeStyles } from "@/src/theme";

const { width } = Dimensions.get("window");
const TITLE_SIZE = Math.min(width * 0.08, 32);

interface Props {
  title?: string;
  subtitle?: string;
}

export default function AccountHeader({
  title = "Tell us about yourself",
  subtitle = "Let's start with the basics to create your profile",
}: Props) {
  const theme = useAppTheme();
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
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
    color: "rgba(255,255,255,0.85)",
    fontFamily: theme.fontFamilies.body.regular,
    textAlign: "center",
    paddingHorizontal: theme.spacing.md,
  },
}));