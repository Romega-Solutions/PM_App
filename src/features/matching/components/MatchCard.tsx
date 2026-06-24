/**
 * MatchCard Component
 *
 * Displays a single match card with user info, image, badges, and action buttons.
 * Used in the Likes screen to show matched users in a grid layout.
 *
 * Features:
 * - Profile image with gradient overlay
 * - Verification badge (green checkmark)
 * - Mutual match badge (heart icon)
 * - User info (name, age, location)
 * - Action buttons (message, unmatch)
 */

import { LinearGradient } from "expo-linear-gradient";
import {
  Flag,
  Heart,
  MapPin,
  MessageCircle,
  Sparkles,
  UserRound,
  X,
} from "lucide-react-native";
import React from "react";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { makeStyles } from "@/src/theme/makeStyles";
import {
  Image,
  ImageSourcePropType,
  Platform,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

// Brand Colors
const SURFACE = "rgba(255,255,255,0.06)";
const SURFACE_BORDER = "rgba(141,105,246,0.18)";
const ACTION_HIT_SLOP = { top: 6, right: 6, bottom: 6, left: 6 };

function formatMatchedAt(value?: string) {
  if (!value) return "Recently matched";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently matched";

  return `Matched ${date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })}`;
}

// Match type
export type Match = {
  id: string | number;
  name: string;
  age: number;
  image?: ImageSourcePropType;
  location: string;
  verified: boolean;
  mutual: boolean;
  gender: "female" | "male";
  matchedAt?: string;
  demo?: boolean;
};

interface MatchCardProps {
  match: Match;
  onMessage: () => void;
  onUnmatch: () => void;
  onReport: () => void;
  onPress?: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = React.memo(({
  match,
  onMessage,
  onUnmatch,
  onReport,
  onPress,
}) => {
  const theme = useAppTheme();
  const styles = useStyles();
  const { width } = useWindowDimensions();
  const cardWidth = Math.min((width - 48) / 2, 196);
  const cardHeight = Math.max(cardWidth * 1.9, 306);
  const imageHeight = Math.max(cardWidth * 0.86, 134);
  const matchedAtLabel = formatMatchedAt(match.matchedAt);

  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth, minHeight: cardHeight }]}
      activeOpacity={0.86}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open chat with ${match.name}`}
      accessibilityHint="Opens the matched conversation for this member"
    >
      {/* Image Container */}
      <View style={[styles.imageContainer, { height: imageHeight }]}>
        {match.image ? (
          <Image
            source={match.image}
            style={styles.cardImage}
            resizeMode="cover"
            accessible
            accessibilityLabel={`${match.name}'s profile photo`}
          />
        ) : (
          <View
            style={styles.cardImageFallback}
            accessible
            accessibilityLabel={`${match.name} has no profile photo`}
          >
            <UserRound size={38} color="rgba(255,255,255,0.72)" />
            <Text style={styles.cardImageFallbackText}>No photo</Text>
          </View>
        )}

        {/* Verified Badge */}
        {match.verified && (
          <View
            style={styles.verifiedBadge}
            accessible
            accessibilityLabel="Verification reviewed"
          >
            <Sparkles size={10} color={theme.colors.neutral.white} strokeWidth={2.5} />
          </View>
        )}

        {/* Mutual Match Badge */}
        {match.mutual && (
          <View
            style={styles.mutualBadge}
            accessible
            accessibilityLabel="Mutual match"
          >
            <Heart
              size={10}
              color={theme.semanticColors.primary}
              fill={theme.semanticColors.primary}
              strokeWidth={2}
            />
          </View>
        )}

        {match.demo && (
          <View
            style={styles.demoBadge}
            accessible
            accessibilityLabel="Demo match"
          >
            <Text style={styles.demoBadgeText}>Demo</Text>
          </View>
        )}

        {/* Gradient Overlay */}
        <LinearGradient
          colors={["transparent", "rgba(0, 0, 0, 0.7)"]}
          style={styles.imageGradient}
        />
      </View>

      {/* Card Info */}
      <View style={styles.cardInfo}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardName} numberOfLines={1} adjustsFontSizeToFit>
            {match.name}, {match.age}
          </Text>
        </View>

        <View style={styles.locationRow}>
          <MapPin size={12} color={theme.semanticColors.secondary} strokeWidth={2} />
          <Text style={styles.locationText} numberOfLines={1}>
            {match.location}
          </Text>
        </View>
        <Text style={styles.trustText} numberOfLines={1}>
          {match.verified ? "Verification reviewed" : "Report concerns anytime"}
        </Text>
        <View style={styles.matchMetaRow}>
          <Heart
            size={11}
            color={match.mutual ? theme.semanticColors.primary : "rgba(255,255,255,0.58)"}
            fill={match.mutual ? theme.semanticColors.primary : "transparent"}
            strokeWidth={2}
          />
          <Text
            style={[
              styles.matchStateText,
              match.mutual && styles.matchStateTextActive,
            ]}
            numberOfLines={1}
          >
            {match.mutual ? "Mutual" : "Matched"}
          </Text>
            <Text style={styles.matchSeparator} accessible={false}>
              /
            </Text>
          <Text style={styles.matchedAtText} numberOfLines={1}>
            {matchedAtLabel}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.cardActions}>
          <View style={styles.secondaryActions}>
            <TouchableOpacity
              style={styles.inlineActionBtn}
              onPress={onUnmatch}
              activeOpacity={0.82}
              hitSlop={ACTION_HIT_SLOP}
              accessibilityRole="button"
              accessibilityLabel={`Unmatch with ${match.name}`}
              accessibilityHint="Opens the unmatch action for this match"
            >
              <X size={16} color={theme.semanticColors.primary} strokeWidth={2.5} />
              <Text style={[styles.actionLabel, styles.unmatchActionLabel]}>
                Unmatch
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.inlineActionBtn}
              onPress={onReport}
              activeOpacity={0.82}
              hitSlop={ACTION_HIT_SLOP}
              accessibilityRole="button"
              accessibilityLabel={`Report or block ${match.name}`}
              accessibilityHint="Opens a private report form for this match"
            >
              <Flag size={16} color={theme.semanticColors.error} strokeWidth={2.5} />
              <Text style={[styles.actionLabel, styles.reportActionLabel]}>
                Report
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.cardActionBtn, styles.messageBtn]}
            onPress={onMessage}
            activeOpacity={0.86}
            hitSlop={ACTION_HIT_SLOP}
            accessibilityRole="button"
            accessibilityLabel={`Message ${match.name}`}
            accessibilityHint="Opens a conversation with this match"
          >
            <MessageCircle size={16} color={theme.colors.neutral.white} strokeWidth={2} />
            <Text style={[styles.actionLabel, styles.messageActionLabel]}>
              Message
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
});

