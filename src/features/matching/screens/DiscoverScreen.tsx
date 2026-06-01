/**
 * DiscoverScreen Component
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Orchestrates profile discovery flow
 * - Open/Closed: Uses composition of smaller components
 * - Liskov Substitution: Components are interchangeable
 * - Interface Segregation: Clean props interfaces
 * - Dependency Inversion: Depends on hooks abstraction, not implementation
 *
 * DRY: Reuses ProfileCard, ActionButtons, modals
 * KISS: Clear flow - load profiles, display, handle actions
 *
 * @filesize ~420 lines (under 500 limit)
 */

import { accountApi } from "@/src/features/account/api/accountApi";
import { UserType } from "@/src/features/auth/api/authApi";
import { Profile as DBProfile } from "@/src/features/matching/types";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActionButtons } from "../components/ActionButtons";
import { MatchModal, MatchedProfile } from "../components/MatchModal";
import { ProfileCard, ProfileCardData } from "../components/ProfileCard";
import { ProfileDetailsModal } from "../components/ProfileDetailsModal";
import {
    useCurrentUser,
    useDiscoverProfiles,
    useLikeProfile,
    usePassProfile,
    useSuperLikeProfile,
} from "../hooks/useMatchingQueries";
import { useSwipeGesture } from "../hooks/useSwipeGesture";

// Brand Colors
const BRAND_BG = "#0F0814";
const ACCENT_PINK = "#EF3E78";
const WHITE = "#FFFFFF";

/**
 * Convert database profile to display format
 */
function convertDBProfileToDisplay(dbProfile: DBProfile): ProfileCardData {
  return {
    id: dbProfile.id,
    name: dbProfile.first_name,
    age: dbProfile.age,
    location: dbProfile.city || "Philippines",
    distance: "5 km away", // TODO: Calculate real distance
    image: dbProfile.photos?.[0]
      ? { uri: dbProfile.photos[0] }
      : require("@/assets/girls/ai1.jpg"),
    verified: dbProfile.is_verified,
    interests: dbProfile.interests || ["Travel", "Food", "Music"],
    bio: dbProfile.bio || "No bio yet",
    matchScore: dbProfile.matchScore,
  };
}

