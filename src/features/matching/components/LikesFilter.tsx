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
        <Text
          style={[styles.countText, filter === "all" && styles.countTextActive]}
        >
          {allCount}
        </Text>
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
        <Text
          style={[
            styles.countText,
            filter === "mutual" && styles.countTextActive,
          ]}
        >
          {mutualCount}
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
    minHeight: 46,
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
  countText: {
    minWidth: 22,
    overflow: "hidden",
    borderRadius: 11,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: "rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    fontFamily: "DMSans-Bold",
    textAlign: "center",
  },
  countTextActive: {
    backgroundColor: "rgba(255,255,255,0.2)",
    color: WHITE,
  },
});
