import { ChevronDown } from "lucide-react-native";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity } from "react-native";

const ACCENT_PURPLE = "#8D69F6";
const WHITE = "#FFFFFF";

interface ScrollToBottomFabProps {
  onPress: () => void;
  visible: boolean;
}

export const ScrollToBottomFab: React.FC<ScrollToBottomFabProps> = ({
  onPress,
  visible,
}) => {
  if (!visible) return null;

  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityLabel="Scroll to bottom"
      accessibilityRole="button"
    >
      <ChevronDown size={20} color={WHITE} strokeWidth={2.5} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 16,
    bottom: 90,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ACCENT_PURPLE,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(141, 105, 246, 0.4)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
});
