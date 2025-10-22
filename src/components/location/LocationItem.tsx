import React from "react";
import { TouchableOpacity, View, Text, StyleSheet, Platform } from "react-native";
import { MapPin, Navigation } from "lucide-react-native";

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  isCurrent?: boolean;
}

export default function LocationItem({ label, selected = false, onPress, isCurrent = false }: Props) {
  const ACCENT_PINK = "#EF3E78";
  const ACCENT_PURPLE = "#8D69F6";
  const SURFACE = "rgba(255,255,255,0.08)";
  const SURFACE_BORDER = "rgba(141,105,246,0.25)";
  const ICON_BG = "rgba(141,105,246,0.12)";

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.row, selected && styles.rowActive]}
      activeOpacity={0.88}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`Select ${label}`}
    >
      <View style={[styles.iconBox, { backgroundColor: ICON_BG }]}>
        {isCurrent ? (
          <Navigation size={18} color={selected ? ACCENT_PINK : ACCENT_PURPLE} strokeWidth={2.5} />
        ) : (
          <MapPin size={18} color={selected ? ACCENT_PINK : ACCENT_PURPLE} strokeWidth={2.5} />
        )}
      </View>

      <Text style={[styles.label, selected && styles.labelActive]} numberOfLines={1}>
        {label}
      </Text>

      <View style={[styles.radio, selected && { borderColor: ACCENT_PINK }]}>
        {selected && <View style={[styles.radioDot, { backgroundColor: ACCENT_PINK }]} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 12,
    minHeight: Platform.OS === "ios" ? 56 : 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowActive: {
    backgroundColor: "rgba(239,62,120,0.10)",
    borderColor: "rgba(239,62,120,0.28)",
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  label: {
    flex: 1,
    color: "#FFF",
    fontSize: 15,
  },
  labelActive: {
    fontWeight: "600",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
});