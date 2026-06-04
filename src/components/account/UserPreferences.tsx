import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Heart, MapPin, Calendar } from "lucide-react-native";
import { colors, theme, useTheme, withAlpha } from "@/src/theme";

interface Props {
  interestedIn: string;
  ageRange: string;
  distance: number;
  relationshipGoal: string;
}

export default function UserPreferences({ interestedIn, ageRange, distance, relationshipGoal }: Props) {
  const { colors: themeColors } = useTheme();
  const ACCENT_PINK = themeColors.primary;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: withAlpha(colors.neutral.white, 0.06),
          borderColor: withAlpha(colors.neutral.white, 0.12),
        },
      ]}
      accessible
      accessibilityLabel={`Your preferences. Looking for ${interestedIn.toLowerCase()}. Age range ${ageRange}. Within ${distance} kilometers. ${relationshipGoal}.`}
    >
      <Text style={styles.sectionTitle}>Your preferences</Text>
      
      <View style={styles.row}>
        <View style={styles.iconBox}>
          <Heart size={16} color={ACCENT_PINK} strokeWidth={2.5} />
        </View>
        <Text style={styles.text}>Looking for {interestedIn.toLowerCase()}</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.iconBox}>
          <Calendar size={16} color={ACCENT_PINK} strokeWidth={2.5} />
        </View>
        <Text style={styles.text}>{ageRange} years old</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.iconBox}>
          <MapPin size={16} color={ACCENT_PINK} strokeWidth={2.5} />
        </View>
        <Text style={styles.text}>Within {distance} km</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.iconBox}>
          <Heart size={16} color={ACCENT_PINK} strokeWidth={2.5} fill={ACCENT_PINK} />
        </View>
        <Text style={styles.text}>{relationshipGoal}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: theme.fontFamilies.body.semiBold,
    color: withAlpha(colors.neutral.white, 0.95),
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: withAlpha(colors.amihan[500], 0.15),
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontFamily: theme.fontFamilies.body.regular,
    color: withAlpha(colors.neutral.white, 0.85),
  },
});
