import { colors, theme, useTheme, withAlpha } from "@/src/theme";
import { Users } from "lucide-react-native";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  option: string;
  selected: boolean;
  onSelect: () => void;
}

export default function GenderOption({ option, selected, onSelect }: Props) {
  const { colors: themeColors } = useTheme();
  const selectedColor = themeColors.primary;
  const defaultColor = themeColors.secondary;

  return (
    <TouchableOpacity
      onPress={onSelect}
      style={[
        styles.container,
        {
          backgroundColor: withAlpha(colors.neutral.white, 0.06),
          borderColor: withAlpha(colors.neutral.white, 0.06),
        },
        selected && {
          backgroundColor: withAlpha(themeColors.primary, 0.12),
          borderColor: withAlpha(themeColors.primary, 0.28),
        },
      ]}
      activeOpacity={0.9}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, selected }}
      accessibilityLabel={`Select ${option} as gender`}
      accessibilityHint={selected ? `${option} is selected` : `Select ${option}`}
    >
      <View
        style={[
          styles.iconBox,
          { backgroundColor: withAlpha(themeColors.secondary, 0.06) },
          selected && { backgroundColor: withAlpha(themeColors.primary, 0.12) },
        ]}
      >
        <Users size={18} color={selected ? selectedColor : defaultColor} />
      </View>

      <Text
        style={[styles.text, selected && styles.textActive]}
        numberOfLines={1}
      >
        {option}
      </Text>

      <View
        style={[
          styles.radio,
          { borderColor: withAlpha(colors.neutral.white, 0.6) },
          selected && { borderColor: themeColors.primary },
        ]}
      >
        {selected && (
          <View style={[styles.radioDot, { backgroundColor: selectedColor }]} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%", // full width vertical layout
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 16 : 14,
    minHeight: Platform.OS === "ios" ? 60 : 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
    color: theme.colors.neutral.white,
    fontSize: 16,
    fontFamily: theme.fontFamilies.body.medium,
  },
  textActive: {
    fontFamily: theme.fontFamilies.body.semiBold,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
