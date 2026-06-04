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

import { useTheme, withAlpha } from "@/src/theme";
import { LinearGradient } from "expo-linear-gradient";
import { Heart, MapPin, MessageCircle, Sparkles, X } from "lucide-react-native";
import React from "react";
import {
    Dimensions,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

// Card dimensions
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding
const CARD_HEIGHT = CARD_WIDTH * 1.4;
const IMAGE_HEIGHT = CARD_WIDTH * 0.85;

// Match type
export type Match = {
  id: string | number;
  name: string;
  age: number;
  image: any;
  location: string;
  verified: boolean;
  mutual: boolean;
  gender: "female" | "male";
  matchedAt?: string;
};

interface MatchCardProps {
  match: Match;
  onMessage: () => void;
  onUnmatch: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  onMessage,
  onUnmatch,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
  <View style={styles.card}>
    {/* Image Container */}
    <View style={styles.imageContainer}>
      <Image source={match.image} style={styles.cardImage} resizeMode="cover" />

      {/* Verified Badge */}
      {match.verified && (
        <View style={styles.verifiedBadge}>
          <Sparkles size={10} color={colors.onStatus} strokeWidth={2.5} />
        </View>
      )}

      {/* Mutual Match Badge */}
      {match.mutual && (
        <View style={styles.mutualBadge}>
          <Heart
            size={10}
            color={colors.primary}
            fill={colors.primary}
            strokeWidth={2}
          />
        </View>
      )}

      {/* Gradient Overlay */}
      <LinearGradient
        colors={["transparent", colors.brandScrim]}
        style={styles.imageGradient}
      />
    </View>

    {/* Card Info */}
    <View style={styles.cardInfo}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardName} numberOfLines={1}>
          {match.name}, {match.age}
        </Text>
      </View>

      <View style={styles.locationRow}>
        <MapPin size={12} color={colors.secondary} strokeWidth={2} />
        <Text style={styles.locationText} numberOfLines={1}>
          {match.location}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.cardActionBtn, styles.unmatchBtn]}
          onPress={onUnmatch}
          accessibilityRole="button"
          accessibilityLabel="Unmatch"
        >
          <X size={18} color={colors.primary} strokeWidth={2.5} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cardActionBtn, styles.messageBtn]}
          onPress={onMessage}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          <MessageCircle size={18} color={colors.onPrimary} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </View>
  </View>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
  // Card
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: colors.brandSurface,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.brandBorder,
    marginBottom: 0,
    ...Platform.select({
      ios: {
        shadowColor: colors.brandScrim,
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
    height: IMAGE_HEIGHT,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.raised,
  },
  verifiedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.success,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.onStatus,
    ...Platform.select({
      ios: {
        shadowColor: colors.success,
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
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: withAlpha(colors.primary, 0.2),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
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
    color: colors.onPrimary,
    letterSpacing: 0,
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
    color: colors.secondary,
    letterSpacing: 0,
    flex: 1,
  },

  // Card Actions
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  cardActionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  unmatchBtn: {
    backgroundColor: withAlpha(colors.primary, 0.15),
    borderWidth: 1,
    borderColor: withAlpha(colors.primary, 0.3),
  },
  messageBtn: {
    backgroundColor: colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});
