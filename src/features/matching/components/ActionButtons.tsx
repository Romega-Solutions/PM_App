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
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Brand Colors
const ACCENT_PURPLE = "#8D69F6";
const ACCENT_PINK = "#EF3E78";
const SUPER_LIKE_GOLD = "#F59E0B";
const WHITE = "#FFFFFF";
const ACTION_HIT_SLOP = { top: 8, right: 8, bottom: 8, left: 8 };
const DISABLED_ACTION_HINT = "Please wait until the current action finishes.";

export interface ActionButtonsProps {
  onPass: () => void;
  onLike: () => void;
  onSuperLike: () => void;
  onInfo: () => void;
  disabled?: boolean;
  bottomInset?: number;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onPass,
  onLike,
  onSuperLike,
  onInfo,
  disabled = false,
  bottomInset = 0,
}) => {
  return (
    <View
      style={[
        styles.actionsContainer,
        { paddingBottom: Math.max(bottomInset + 16, 24) },
      ]}
    >
      {/* Pass Button */}
      <TouchableOpacity
        style={[styles.actionControl, disabled && styles.disabledBtn]}
        onPress={onPass}
        disabled={disabled}
        activeOpacity={0.82}
        hitSlop={ACTION_HIT_SLOP}
        accessibilityRole="button"
        accessibilityLabel="Pass on this profile"
        accessibilityHint={
          disabled
            ? DISABLED_ACTION_HINT
            : "Skips this profile and shows the next person"
        }
        accessibilityState={{ disabled }}
      >
        <View style={[styles.actionBtn, styles.passBtn]}>
          <X size={28} color={ACCENT_PINK} strokeWidth={2.5} />
        </View>
        <Text style={styles.actionLabel}>Pass</Text>
      </TouchableOpacity>

      {/* Super Like Button */}
      <TouchableOpacity
        style={[styles.actionControl, disabled && styles.disabledBtn]}
        onPress={onSuperLike}
        disabled={disabled}
        activeOpacity={0.82}
        hitSlop={ACTION_HIT_SLOP}
        accessibilityRole="button"
        accessibilityLabel="Super like this profile"
        accessibilityHint={
          disabled
            ? DISABLED_ACTION_HINT
            : "Sends a stronger like and then shows the next person"
        }
        accessibilityState={{ disabled }}
      >
        <View style={[styles.actionBtn, styles.superLikeBtn]}>
          <Star size={24} color={SUPER_LIKE_GOLD} strokeWidth={2.5} />
        </View>
        <Text style={styles.actionLabel}>Super</Text>
      </TouchableOpacity>

      {/* Like Button */}
      <TouchableOpacity
        style={[
          styles.actionControl,
          styles.primaryControl,
          disabled && styles.disabledBtn,
        ]}
        onPress={onLike}
        disabled={disabled}
        activeOpacity={0.82}
        hitSlop={ACTION_HIT_SLOP}
        accessibilityRole="button"
        accessibilityLabel="Like this profile"
        accessibilityHint={
          disabled
            ? DISABLED_ACTION_HINT
            : "Likes this profile and checks for a mutual match"
        }
        accessibilityState={{ disabled }}
      >
        <View style={[styles.actionBtn, styles.likeBtn]}>
          <Heart size={28} color={WHITE} strokeWidth={2.5} />
        </View>
        <Text style={[styles.actionLabel, styles.primaryLabel]}>Like</Text>
      </TouchableOpacity>

      {/* Info Button */}
      <TouchableOpacity
        style={[styles.actionControl, disabled && styles.disabledBtn]}
        onPress={onInfo}
        disabled={disabled}
        activeOpacity={0.82}
        hitSlop={ACTION_HIT_SLOP}
        accessibilityRole="button"
        accessibilityLabel="View profile details"
        accessibilityHint={
          disabled
            ? DISABLED_ACTION_HINT
            : "Opens more profile details before you decide"
        }
        accessibilityState={{ disabled }}
      >
        <View style={[styles.actionBtn, styles.infoBtn]}>
          <Info size={24} color={ACCENT_PURPLE} strokeWidth={2.5} />
        </View>
        <Text style={styles.actionLabel}>Details</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    gap: 6,
    paddingHorizontal: 12,
  },
  actionControl: {
    minWidth: 54,
    minHeight: 76,
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 5,
  },
  actionBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  actionLabel: {
    fontSize: 11,
    fontFamily: "DMSans-Bold",
    color: "rgba(255, 255, 255, 0.72)",
    textAlign: "center",
  },
  primaryControl: {
    minWidth: 60,
  },
  primaryLabel: {
    color: WHITE,
  },
  passBtn: {
    backgroundColor: "rgba(239, 62, 120, 0.12)",
    borderColor: ACCENT_PINK,
  },
  likeBtn: {
    backgroundColor: ACCENT_PINK,
    borderColor: ACCENT_PINK,
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  superLikeBtn: {
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    borderColor: SUPER_LIKE_GOLD,
  },
  infoBtn: {
    backgroundColor: "rgba(141, 105, 246, 0.12)",
    borderColor: ACCENT_PURPLE,
  },
  disabledBtn: {
    opacity: 0.45,
  },
});
