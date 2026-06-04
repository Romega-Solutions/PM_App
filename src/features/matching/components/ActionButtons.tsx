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

import { theme, useTheme, withAlpha } from "@/src/theme";
import { Heart, Info, Star, X } from "lucide-react-native";
import React from "react";
import {
    Platform,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";

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
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const superLikeColor = colors.warning;

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
        <X
          size={theme.iconSizes.feature}
          color={colors.primary}
          strokeWidth={theme.strokeWidths.emphasis}
        />
      </TouchableOpacity>

      {/* Super Like Button */}
      <TouchableOpacity
        style={[styles.actionBtn, styles.superLikeBtn]}
        onPress={onSuperLike}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Super like this profile"
      >
        <Star
          size={theme.iconSizes.control}
          color={superLikeColor}
          strokeWidth={theme.strokeWidths.emphasis}
        />
      </TouchableOpacity>

      {/* Like Button */}
      <TouchableOpacity
        style={[styles.actionBtn, styles.likeBtn]}
        onPress={onLike}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Like this profile"
      >
        <Heart
          size={theme.iconSizes.feature}
          color={colors.onPrimary}
          strokeWidth={theme.strokeWidths.emphasis}
        />
      </TouchableOpacity>

      {/* Info Button */}
      <TouchableOpacity
        style={[styles.actionBtn, styles.infoBtn]}
        onPress={onInfo}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="View profile details"
      >
        <Info
          size={theme.iconSizes.control}
          color={colors.secondary}
          strokeWidth={theme.strokeWidths.emphasis}
        />
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing.field,
    paddingHorizontal: theme.spacing.screen,
    paddingBottom: theme.spacing.screen,
  },
  actionBtn: {
    width: theme.componentSizes.iconButton + theme.spacing.touchGap,
    height: theme.componentSizes.iconButton + theme.spacing.touchGap,
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: colors.brandScrim,
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
    backgroundColor: withAlpha(colors.primary, 0.12),
    borderColor: colors.primary,
  },
  likeBtn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    width: theme.componentSizes.iconButton + theme.spacing.field,
    height: theme.componentSizes.iconButton + theme.spacing.field,
    borderRadius: theme.borderRadius.full,
  },
  superLikeBtn: {
    backgroundColor: withAlpha(colors.warning, 0.12),
    borderColor: colors.warning,
  },
  infoBtn: {
    backgroundColor: withAlpha(colors.secondary, 0.12),
    borderColor: colors.secondary,
  },
});
