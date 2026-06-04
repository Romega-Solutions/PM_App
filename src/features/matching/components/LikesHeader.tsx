/**
 * LikesHeader Component
 *
 * Displays the header section of the Likes screen with title and match count.
 * Shows dynamic subtitle based on filter state and match count.
 */

import { useTheme, withAlpha } from "@/src/theme";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

interface LikesHeaderProps {
  matchCount: number;
  filter: "all" | "mutual";
}

export const LikesHeader: React.FC<LikesHeaderProps> = ({
  matchCount,
  filter,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.title}>Your Matches</Text>
        <Text style={styles.subtitle}>
          {matchCount} {filter === "mutual" ? "mutual" : ""} match
          {matchCount !== 1 ? "es" : ""} waiting
        </Text>
      </View>
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 12 : 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: Platform.OS === "ios" ? 32 : 30,
    fontFamily: "Lora-Bold",
    color: colors.primary,
    letterSpacing: 0,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "DMSans-Regular",
    color: withAlpha(colors.onPrimary, 0.75),
    letterSpacing: 0,
  },
});
