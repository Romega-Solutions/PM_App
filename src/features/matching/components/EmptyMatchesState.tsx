/**
 * EmptyMatchesState Component
 *
 * Displays an empty state when user has no matches.
 * Shows encouraging message to keep swiping.
 */

import { LaunchStateNotice } from "@/src/components/ui/LaunchStateNotice";
import {
  Heart,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ACCENT_PURPLE = "#8D69F6";
const ACCENT_PINK = "#EF3E78";
const WHITE = "#FFFFFF";

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
    body: "Like profiles that feel aligned. Mutual matches appear here only after both people choose each other and launch-stage chat access allows it.",
  },
  filtered: {
    title: "No mutual matches in this filter",
    body: "You may still have matches outside this view. Switch back to All Matches or adjust discovery boundaries when you are ready.",
  },
  error: {
    title: "Matches did not refresh",
    body: "Check your connection and try again. We will keep your existing matches safe.",
    action: "Try again",
  },
};

export const EmptyMatchesState: React.FC<EmptyMatchesStateProps> = ({
  variant = "empty",
  message,
  onAction,
}) => {
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
          color={variant === "error" ? ACCENT_PINK : ACCENT_PURPLE}
          strokeWidth={1.8}
        />
      </View>
      <Text style={styles.emptyTitle}>{copy.title}</Text>
      <Text style={styles.emptyText}>{message ?? copy.body}</Text>
      <LaunchStateNotice
        testID="empty-matches-launch-state-notice"
style={styles.launchNotice}
        title="Mutual matches only"
        message="Matches appear after both people choose each other and launch-stage chat access allows it. You control the pace, keep private details private, and report anything that feels off."
        accessibilityLabel="Mutual matches launch note. Matches appear after both people choose each other and launch-stage availability allows chat. Keep private details private and report anything that feels off."
      />
      <View style={styles.guidanceRow}>
        <View style={styles.guidancePill}>
          <ShieldCheck size={13} color={WHITE} strokeWidth={2.2} />
          <Text style={styles.guidancePillText}>Mutual first</Text>
        </View>
        <View style={styles.guidancePillQuiet}>
          <Text style={styles.guidancePillQuietText}>No pressure to rush</Text>
        </View>
      </View>
      {onAction && copy.action ? (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onAction}
          activeOpacity={0.84}
          accessibilityRole="button"
          accessibilityLabel={copy.action}
          accessibilityHint="Attempts to refresh your matches"
        >
          <RefreshCw size={16} color={WHITE} strokeWidth={2.4} />
          <Text style={styles.actionButtonText}>{copy.action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
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
    color: WHITE,
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
    marginTop: 16,
    marginBottom: 0,
    maxWidth: 320,
  },
  guidanceRow: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  guidancePill: {
    minHeight: 30,
    borderRadius: 15,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(239, 62, 120, 0.78)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  guidancePillQuiet: {
    minHeight: 30,
    borderRadius: 15,
    paddingHorizontal: 11,
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
  },
  guidancePillText: {
    fontSize: 12,
    fontFamily: "DMSans-Bold",
    color: WHITE,
  },
  guidancePillQuietText: {
    fontSize: 12,
    fontFamily: "DMSans-Bold",
    color: "rgba(255, 255, 255, 0.74)",
  },
  actionButton: {
    minHeight: 48,
    marginTop: 22,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: ACCENT_PINK,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionButtonText: {
    fontSize: 15,
    fontFamily: "DMSans-Bold",
    color: WHITE,
  },
});
