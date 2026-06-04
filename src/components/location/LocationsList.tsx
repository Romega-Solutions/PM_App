import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme, withAlpha } from "@/src/theme";

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
        <Text style={styles.empty}>{emptyLabel}</Text>
      ) : (
        locations.map((loc) => (
          <TouchableOpacity
            key={loc}
            style={styles.button}
            onPress={() => onSelect(loc)}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>{loc}</Text>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  button: {
    backgroundColor: withAlpha(theme.colors.neutral.white, 0.06),
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: withAlpha(theme.colors.neutral.white, 0.06),
  },
  buttonText: { color: theme.colors.neutral.white, fontSize: 15 },
  empty: {
    color: withAlpha(theme.colors.neutral.white, 0.6),
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 8,
  },
});
