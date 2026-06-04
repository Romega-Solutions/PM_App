import React from "react";
import { TouchableOpacity, View, Text, StyleSheet, Platform } from "react-native";
import { Users } from "lucide-react-native";
import { theme, withAlpha } from "@/src/theme";

interface Props {
  option: string;
  selected: boolean;
  onSelect: () => void;
}

export default function GenderPreferenceOption({ option, selected, onSelect }: Props) {
  const ACCENT_PINK = theme.colors.amihan[500];
  const ACCENT_PURPLE = theme.colors.dalisay[500];
  const ICON_BG = withAlpha(ACCENT_PURPLE, 0.12);

  return (
    <TouchableOpacity onPress={onSelect} style={[styles.row, selected && styles.rowActive]} activeOpacity={0.9} accessibilityRole="radio" accessibilityState={{ selected }}>
      <View style={[styles.iconBox, { backgroundColor: ICON_BG }]}>
        <Users size={18} color={selected ? ACCENT_PINK : ACCENT_PURPLE} strokeWidth={2.5} />
      </View>
      <Text style={[styles.text, selected && styles.textActive]} numberOfLines={1}>
        {option}
      </Text>
      <View style={[styles.radio, selected && { borderColor: ACCENT_PINK }]}>
        {selected && <View style={[styles.radioDot, { backgroundColor: ACCENT_PINK }]} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: theme.lightColors.brandSurface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: withAlpha(theme.colors.dalisay[500], 0.25),
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 16 : 14,
    minHeight: Platform.OS === "ios" ? 60 : 56,
    flexDirection: "row",
    alignItems: "center",
  },
  rowActive: {
    backgroundColor: withAlpha(theme.colors.amihan[500], 0.12),
    borderColor: theme.colors.amihan[500],
  },
  iconBox: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 14 },
  text: { flex: 1, fontSize: 16, color: theme.colors.neutral.white, fontFamily: theme.fontFamilies.body.medium },
  textActive: { fontFamily: theme.fontFamilies.body.semiBold },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: withAlpha(theme.colors.neutral.white, 0.6), alignItems: "center", justifyContent: "center" },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
});
