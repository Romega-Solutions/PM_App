/**
 * LikesFilter Component
 *
 * Filter tabs for switching between "All Matches" and "Mutual Matches".
 * Provides visual feedback for active filter state.
 */

import { Heart } from "lucide-react-native";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ACCENT_PINK = "#EF3E78";
const WHITE = "#FFFFFF";
const FILTER_HIT_SLOP = { top: 8, right: 8, bottom: 8, left: 8 };

interface LikesFilterProps {
  filter: "all" | "mutual";
  onFilterChange: (filter: "all" | "mutual") => void;
  allCount?: number;
  mutualCount?: number;
}

export const LikesFilter: React.FC<LikesFilterProps> = ({
  filter,
  onFilterChange,
  allCount = 0,
  mutualCount = 0,
}) => {
  return (
    <View
      style={styles.filterContainer}
      accessibilityRole="tablist"
      accessibilityLabel="Match filters"
    >
      <TouchableOpacity
        style={[styles.filterTab, filter === "all" && styles.filterTabActive]}
        onPress={() => onFilterChange("all")}
        activeOpacity={0.82}
        hitSlop={FILTER_HIT_SLOP}
        accessibilityRole="tab"
        accessibilityLabel={`Show all matches, ${allCount} total`}
        accessibilityHint="Shows every current match in your list"
        accessibilityState={{ selected: filter === "all" }}
      >
        <Text
          style={[
            styles.filterText,
            filter === "all" && styles.filterTextActive,
          ]}
        >
          All Matches
        </Text>
        <Text style={styles.countText}>{allCount}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterTab,
          filter === "mutual" && styles.filterTabActive,
        ]}
        onPress={() => onFilterChange("mutual")}
        activeOpacity={0.82}
        hitSlop={FILTER_HIT_SLOP}
        accessibilityRole="tab"
        accessibilityLabel={`Show mutual matches only, ${mutualCount} total`}
        accessibilityHint="Shows only matches where both members liked each other"
        accessibilityState={{ selected: filter === "mutual" }}
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
        <Text style={styles.countText}>{mutualCount}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  filterTab: {
    minHeight: 48,
    marginRight: 24,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  filterTabActive: {
    borderBottomColor: ACCENT_PINK,
  },
  filterText: {
    fontSize: 14,
    fontFamily: "DMSans-SemiBold",
    color: "rgba(255,255,255,0.68)",
    letterSpacing: 0.3,
  },
  filterTextActive: {
    color: WHITE,
  },
  countText: {
    color: "rgba(255,255,255,0.48)",
    fontSize: 12,
    fontFamily: "DMSans-Bold",
    textAlign: "center",
  },
});
