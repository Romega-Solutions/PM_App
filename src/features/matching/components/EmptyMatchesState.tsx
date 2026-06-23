/**
 * EmptyMatchesState Component
 *
 * Displays an empty state when user has no matches.
 * Shows encouraging message to keep swiping.
 */

import {
  Heart,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { LaunchStateNotice } from "@/src/components/ui/LaunchStateNotice";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { makeStyles } from "@/src/theme/makeStyles";

type EmptyMatchesStateVariant = "empty" | "filtered" | "error";

interface EmptyMatchesStateProps {
  variant?: EmptyMatchesStateVariant;
  message?: string;
  onAction?: () => void;
}

const copyByVariant: Record<
  EmptyMatchesStateVariant,
  { title: string; body: string; action?: string }
> = {
  empty: {
    title: "Your match list is just getting started",
    body: "Like profiles that feel aligned. Mutual matches appear here after both people choose each other.",
  },
  filtered: {
    title: "No mutual matches in this filter",
    body: "You may still have matches outside this view. Switch back to All Matches or adjust discovery boundaries when you are ready.",
  },
  error: {
    title: "Matches did not refresh",
    body: "Check your connection and try again. Your match list stays unchanged while you retry.",
    action: "Try again",
  },
};

export const EmptyMatchesState: React.FC<EmptyMatchesStateProps> = ({
  variant = "empty",
  message,
  onAction,
}) => {
  const theme = useAppTheme();
  const styles = useStyles();
  const copy = copyByVariant[variant];
  const Icon =
    variant === "error"
      ? RefreshCw
      : variant === "filtered"
        ? SlidersHorizontal
        : Heart;

  return (
    <View style={styles.emptyState}>
      <View style={styles.iconWrap}>
        <Icon
          size={38}
          color={variant === "error" ? theme.semanticColors.primary : theme.semanticColors.secondary}
          strokeWidth={1.8}
        />
      </View>
      <Text style={styles.emptyTitle}>{copy.title}</Text>
      <Text style={styles.emptyText}>{message ?? copy.body}</Text>
      <LaunchStateNotice
        testID="empty-matches-launch-state-notice"
        title="Mutual matches only"
        message="Chats open after both people choose each other. You control the pace, keep private details private, and report anything that feels off."
        style={styles.launchNotice}
      />
      {onAction && copy.action ? (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onAction}
          activeOpacity={0.84}
          accessibilityRole="button"
          accessibilityLabel={copy.action}
          accessibilityHint="Attempts to refresh your matches"
        >
          <RefreshCw size={16} color={theme.colors.neutral.white} strokeWidth={2.4} />
          <Text style={styles.actionButtonText}>{copy.action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const useStyles = makeStyles((theme) => ({
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  iconWrap: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "rgba(141, 105, 246, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(141, 105, 246, 0.24)",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 21,
    fontFamily: "Lora-Bold",
    color: theme.colors.neutral.white,
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "DMSans-Regular",
    color: "rgba(255, 255, 255, 0.72)",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 292,
  },
  launchNotice: {
    marginTop: 18,
    maxWidth: 310,
  },
  actionButton: {
    minHeight: 48,
    marginTop: 22,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: theme.semanticColors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionButtonText: {
    fontSize: 15,
    fontFamily: "DMSans-Bold",
    color: theme.colors.neutral.white,
  },
}));
