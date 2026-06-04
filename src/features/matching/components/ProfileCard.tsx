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

import { useTheme, withAlpha } from "@/src/theme";
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
  const { colors } = useTheme();
  const styles = createStyles(colors);

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
            color={colors.primary}
            fill={colors.primary}
            strokeWidth={3}
          />
          <Text style={styles.likeText}>LIKE</Text>
        </View>
      </Animated.View>

      {/* Pass Indicator */}
      <Animated.View style={[styles.passIndicator, { opacity: passOpacity }]}>
        <View style={styles.passBox}>
          <X size={32} color={colors.primary} strokeWidth={3} />
          <Text style={styles.passText}>PASS</Text>
        </View>
      </Animated.View>

      {/* Verified Badge */}
      {profile.verified && (
        <View style={styles.verifiedBadge}>
          <Sparkles size={14} color={colors.onStatus} strokeWidth={2.5} />
        </View>
      )}

      {/* Match Score Badge (if available) */}
      {profile.matchScore && profile.matchScore > 70 && (
        <View style={styles.matchScoreBadge}>
          <Star
            size={12}
            color={colors.warning}
            fill={colors.warning}
            strokeWidth={2}
          />
          <Text style={styles.matchScoreText}>{profile.matchScore}%</Text>
        </View>
      )}

      {/* Gradient Overlay */}
      <LinearGradient
        colors={["transparent", colors.brandScrim]}
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
          <MapPin size={16} color={colors.primary} strokeWidth={2.5} />
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

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
  card: {
    position: "absolute",
    width: width - 40,
    height: height * 0.72,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: colors.brandBackground,
    ...Platform.select({
      ios: {
        shadowColor: colors.brandScrim,
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
    backgroundColor: withAlpha(colors.primary, 0.15),
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  passBox: {
    backgroundColor: withAlpha(colors.primary, 0.15),
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  likeText: {
    fontSize: 18,
    fontFamily: "DMSans-Bold",
    color: colors.primary,
    letterSpacing: 0,
  },
  passText: {
    fontSize: 18,
    fontFamily: "DMSans-Bold",
    color: colors.primary,
    letterSpacing: 0,
  },

  // Badges
  verifiedBadge: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: colors.success,
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
    backgroundColor: withAlpha(colors.warning, 0.95),
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
    color: colors.onStatus,
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
    color: colors.onPrimary,
    letterSpacing: 0,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  location: {
    fontSize: 16,
    fontFamily: "DMSans-Medium",
    color: withAlpha(colors.onPrimary, 0.9),
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: withAlpha(colors.onPrimary, 0.5),
  },
  distance: {
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    color: withAlpha(colors.onPrimary, 0.7),
  },

  // Interests
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  interestTag: {
    backgroundColor: withAlpha(colors.secondary, 0.25),
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: withAlpha(colors.secondary, 0.4),
  },
  interestText: {
    fontSize: 13,
    fontFamily: "DMSans-Medium",
    color: colors.secondary,
  },
});