export const DiscoverScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  // State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [, setUserType] = useState<UserType | null>(null);
  const [displayProfiles, setDisplayProfiles] = useState<ProfileCardData[]>([]);
  const [matchedProfile, setMatchedProfile] = useState<MatchedProfile | null>(
    null,
  );
  const [showMatchModal, setShowMatchModal] = useState(false);

  // ── Auth & data via hooks (no direct supabase import) ──────────────────────
  const {
    data: currentUser,
    isLoading: userLoading,
  } = useCurrentUser();

  const userId = currentUser?.id ?? null;

  const {
    data: dbProfiles,
    isLoading: profilesLoading,
    refetch: refetchProfiles,
  } = useDiscoverProfiles(userId, 20);

  const likeMutation = useLikeProfile(userId);
  const passMutation = usePassProfile(userId);
  const superLikeMutation = useSuperLikeProfile(userId);

  const loading = userLoading || profilesLoading;

  const currentProfile = displayProfiles[currentIndex] || null;

  // Swipe gesture hook
  const { pan, rotate, panResponder, resetPosition } = useSwipeGesture({
    onSwipeLeft: handlePass,
    onSwipeRight: handleLike,
    onSwipeUp: handleSuperLike,
    onShowDetails: () => setShowInfo(true),
  });

  /**
   * Hydrate user type when auth resolves (preserves original behaviour)
   */
  useEffect(() => {
    if (!currentUser) return;
    accountApi.getBasicInfo().then((info) => {
      setUserType(info?.userType ?? null);
    });
  }, [currentUser]);

  /**
   * Sync fetched db profiles into local display state
   */
  useEffect(() => {
    if (dbProfiles && dbProfiles.length > 0) {
      setDisplayProfiles(dbProfiles.map(convertDBProfileToDisplay));
    } else if (dbProfiles) {
      setDisplayProfiles([]);
    }
  }, [dbProfiles]);

  /**
   * Load more profiles when running low
   */
  useEffect(() => {
    if (displayProfiles.length - currentIndex <= 2) {
      refetchProfiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refetchProfiles identity is stable; trigger only on index/length
  }, [currentIndex, displayProfiles.length]);

  /**
   * Handle like action
   */
  async function handleLike() {
    if (!userId || !currentProfile) return;

    const result = await likeMutation.mutateAsync({
      fromUserId: userId,
      toUserId: currentProfile.id,
    });

    if (result.success && result.isMatch) {
      setMatchedProfile(result.matchedProfile || null);
      setShowMatchModal(true);
    }

    moveToNextProfile();
  }

  /**
   * Handle pass action
   */
  async function handlePass() {
    if (!userId || !currentProfile) return;

    await passMutation.mutateAsync({
      fromUserId: userId,
      toUserId: currentProfile.id,
    });

    moveToNextProfile();
  }

  /**
   * Handle super like action
   */
  async function handleSuperLike() {
    if (!userId || !currentProfile) return;

    const result = await superLikeMutation.mutateAsync({
      fromUserId: userId,
      toUserId: currentProfile.id,
    });

    if (result.success && result.isMatch) {
      setMatchedProfile(result.matchedProfile || null);
      setShowMatchModal(true);
    }

    moveToNextProfile();
  }

  /**
   * Move to next profile in stack
   */
  function moveToNextProfile() {
    setCurrentIndex((prev) => prev + 1);
    setShowInfo(false);
    resetPosition();
  }

  /**
   * Handle match modal actions
   */
  function handleKeepSwiping() {
    setShowMatchModal(false);
    setMatchedProfile(null);
  }

  function handleSendMessage() {
    // TODO: Navigate to messages screen with matched profile
    if (__DEV__) {
      console.log("Send message to:", matchedProfile?.id);
    }
    setShowMatchModal(false);
    setMatchedProfile(null);
  }

  // Loading state
  if (loading) {
    return (
      <View style={[styles.root, styles.centerContent]}>
        <LinearGradient
          colors={[BRAND_BG, "#1A0F1F", "#2D1B35", BRAND_BG]}
          locations={[0, 0.3, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color={ACCENT_PINK} />
        <Text style={styles.loadingText}>Loading profiles...</Text>
      </View>
    );
  }

  // No profiles available
  if (displayProfiles.length === 0 || !currentProfile) {
    return (
      <View style={[styles.root, styles.centerContent]}>
        <LinearGradient
          colors={[BRAND_BG, "#1A0F1F", "#2D1B35", BRAND_BG]}
          locations={[0, 0.3, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.emptyText}>No more profiles</Text>
        <Text style={styles.emptySubtext}>
          Check back later for new matches
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={BRAND_BG}
        translucent={false}
      />
      {Platform.OS === "ios" && (
        <View style={{ height: insets.top, backgroundColor: BRAND_BG }} />
      )}

      {/* Brand Gradient Background */}
      <LinearGradient
        colors={[BRAND_BG, "#1A0F1F", "#2D1B35", BRAND_BG]}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header with Logo */}
      <View style={styles.header}>
        <Text style={styles.logoText}>PinayMate</Text>
      </View>

      {/* Cards Container */}
      <View style={styles.cardsContainer}>
        {/* Current Profile Card */}
        {currentProfile && (
          <ProfileCard
            profile={currentProfile}
            pan={pan}
            rotate={rotate}
            panHandlers={panResponder.panHandlers}
          />
        )}

        {/* Next Profile Card (Preview) */}
        {displayProfiles[currentIndex + 1] && (
          <ProfileCard
            profile={displayProfiles[currentIndex + 1]}
            pan={pan}
            rotate={rotate}
            panHandlers={{}}
            style={styles.nextCard}
          />
        )}
      </View>

      {/* Action Buttons */}
      <ActionButtons
        onPass={handlePass}
        onLike={handleLike}
        onSuperLike={handleSuperLike}
        onInfo={() => setShowInfo(true)}
        disabled={!currentProfile}
      />

      {/* Profile Details Modal */}
      <ProfileDetailsModal
        visible={showInfo}
        profile={currentProfile}
        onClose={() => setShowInfo(false)}
      />

      {/* Match Modal */}
      <MatchModal
        visible={showMatchModal}
        matchedProfile={matchedProfile}
        onKeepSwiping={handleKeepSwiping}
        onSendMessage={handleSendMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND_BG,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },

  // Header
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: "center",
  },
  logoText: {
    fontSize: 28,
    fontFamily: "Lora-Bold",
    color: WHITE,
    letterSpacing: 1,
  },

  // Cards
  cardsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  nextCard: {
    opacity: 0.5,
    transform: [{ scale: 0.95 }],
  },

  // Loading & Empty States
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "DMSans-Medium",
    color: "rgba(255, 255, 255, 0.7)",
  },
  emptyText: {
    fontSize: 22,
    fontFamily: "DMSans-Bold",
    color: WHITE,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    fontFamily: "DMSans-Regular",
    color: "rgba(255, 255, 255, 0.6)",
  },
});
