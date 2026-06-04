import { theme, useTheme, withAlpha, type SemanticColors } from "@/src/theme";
import { useRouter } from "expo-router";
import { SlidersHorizontal } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Filters() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View
        style={styles.iconWrap}
        accessible
        accessibilityRole="image"
        accessibilityLabel="Search filters"
      >
        <SlidersHorizontal size={32} color={colors.secondary} strokeWidth={2.5} />
      </View>

      <Text style={styles.title}>Search Filters</Text>
      <Text style={styles.description}>
        Filters are unavailable in this build.
      </Text>

      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [
          styles.closeButton,
          pressed && styles.closeButtonPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Close filters"
      >
        <Text style={styles.closeButtonText}>Close</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (colors: SemanticColors) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      backgroundColor: colors.brandBackground,
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: theme.spacing.xl,
    },
    iconWrap: {
      alignItems: "center",
      backgroundColor: withAlpha(colors.secondary, 0.14),
      borderColor: withAlpha(colors.secondary, 0.28),
      borderRadius: theme.borderRadius.full,
      borderWidth: 1,
      height: 72,
      justifyContent: "center",
      marginBottom: theme.spacing.lg,
      width: 72,
    },
    title: {
      color: colors.onPrimary,
      fontFamily: theme.fontFamilies.header.bold,
      fontSize: 24,
      marginBottom: theme.spacing.sm,
      textAlign: "center",
    },
    description: {
      color: withAlpha(colors.onPrimary, 0.72),
      fontFamily: theme.fontFamilies.body.regular,
      fontSize: 15,
      lineHeight: 22,
      marginBottom: theme.spacing.xl,
      textAlign: "center",
    },
    closeButton: {
      alignItems: "center",
      backgroundColor: colors.primary,
      borderRadius: theme.borderRadius.lg,
      justifyContent: "center",
      minHeight: 48,
      minWidth: 140,
      paddingHorizontal: theme.spacing.xl,
    },
    closeButtonPressed: {
      opacity: 0.86,
    },
    closeButtonText: {
      color: colors.onPrimary,
      fontFamily: theme.fontFamilies.body.semiBold,
      fontSize: 16,
    },
  });
