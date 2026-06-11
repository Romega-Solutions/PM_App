import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  locations: string[];
  onSelect: (loc: string) => void;
  emptyLabel?: string;
}

export default function LocationsList({
  locations,
  onSelect,
  emptyLabel = "No locations found",
}: Props) {
  return (
    <View style={styles.container}>
      {locations.length === 0 ? (
        <View
          style={styles.emptyState}
          accessible
          accessibilityRole="text"
          accessibilityLabel={`${emptyLabel}. Try another nearby city or check your spelling.`}
        >
          <Text style={styles.emptyTitle}>{emptyLabel}</Text>
          <Text style={styles.emptyHelp}>
            Try a nearby city, province, or a shorter spelling.
          </Text>
        </View>
      ) : (
        locations.map((loc) => (
          <TouchableOpacity
            key={loc}
            style={styles.button}
            onPress={() => onSelect(loc)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={`Choose ${loc}`}
            accessibilityHint="Sets this as your profile location for launch-stage discovery."
          >
            <Text
              style={styles.buttonText}
              numberOfLines={2}
              maxFontSizeMultiplier={1.25}
            >
              {loc}
            </Text>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  button: {
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    minHeight: 48,
    justifyContent: "center",
  },
  buttonText: { color: "#FFF", fontSize: 15, lineHeight: 21 },
  emptyState: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  emptyTitle: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 21,
  },
  emptyHelp: {
    color: "rgba(255,255,255,0.64)",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
    textAlign: "center",
  },
});
