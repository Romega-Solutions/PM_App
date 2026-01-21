/**
 * EmptyMatchesState Component
 *
 * Displays an empty state when user has no matches.
 * Shows encouraging message to keep swiping.
 */

import { Heart } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const ACCENT_PURPLE = "#8D69F6";
const WHITE = "#FFFFFF";

export const EmptyMatchesState: React.FC = () => {
  return (
    <View style={styles.emptyState}>
      <Heart size={64} color={ACCENT_PURPLE} strokeWidth={1.5} />
      <Text style={styles.emptyTitle}>No mutual matches yet</Text>
      <Text style={styles.emptyText}>
        Keep swiping to find your perfect match!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
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
    color: WHITE,
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    color: "rgba(255, 255, 255, 0.65)",
    textAlign: "center",
    letterSpacing: 0.2,
  },
});
