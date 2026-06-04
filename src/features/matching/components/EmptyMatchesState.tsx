/**
 * EmptyMatchesState Component
 *
 * Displays an empty state when user has no matches.
 * Shows encouraging message to keep swiping.
 */

import { useTheme, withAlpha } from "@/src/theme";
import { Heart } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const EmptyMatchesState: React.FC = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.emptyState}>
      <Heart size={64} color={colors.secondary} strokeWidth={1.5} />
      <Text style={styles.emptyTitle}>No mutual matches yet</Text>
      <Text style={styles.emptyText}>
        Keep swiping to find your perfect match!
      </Text>
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Lora-Bold",
    color: colors.onPrimary,
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    color: withAlpha(colors.onPrimary, 0.65),
    textAlign: "center",
    letterSpacing: 0,
  },
});
