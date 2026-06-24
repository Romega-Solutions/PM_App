import React from "react";
import { TouchableOpacity, View, Text, Platform } from "react-native";
import { MapPin, Navigation } from "lucide-react-native";
import { useAppTheme } from "../../theme/ThemeContext";
import { makeStyles } from "../../theme/makeStyles";

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  isCurrent?: boolean;
}

export default function LocationItem({
  label,
  selected = false,
  onPress,
  isCurrent = false,
}: Props) {
  const theme = useAppTheme();
  const styles = useStyles();

  const ACCENT_PINK = theme.semanticColors.primary;
  const ACCENT_PURPLE = theme.semanticColors.secondary;
  const ICON_BG = "rgba(141,105,246,0.12)";

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.row, selected && styles.rowActive]}
      activeOpacity={0.88}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${label}${isCurrent ? ", current location option" : ""}${selected ? ", selected" : ""}`}
      accessibilityHint="Selects this location for launch-stage discovery preferences."
      hitSlop={{ top: 4, right: 4, bottom: 4, left: 4 }}
    >
      <View
        style={[styles.iconBox, { backgroundColor: ICON_BG }]}
        accessible={false}
        importantForAccessibility="no"
      >
        {isCurrent ? (
          <Navigation
            size={18}
            color={selected ? ACCENT_PINK : ACCENT_PURPLE}
            strokeWidth={2.5}
          />
        ) : (
          <MapPin
            size={18}
            color={selected ? ACCENT_PINK : ACCENT_PURPLE}
            strokeWidth={2.5}
          />
        )}
      </View>

      <Text
        style={[styles.label, selected && styles.labelActive]}
        numberOfLines={2}
        maxFontSizeMultiplier={1.25}
      >
        {label}
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
    color: "#FFFFFF",
    fontSize: 15,
  },
  labelActive: {
    fontWeight: "600",
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.24)",
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
}));
