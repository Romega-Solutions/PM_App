/**
 * UserTypeCard Component
 *
 * Individual card for selecting user type (Filipina or Foreign Man).
 * Shows icon, title, description, and checkmark when selected.
 */

import { theme } from "@/src/theme";
import { Heart, Users } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type UserType = "filipina" | "foreigner";

interface UserTypeCardProps {
  type: UserType;
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}

export const UserTypeCard: React.FC<UserTypeCardProps> = ({
  type,
  title,
  description,
  isSelected,
  onSelect,
}) => {
  const Icon = type === "filipina" ? Heart : Users;
  const iconColor =
    type === "filipina" ? theme.colors.amihan[500] : theme.colors.dalisay[500];

  return (
    <Pressable
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={onSelect}
      accessible
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={title}
    >
      <View
        style={[styles.iconCircle, isSelected && styles.iconCircleSelected]}
      >
        <Icon
          size={32}
          color={isSelected ? theme.colors.neutral.white : iconColor}
          fill={isSelected ? theme.colors.neutral.white : "transparent"}
          strokeWidth={2.5}
        />
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>

      {isSelected && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.12)",
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  cardSelected: {
    backgroundColor: "rgba(141,105,246,0.15)",
    borderColor: theme.colors.dalisay[500],
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(239,62,120,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  iconCircleSelected: {
    backgroundColor: theme.colors.amihan[500],
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: theme.fontFamilies.header.semiBold,
    color: theme.colors.neutral.white,
    marginBottom: theme.spacing.xs,
  },
  cardDescription: {
    fontSize: 13,
    fontFamily: theme.fontFamilies.body.regular,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 19,
  },
  checkmark: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.dalisay[500],
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkText: {
    fontSize: 16,
    color: theme.colors.neutral.white,
    fontWeight: "bold",
  },
});
