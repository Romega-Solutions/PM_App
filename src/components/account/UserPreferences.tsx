import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Heart, MapPin, Calendar } from "lucide-react-native";
import { theme } from "@/src/theme";

interface Props {
  interestedIn: string;
  ageRange: string;
  distance: number;
  relationshipGoal: string;
}

export default function UserPreferences({ interestedIn, ageRange, distance, relationshipGoal }: Props) {
  const ACCENT_PINK = theme.colors.amihan?.[500] ?? "#EF3E78";

  return (
    <View style={styles.container}>
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
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: theme.fontFamilies.body.semiBold,
    color: "rgba(255,255,255,0.95)",
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
    backgroundColor: "rgba(239,62,120,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontFamily: theme.fontFamilies.body.regular,
    color: "rgba(255,255,255,0.85)",
  },
});