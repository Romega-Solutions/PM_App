/**
 * LikesHeader Component
 *
 * Displays the header section of the Likes screen with title and match count.
 * Shows dynamic subtitle based on filter state and match count.
 */

import React from "react";
import { Platform, Text, View } from "react-native";
import { makeStyles } from "@/src/theme/makeStyles";

interface LikesHeaderProps {
  matchCount: number;
  filter: "all" | "mutual";
}

export const LikesHeader: React.FC<LikesHeaderProps> = ({
  matchCount,
  filter,
}) => {
  const styles = useStyles();
  const subtitle =
    matchCount === 0
      ? filter === "mutual"
        ? "No mutual matches in this view"
        : "No matches yet"
      : `${matchCount} ${filter === "mutual" ? "mutual " : ""}match${
          matchCount !== 1 ? "es" : ""
        } ready`;

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.title}>Your Matches</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
};

const useStyles = makeStyles((theme) => ({
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 12 : 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: Platform.OS === "ios" ? 32 : 30,
    fontFamily: "Lora-Bold",
    color: theme.semanticColors.primary,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "DMSans-Regular",
    color: "rgba(255, 255, 255, 0.75)",
    letterSpacing: 0.2,
  },
}));
