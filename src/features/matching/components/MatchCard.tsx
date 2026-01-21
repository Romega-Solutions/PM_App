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

// Brand Colors
const BRAND_BG = "#0F0814";
const ACCENT_PURPLE = "#8D69F6";
const ACCENT_PINK = "#EF3E78";
const VERIFIED_GREEN = "#10B981";
const WHITE = "#FFFFFF";
const SURFACE = "rgba(255,255,255,0.06)";
const SURFACE_BORDER = "rgba(141,105,246,0.18)";

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
}) => (
  <View style={styles.card}>
    {/* Image Container */}
    <View style={styles.imageContainer}>
      <Image source={match.image} style={styles.cardImage} resizeMode="cover" />

      {/* Verified Badge */}
      {match.verified && (
        <View style={styles.verifiedBadge}>
          <Sparkles size={10} color={WHITE} strokeWidth={2.5} />
        </View>
      )}

      {/* Mutual Match Badge */}
      {match.mutual && (
        <View style={styles.mutualBadge}>
          <Heart
            size={10}
            color={ACCENT_PINK}
            fill={ACCENT_PINK}
            strokeWidth={2}
          />
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
        <Text style={styles.cardName} numberOfLines={1}>
          {match.name}, {match.age}
        </Text>
      </View>

      <View style={styles.locationRow}>
        <MapPin size={12} color={ACCENT_PURPLE} strokeWidth={2} />
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
          <X size={16} color={ACCENT_PINK} strokeWidth={2.5} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cardActionBtn, styles.messageBtn]}
          onPress={onMessage}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          <MessageCircle size={16} color={WHITE} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  // Card
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: SURFACE,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: SURFACE_BORDER,
    marginBottom: 0,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
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
    backgroundColor: "#1A1A1A",
  },
  verifiedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: VERIFIED_GREEN,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: WHITE,
    ...Platform.select({
      ios: {
        shadowColor: VERIFIED_GREEN,
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
    backgroundColor: "rgba(239, 62, 120, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: ACCENT_PINK,
    ...Platform.select({
      ios: {
        shadowColor: ACCENT_PINK,
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
    color: WHITE,
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
    color: ACCENT_PURPLE,
    letterSpacing: 0.2,
    flex: 1,
  },

  // Card Actions
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  cardActionBtn: {
    flex: 1,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  unmatchBtn: {
    backgroundColor: "rgba(239, 62, 120, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(239, 62, 120, 0.3)",
  },
  messageBtn: {
    backgroundColor: ACCENT_PINK,
    ...Platform.select({
      ios: {
        shadowColor: ACCENT_PINK,
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
