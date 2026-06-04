/**
 * LikesFilter Component
 *
 * Filter tabs for switching between "All Matches" and "Mutual Matches".
 * Provides visual feedback for active filter state.
 */

import { useTheme } from "@/src/theme";
import { Heart } from "lucide-react-native";
import React from "react";
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface LikesFilterProps {
  filter: "all" | "mutual";
  onFilterChange: (filter: "all" | "mutual") => void;
}

export const LikesFilter: React.FC<LikesFilterProps> = ({
  filter,
  onFilterChange,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

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
          color={filter === "mutual" ? colors.onPrimary : colors.primary}
          fill={filter === "mutual" ? colors.onPrimary : "transparent"}
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

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
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
    backgroundColor: colors.brandSurface,
    borderWidth: 1,
    borderColor: colors.brandBorder,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
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
    color: colors.primary,
    letterSpacing: 0,
  },
  filterTextActive: {
    color: colors.onPrimary,
  },
});
