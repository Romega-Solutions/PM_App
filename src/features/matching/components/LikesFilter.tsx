/**
 * LikesFilter Component
 *
 * Filter tabs for switching between "All Matches" and "Mutual Matches".
 * Provides visual feedback for active filter state.
 */

import { Heart } from "lucide-react-native";
import React from "react";
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const ACCENT_PINK = "#EF3E78";
const WHITE = "#FFFFFF";
const SURFACE = "rgba(255,255,255,0.06)";
const SURFACE_BORDER = "rgba(141,105,246,0.18)";

interface LikesFilterProps {
  filter: "all" | "mutual";
  onFilterChange: (filter: "all" | "mutual") => void;
}

export const LikesFilter: React.FC<LikesFilterProps> = ({
  filter,
  onFilterChange,
}) => {
  return (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[styles.filterTab, filter === "all" && styles.filterTabActive]}
        onPress={() => onFilterChange("all")}
        accessibilityRole="button"
        accessibilityLabel="Show all matches"
      >
        <Text
          style={[
            styles.filterText,
            filter === "all" && styles.filterTextActive,
          ]}
        >
          All Matches
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterTab,
          filter === "mutual" && styles.filterTabActive,
        ]}
        onPress={() => onFilterChange("mutual")}
        accessibilityRole="button"
        accessibilityLabel="Show mutual matches only"
      >
        <Heart
          size={14}
          color={filter === "mutual" ? WHITE : ACCENT_PINK}
          fill={filter === "mutual" ? WHITE : "transparent"}
          strokeWidth={2}
        />
        <Text
          style={[
            styles.filterText,
            filter === "mutual" && styles.filterTextActive,
          ]}
        >
          Mutual
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 12,
  },
  filterTab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: SURFACE_BORDER,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: ACCENT_PINK,
    borderColor: ACCENT_PINK,
    ...Platform.select({
      ios: {
        shadowColor: ACCENT_PINK,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  filterText: {
    fontSize: 14,
    fontFamily: "DMSans-SemiBold",
    color: ACCENT_PINK,
    letterSpacing: 0.3,
  },
  filterTextActive: {
    color: WHITE,
  },
});
