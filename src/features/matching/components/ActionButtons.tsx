/**
 * ActionButtons Component
 *
 * SOLID Principles:
 * - Interface Segregation: Specific interface for action callbacks
 * - Single Responsibility: Only handles action button UI
 *
 * DRY: Reusable action buttons across screens
 * KISS: Simple button rendering with callbacks
 */

import { Heart, Info, Star, X } from "lucide-react-native";
import React from "react";
import {
    Platform,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";

// Brand Colors
const ACCENT_PURPLE = "#8D69F6";
const ACCENT_PINK = "#EF3E78";
const SUPER_LIKE_GOLD = "#F59E0B";
const WHITE = "#FFFFFF";

export interface ActionButtonsProps {
  onPass: () => void;
  onLike: () => void;
  onSuperLike: () => void;
  onInfo: () => void;
  disabled?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onPass,
  onLike,
  onSuperLike,
  onInfo,
  disabled = false,
}) => {
  return (
    <View style={styles.actionsContainer}>
      {/* Pass Button */}
      <TouchableOpacity
        style={[styles.actionBtn, styles.passBtn]}
        onPress={onPass}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Pass on this profile"
      >
        <X size={28} color={ACCENT_PINK} strokeWidth={2.5} />
      </TouchableOpacity>

      {/* Super Like Button */}
      <TouchableOpacity
        style={[styles.actionBtn, styles.superLikeBtn]}
        onPress={onSuperLike}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Super like this profile"
      >
        <Star size={24} color={SUPER_LIKE_GOLD} strokeWidth={2.5} />
      </TouchableOpacity>

      {/* Like Button */}
      <TouchableOpacity
        style={[styles.actionBtn, styles.likeBtn]}
        onPress={onLike}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Like this profile"
      >
        <Heart size={28} color={WHITE} strokeWidth={2.5} />
      </TouchableOpacity>

      {/* Info Button */}
      <TouchableOpacity
        style={[styles.actionBtn, styles.infoBtn]}
        onPress={onInfo}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="View profile details"
      >
        <Info size={24} color={ACCENT_PURPLE} strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  actionBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  passBtn: {
    backgroundColor: "rgba(239, 62, 120, 0.12)",
    borderColor: ACCENT_PINK,
  },
  likeBtn: {
    backgroundColor: ACCENT_PINK,
    borderColor: ACCENT_PINK,
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  superLikeBtn: {
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    borderColor: SUPER_LIKE_GOLD,
  },
  infoBtn: {
    backgroundColor: "rgba(141, 105, 246, 0.12)",
    borderColor: ACCENT_PURPLE,
  },
});
