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
import {
  Heart,
  Info,
  MapPin,
  ShieldCheck,
  Star,
  UserRound,
  X,
} from "lucide-react-native";
import React from "react";
import {
  Animated,
  Image,
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ImageSourcePropType,
  StyleProp,
  ViewStyle,
  GestureResponderHandlers,
} from "react-native";

// Brand Colors
const BRAND_BG = "#0F0814";
const ACCENT_PURPLE = "#8D69F6";
const ACCENT_PINK = "#EF3E78";
const VERIFIED_GREEN = "#10B981";
const SUPER_LIKE_GOLD = "#F59E0B";
const WHITE = "#FFFFFF";

function formatProfileDetail(value?: string) {
  if (!value) return null;

  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export interface ProfileCardData {
  id: string;
  name: string;
  age: number;
  location: string;
  distance: string;
  image: ImageSourcePropType | null;
  verified: boolean;
  interests: string[];
  bio: string;
  matchScore?: number;
  heightCm?: number;
  education?: string;
  occupation?: string;
  relationshipGoal?: string;
  languages?: string[];
  bodyType?: string;
  /** True when this is a demo/seed profile, not a real user */
  isSeedProfile?: boolean;
}

export interface ProfileCardProps {
  profile: ProfileCardData;
  pan: Animated.ValueXY;
  rotate: Animated.AnimatedInterpolation<number>;
  panHandlers: GestureResponderHandlers;
  style?: StyleProp<ViewStyle>;
  isPreview?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = React.memo(({
  profile,
  pan,
  rotate,
  panHandlers,
  style,
  isPreview = false,
}) => {
  const { width, height } = useWindowDimensions();
  const cardWidth = Math.min(width - 40, 430);
  const cardHeight = Math.min(Math.max(height * 0.68, 520), height - 210);
  const showCompatibility = Boolean(
    profile.matchScore && profile.matchScore > 70,
  );
  const relationshipGoal = formatProfileDetail(profile.relationshipGoal);
  const occupation = formatProfileDetail(profile.occupation);
  const primaryDetail = relationshipGoal || occupation;
  const secondaryDetail = profile.verified
    ? "Verification reviewed"
    : "Review profile details";

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

  const superLikeOpacity = pan.y.interpolate({
    inputRange: [-height / 5, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <Animated.View
      style={[
        styles.card,
        {
          width: cardWidth,
          height: cardHeight,
          transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }],
          touchAction: "none",
        } as any,
        style,
      ]}
      {...panHandlers}
      accessible={!isPreview}
      importantForAccessibility={isPreview ? "no-hide-descendants" : "auto"}
      accessibilityRole="imagebutton"
      accessibilityLabel={
        isPreview
          ? undefined
          : `${profile.name}, ${profile.age}, ${profile.location}. ${
              profile.verified ? "Verified profile. " : ""
            }${showCompatibility ? "High preference fit. " : ""}${
              primaryDetail ? `${primaryDetail}. ` : ""
            }${
              profile.interests.length
                ? `Interests include ${profile.interests
                    .slice(0, 3)
                    .join(", ")}. `
                : ""
            }Swipe right to like, left to pass, up to super like, or use the action buttons.`
      }
    >
      {/* Profile Image */}
      {profile.image ? (
        <Image
          source={profile.image}
          style={styles.cardImage}
          resizeMode="cover"
          accessible={false}
        />
      ) : (
        <View
          style={[styles.cardImage, styles.cardImagePlaceholder]}
          accessible
          accessibilityLabel={`${profile.name} has not added a profile photo`}
        >
          <View style={styles.cardImagePlaceholderIcon}>
            <UserRound size={44} color="rgba(255, 255, 255, 0.74)" />
          </View>
          <Text style={styles.cardImagePlaceholderText}>No photo yet</Text>
          <Text style={styles.cardImagePlaceholderSubtext}>
            Review details before deciding
          </Text>
        </View>
      )}

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

      {/* Super Like Indicator */}
      <Animated.View
        style={[styles.superLikeIndicator, { opacity: superLikeOpacity }]}
      >
        <View style={styles.superLikeBox}>
          <Star
            size={30}
            color={SUPER_LIKE_GOLD}
            fill={SUPER_LIKE_GOLD}
            strokeWidth={2.4}
          />
          <Text style={styles.superLikeText}>SUPER LIKE</Text>
        </View>
      </Animated.View>

      {!isPreview && (
        <View style={styles.swipeHint}>
          <Text style={styles.swipeHintText}>Left pass</Text>
          <View style={styles.swipeHintDivider} />
          <Text style={styles.swipeHintText}>Up super</Text>
          <View style={styles.swipeHintDivider} />
          <Text style={styles.swipeHintText}>Right like</Text>
        </View>
      )}

      {/* Verified Badge */}
      {profile.verified && (
        <View
          style={styles.verifiedBadge}
          accessible
          accessibilityLabel="Verified profile"
        >
          <ShieldCheck size={14} color={WHITE} strokeWidth={2.5} />
        </View>
      )}

      {/* Demo Badge for seed profiles */}
      {profile.isSeedProfile && (
        <View
          style={styles.demoBadge}
          accessible
          accessibilityLabel="Demo profile — not a real member"
        >
          <Text style={styles.demoBadgeText}>Demo</Text>
        </View>
      )}

      {/* Match Score Badge (if available) */}
      {showCompatibility && (
        <View style={styles.matchScoreBadge}>
          <Star
            size={12}
            color={SUPER_LIKE_GOLD}
            fill={SUPER_LIKE_GOLD}
            strokeWidth={2}
          />
          <Text style={styles.matchScoreText}>Preference fit</Text>
        </View>
      )}

      {/* Gradient Overlay */}
      <LinearGradient
        colors={["transparent", "rgba(0, 0, 0, 0.85)"]}
        style={styles.gradient}
      />

      {/* Profile Info */}
      <View style={styles.cardInfo}>
        <View style={styles.trustRow}>
          {profile.verified ? (
            <View style={styles.trustPill}>
              <ShieldCheck size={13} color={WHITE} strokeWidth={2.4} />
              <Text style={styles.trustPillText}>Verified</Text>
            </View>
          ) : (
            <View style={styles.infoPill}>
              <Info size={13} color={WHITE} strokeWidth={2.4} />
              <Text style={styles.trustPillText}>View details first</Text>
            </View>
          )}
          {showCompatibility ? (
            <View style={styles.scorePill}>
              <Star size={13} color={WHITE} fill={WHITE} strokeWidth={2} />
              <Text style={styles.trustPillText}>Preference fit</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit>
            {profile.name}, {profile.age}
          </Text>
        </View>

        <View style={styles.locationRow}>
          <MapPin size={16} color={ACCENT_PINK} strokeWidth={2.5} />
          <Text style={styles.location} numberOfLines={1}>
            {profile.location}
          </Text>
          <View style={styles.dot} />
          <Text style={styles.distance} numberOfLines={1}>
            {profile.distance}
          </Text>
        </View>

        <View style={styles.metadataRow}>
          <View style={styles.metadataPill}>
            <Text style={styles.metadataLabel} numberOfLines={1}>
              {primaryDetail || "Profile basics"}
            </Text>
          </View>
          <View style={styles.metadataPillSecondary}>
            <Text style={styles.metadataText} numberOfLines={1}>
              {secondaryDetail}
            </Text>
          </View>
        </View>

        {/* Interests */}
        <View
          style={styles.interestsContainer}
          accessibilityLabel={
            profile.interests.length
              ? `Interests: ${profile.interests.slice(0, 3).join(", ")}`
              : "No interests added yet"
          }
        >
          {profile.interests.length ? (
            profile.interests.slice(0, 3).map((interest, idx) => (
              <View key={idx} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))
          ) : (
            <View style={styles.interestTagMuted}>
              <Text style={styles.interestTextMuted}>No interests yet</Text>
            </View>
          )}
        </View>

        {!isPreview ? (
          <Text style={styles.reviewCue}>
            Review details first. Never share codes, ID photos, or payment info
            from a profile card.
          </Text>
        ) : null}
      </View>
    </Animated.View>
  );
});

ProfileCard.displayName = "ProfileCard";

const styles = StyleSheet.create({
  card: {
    position: "absolute",
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
  cardImagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 28,
  },
  cardImagePlaceholderIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15, 8, 20, 0.42)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
  },
  cardImagePlaceholderText: {
    marginTop: 16,
    color: WHITE,
    fontSize: 19,
    fontFamily: "DMSans-Bold",
    textAlign: "center",
  },
  cardImagePlaceholderSubtext: {
    marginTop: 6,
    color: "rgba(255, 255, 255, 0.68)",
    fontSize: 13,
    fontFamily: "DMSans-Medium",
    textAlign: "center",
    lineHeight: 18,
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
  superLikeIndicator: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
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
  superLikeBox: {
    backgroundColor: "rgba(245, 158, 11, 0.16)",
    borderWidth: 3,
    borderColor: SUPER_LIKE_GOLD,
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
  superLikeText: {
    fontSize: 16,
    fontFamily: "DMSans-Bold",
    color: SUPER_LIKE_GOLD,
    letterSpacing: 1.2,
  },
  swipeHint: {
    position: "absolute",
    top: 20,
    alignSelf: "center",
    minHeight: 34,
    borderRadius: 17,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(15, 8, 20, 0.62)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
    zIndex: 8,
  },
  swipeHintText: {
    fontSize: 11,
    fontFamily: "DMSans-Bold",
    color: "rgba(255, 255, 255, 0.86)",
  },
  swipeHintDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
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
    gap: 10,
  },
  trustRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  trustPill: {
    minHeight: 30,
    borderRadius: 15,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(16, 185, 129, 0.88)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.28)",
  },
  infoPill: {
    minHeight: 30,
    borderRadius: 15,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.22)",
  },
  scorePill: {
    minHeight: 30,
    borderRadius: 15,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(245, 158, 11, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.26)",
  },
  trustPillText: {
    fontSize: 12,
    fontFamily: "DMSans-Bold",
    color: WHITE,
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
    flexShrink: 1,
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
    flexShrink: 1,
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
    flexShrink: 0,
  },
  metadataRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metadataPill: {
    maxWidth: "58%",
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 10,
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
  },
  metadataPillSecondary: {
    flexShrink: 1,
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 10,
    justifyContent: "center",
    backgroundColor: "rgba(15, 8, 20, 0.46)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
  },
  metadataLabel: {
    fontSize: 12,
    fontFamily: "DMSans-Bold",
    color: WHITE,
  },
  metadataText: {
    fontSize: 12,
    fontFamily: "DMSans-Medium",
    color: "rgba(255, 255, 255, 0.82)",
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
  interestTagMuted: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.16)",
  },
  interestTextMuted: {
    fontSize: 13,
    fontFamily: "DMSans-Medium",
    color: "rgba(255, 255, 255, 0.74)",
  },
  reviewCue: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: "DMSans-Medium",
    color: "rgba(255, 255, 255, 0.76)",
    lineHeight: 17,
  },
});
