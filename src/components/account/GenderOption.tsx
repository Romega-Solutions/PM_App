import { useAppTheme, makeStyles } from "@/src/theme";
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
  const theme = useAppTheme();
  const styles = useStyles();

  const selectedColor = theme.colors.amihan?.[500] ?? "#EF3E78";
  const defaultColor = theme.colors.dalisay?.[500] ?? "#8D69F6";

  return (
    <TouchableOpacity
      onPress={onSelect}
      style={[styles.container, selected && styles.containerActive]}
      activeOpacity={0.9}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`Select ${option} as gender`}
    >
      <View style={[styles.iconBox, selected && styles.iconBoxActive]}>
        <Users size={18} color={selected ? selectedColor : defaultColor} />
      </View>

      <Text
        style={[styles.text, selected && styles.textActive]}
        numberOfLines={1}
      >
        {option}
      </Text>

      <View style={[styles.radio, selected && styles.radioActive]}>
        {selected && (
          <View style={[styles.radioDot, { backgroundColor: selectedColor }]} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    width: "100%", // full width vertical layout
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 16 : 14,
    minHeight: Platform.OS === "ios" ? 60 : 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  containerActive: {
    backgroundColor: "rgba(239,62,120,0.12)",
    borderColor: "rgba(239,62,120,0.28)",
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(141,105,246,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxActive: {
    backgroundColor: "rgba(239,62,120,0.12)",
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
    borderColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: {
    borderColor: theme.colors.amihan?.[500] ?? "#EF3E78",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
}));
