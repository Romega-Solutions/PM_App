/**
 * ProfilePreferencesCard
 *
 * Read-only summary of the user's saved match preferences on the profile
 * screen (looking-for, relationship goal, age range, max distance). Styling
 * consumes the shared Material tokens (spacing, icon sizes, stroke widths).
 */

import { theme, useTheme, withAlpha } from "@/src/theme";
import { Calendar, Heart, MapPin, Sparkles } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ProfilePreferencesCardProps {
  interestedIn?: string | null;
  relationshipGoal?: string | null;
  ageMin?: number | null;
  ageMax?: number | null;
  maxDistanceKm?: number | null;
}

const prettify = (value?: string | null): string =>
  value
    ? value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Not set";

export const ProfilePreferencesCard: React.FC<ProfilePreferencesCardProps> = ({
  interestedIn,
  relationshipGoal,
  ageMin,
  ageMax,
  maxDistanceKm,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const rows = [
    { Icon: Heart, label: "Looking for", value: prettify(interestedIn) },
    {
      Icon: Sparkles,
      label: "Relationship goal",
      value: prettify(relationshipGoal),
    },
    {
      Icon: Calendar,
      label: "Age range",
      value: ageMin && ageMax ? `${ageMin} – ${ageMax}` : "Not set",
    },
    {
      Icon: MapPin,
      label: "Max distance",
      value: maxDistanceKm ? `${maxDistanceKm} km` : "Not set",
    },
  ];

  return (
    <View
      style={styles.card}
      accessibilityRole="summary"
      accessibilityLabel="Your match preferences"
    >
      <Text style={styles.heading}>My preferences</Text>
      {rows.map(({ Icon, label, value }) => (
        <View key={label} style={styles.row}>
          <View style={styles.iconBox}>
            <Icon
              size={theme.iconSizes.control}
              color={colors.secondary}
              strokeWidth={theme.strokeWidths.emphasis}
            />
          </View>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
      ))}
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    card: {
      marginHorizontal: theme.spacing.screen,
      marginTop: theme.spacing.related,
      padding: theme.spacing.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.brandBorder,
      backgroundColor: colors.brandSurface,
      gap: theme.spacing.related,
    },
    heading: {
      fontFamily: "DMSans-Bold",
      fontSize: 16,
      color: colors.onPrimary,
      marginBottom: theme.spacing.fine,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.touchGap,
    },
    iconBox: {
      alignItems: "center",
      justifyContent: "center",
      height: theme.componentSizes.iconButton,
      width: theme.componentSizes.iconButton,
      borderRadius: 12,
      backgroundColor: withAlpha(colors.secondary, 0.12),
    },
    label: {
      flex: 1,
      fontFamily: "DMSans-Medium",
      fontSize: 14,
      color: withAlpha(colors.onPrimary, 0.7),
    },
    value: {
      fontFamily: "DMSans-SemiBold",
      fontSize: 14,
      color: colors.onPrimary,
      textAlign: "right",
      flexShrink: 1,
    },
  });
