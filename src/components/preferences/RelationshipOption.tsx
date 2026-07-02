import React from "react";
import { TouchableOpacity, View, Text, Platform } from "react-native";
import { useAppTheme, makeStyles } from "@/src/theme";

interface Props {
  option: string;
  selected: boolean;
  onSelect: () => void;
}

export default function RelationshipOption({ option, selected, onSelect }: Props) {
  const theme = useAppTheme();
  const styles = useStyles();

  const ACCENT_PINK = theme.colors.amihan?.[500] ?? "#EF3E78";

  return (
    <TouchableOpacity
      onPress={onSelect}
      style={[styles.row, selected && styles.rowActive]}
      activeOpacity={0.9}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`Relationship preference: ${option}${selected ? ", selected" : ""}`}
      accessibilityHint="Updates what kind of connection you are open to seeing in discovery."
      hitSlop={{ top: 4, right: 4, bottom: 4, left: 4 }}
    >
      <Text
        style={[styles.text, selected && styles.textActive]}
        numberOfLines={2}
        maxFontSizeMultiplier={1.25}
      >
        {option}
      </Text>
      <View style={[styles.radio, selected && { borderColor: ACCENT_PINK }]}>
        {selected && (
          <View style={[styles.radioDot, { backgroundColor: ACCENT_PINK }]} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const useStyles = makeStyles((theme) => ({
  row: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(141,105,246,0.25)",
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 16 : 14,
    minHeight: Platform.OS === "ios" ? 60 : 56,
    flexDirection: "row",
    alignItems: "center",
  },
  rowActive: {
    backgroundColor: "rgba(239,62,120,0.12)",
    borderColor: "#EF3E78",
  },
  text: {
    flex: 1,
    fontSize: 16,
    color: "#FFF",
    fontFamily: theme.fontFamilies.body.medium,
  },
  textActive: { fontFamily: theme.fontFamilies.body.semiBold },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
}));