MatchCard.displayName = "MatchCard";

const useStyles = makeStyles((theme) => ({
  // Card
  card: {
    backgroundColor: SURFACE,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: SURFACE_BORDER,
    marginBottom: 0,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.neutral.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  imageContainer: {
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.semanticColors.surface,
  },
  cardImageFallback: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  cardImageFallbackText: {
    marginTop: 8,
    color: "rgba(255,255,255,0.68)",
    fontSize: 12,
    fontFamily: "DMSans-Bold",
  },
  verifiedBadge: {
    position: "absolute",
    zIndex: 2,
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.semanticColors.success,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: theme.colors.neutral.white,
    ...Platform.select({
      ios: {
        shadowColor: theme.semanticColors.success,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  mutualBadge: {
    position: "absolute",
    zIndex: 2,
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(239, 62, 120, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: theme.semanticColors.primary,
    ...Platform.select({
      ios: {
        shadowColor: theme.semanticColors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  demoBadge: {
    position: "absolute",
    zIndex: 2,
    bottom: 8,
    left: 8,
    minHeight: 24,
    borderRadius: 12,
    paddingHorizontal: 9,
    backgroundColor: "rgba(15, 8, 20, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.24)",
    justifyContent: "center",
    alignItems: "center",
  },
  demoBadgeText: {
    fontSize: 10,
    fontFamily: "DMSans-Bold",
    color: theme.colors.neutral.white,
    letterSpacing: 0.2,
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "35%",
  },

  // Card Info
  cardInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  cardName: {
    fontSize: 16,
    fontFamily: "Lora-Bold",
    color: theme.colors.neutral.white,
    letterSpacing: 0.3,
    flex: 1,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    fontFamily: "DMSans-Medium",
    color: theme.semanticColors.secondary,
    letterSpacing: 0.2,
    flex: 1,
  },
  trustText: {
    minHeight: 18,
    fontSize: 11,
    fontFamily: "DMSans-Bold",
    color: "rgba(255, 255, 255, 0.68)",
  },
  matchMetaRow: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  matchStateText: {
    fontSize: 10,
    fontFamily: "DMSans-Bold",
    color: "rgba(255, 255, 255, 0.62)",
  },
  matchStateTextActive: {
    color: theme.semanticColors.primary,
  },
  matchSeparator: {
    fontSize: 10,
    fontFamily: "DMSans-Bold",
    color: "rgba(255, 255, 255, 0.32)",
  },
  matchedAtText: {
    flex: 1,
    fontSize: 10,
    fontFamily: "DMSans-Medium",
    color: "rgba(255, 255, 255, 0.58)",
  },

  // Card Actions
  cardActions: {
    gap: 8,
  },
  secondaryActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
    paddingTop: 8,
  },
  cardActionBtn: {
    minHeight: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 3,
  },
  inlineActionBtn: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  actionLabel: {
    fontSize: 10,
    fontFamily: "DMSans-Bold",
    textAlign: "center",
  },
  unmatchActionLabel: {
    color: theme.semanticColors.primary,
  },
  reportActionLabel: {
    color: theme.semanticColors.error,
  },
  messageActionLabel: {
    color: theme.colors.neutral.white,
  },
  messageBtn: {
    width: "100%",
    backgroundColor: theme.semanticColors.primary,
    ...Platform.select({
      ios: {
        shadowColor: theme.semanticColors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
}));
