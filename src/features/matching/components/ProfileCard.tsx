/**
 * ProfileCard Component
 *
 * SOLID Principles:
 * - Single Responsibility: Only renders profile card UI
 * - Open/Closed: Extensible through props, closed for modification
 * - Dependency Inversion: Depends on Profile interface abstraction
 *
 * DRY: Reusable card component
 * KISS: Simple display logic, no business logic
 */

import { LinearGradient } from "expo-linear-gradient";
import { Heart, MapPin, Sparkles, Star, X } from "lucide-react-native";
import React from "react";
import {
    Animated,
    Dimensions,
    Image,
    Platform,
    StyleSheet,
    Text,
    View,
} from "react-native";

const { width, height } = Dimensions.get("window");

// Brand Colors
const BRAND_BG = "#0F0814";
const ACCENT_PURPLE = "#8D69F6";
const ACCENT_PINK = "#EF3E78";
const VERIFIED_GREEN = "#10B981";
const SUPER_LIKE_GOLD = "#F59E0B";
const WHITE = "#FFFFFF";

export interface ProfileCardData {
  id: string;
  name: string;
  age: number;
  location: string;
  distance: string;
  image: any;
  verified: boolean;
  interests: string[];
  bio: string;
  matchScore?: number;
}

export interface ProfileCardProps {
  profile: ProfileCardData;
  pan: Animated.ValueXY;
  rotate: Animated.AnimatedInterpolation<number>;
  panHandlers: any;
  style?: any;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  pan,
  rotate,
  panHandlers,
  style,
}) => {
  // Opacity for swipe indicators
  const likeOpacity = pan.x.interpolate({
    inputRange: [0, width / 4],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const passOpacity = pan.x.interpolate({
    inputRange: [-width / 4, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }],
        },
        style,
      ]}
      {...panHandlers}
    >
      {/* Profile Image */}
      <Image
        source={profile.image}
        style={styles.cardImage}
        resizeMode="cover"
      />

      {/* Like Indicator */}
      <Animated.View style={[styles.likeIndicator, { opacity: likeOpacity }]}>
        <View style={styles.likeBox}>
          <Heart
            size={32}
            color={ACCENT_PINK}
            fill={ACCENT_PINK}
            strokeWidth={3}
          />
          <Text style={styles.likeText}>LIKE</Text>
        </View>
      </Animated.View>

      {/* Pass Indicator */}
      <Animated.View style={[styles.passIndicator, { opacity: passOpacity }]}>
        <View style={styles.passBox}>
          <X size={32} color={ACCENT_PINK} strokeWidth={3} />
          <Text style={styles.passText}>PASS</Text>
        </View>
      </Animated.View>

      {/* Verified Badge */}
      {profile.verified && (
        <View style={styles.verifiedBadge}>
          <Sparkles size={14} color={WHITE} strokeWidth={2.5} />
        </View>
      )}

      {/* Match Score Badge (if available) */}
      {profile.matchScore && profile.matchScore > 70 && (
        <View style={styles.matchScoreBadge}>
          <Star
            size={12}
            color={SUPER_LIKE_GOLD}
            fill={SUPER_LIKE_GOLD}
            strokeWidth={2}
          />
          <Text style={styles.matchScoreText}>{profile.matchScore}%</Text>
        </View>
      )}

      {/* Gradient Overlay */}
      <LinearGradient
        colors={["transparent", "rgba(0, 0, 0, 0.85)"]}
        style={styles.gradient}
      />

      {/* Profile Info */}
      <View style={styles.cardInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>
            {profile.name}, {profile.age}
          </Text>
        </View>

        <View style={styles.locationRow}>
          <MapPin size={16} color={ACCENT_PINK} strokeWidth={2.5} />
          <Text style={styles.location}>{profile.location}</Text>
          <View style={styles.dot} />
          <Text style={styles.distance}>{profile.distance}</Text>
        </View>

        {/* Interests */}
        <View style={styles.interestsContainer}>
          {profile.interests.slice(0, 3).map((interest, idx) => (
            <View key={idx} style={styles.interestTag}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    width: width - 40,
    height: height * 0.72,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: BRAND_BG,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "45%",
  },

  // Swipe Indicators
  likeIndicator: {
    position: "absolute",
    top: 60,
    left: 30,
    zIndex: 10,
  },
  passIndicator: {
    position: "absolute",
    top: 60,
    right: 30,
    zIndex: 10,
  },
  likeBox: {
    backgroundColor: "rgba(239, 62, 120, 0.15)",
    borderWidth: 3,
    borderColor: ACCENT_PINK,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  passBox: {
    backgroundColor: "rgba(239, 62, 120, 0.15)",
    borderWidth: 3,
    borderColor: ACCENT_PINK,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  likeText: {
    fontSize: 18,
    fontFamily: "DMSans-Bold",
    color: ACCENT_PINK,
    letterSpacing: 1.5,
  },
  passText: {
    fontSize: 18,
    fontFamily: "DMSans-Bold",
    color: ACCENT_PINK,
    letterSpacing: 1.5,
  },

  // Badges
  verifiedBadge: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: VERIFIED_GREEN,
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  matchScoreBadge: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "rgba(245, 158, 11, 0.95)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    zIndex: 10,
  },
  matchScoreText: {
    fontSize: 13,
    fontFamily: "DMSans-Bold",
    color: WHITE,
  },

  // Profile Info
  cardInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    gap: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontSize: Platform.OS === "ios" ? 30 : 28,
    fontFamily: "Lora-Bold",
    color: WHITE,
    letterSpacing: 0.5,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  location: {
    fontSize: 16,
    fontFamily: "DMSans-Medium",
    color: "rgba(255, 255, 255, 0.9)",
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  distance: {
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    color: "rgba(255, 255, 255, 0.7)",
  },

  // Interests
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  interestTag: {
    backgroundColor: "rgba(141, 105, 246, 0.25)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(141, 105, 246, 0.4)",
  },
  interestText: {
    fontSize: 13,
    fontFamily: "DMSans-Medium",
    color: ACCENT_PURPLE,
  },
});
