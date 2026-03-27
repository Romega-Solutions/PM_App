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

import { supabase } from "@/src/config/supabase";
import { accountApi } from "@/src/features/account/api/accountApi";
import { UserType } from "@/src/features/auth/api/authApi";
import {
    fetchDiscoverProfiles,
    likeProfile,
    passProfile,
    superLikeProfile,
} from "@/src/features/matching/api/matchingApi";
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
  const [userType, setUserType] = useState<UserType | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<ProfileCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchedProfile, setMatchedProfile] = useState<MatchedProfile | null>(
    null,
  );
  const [showMatchModal, setShowMatchModal] = useState(false);

  const currentProfile = profiles[currentIndex] || null;

  // Swipe gesture hook
  const { pan, rotate, panResponder, resetPosition } = useSwipeGesture({
    onSwipeLeft: handlePass,
    onSwipeRight: handleLike,
    onSwipeUp: handleSuperLike,
    onShowDetails: () => setShowInfo(true),
  });

  /**
   * Load user data and profiles on mount
   */
  useEffect(() => {
    loadUserDataAndProfiles();
  }, []);

  /**
   * Load more profiles when running low
   */
  useEffect(() => {
    if (profiles.length - currentIndex <= 2) {
      loadMoreProfiles();
    }
  }, [currentIndex, profiles.length]);

  /**
   * Fetch user data and initial profiles
   */
  async function loadUserDataAndProfiles() {
    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Failed to fetch user:", userError);
        setLoading(false);
        return;
      }

      setUserId(user.id);

      // Get user type
      const basicInfo = await accountApi.getBasicInfo();
      setUserType(basicInfo?.userType ?? null);

      // Fetch discover profiles from database
      const { data: dbProfiles, error: profilesError } =
        await fetchDiscoverProfiles(user.id, 20);

      if (profilesError) {
        console.error("Failed to fetch profiles:", profilesError);
        // Show empty state - no fallback to mock data
        setProfiles([]);
      } else if (dbProfiles && dbProfiles.length > 0) {
        // Convert database profiles to display format
        const displayProfiles: ProfileCardData[] = dbProfiles.map(
          convertDBProfileToDisplay,
        );
        setProfiles(displayProfiles);
      } else {
        // No profiles in database
        setProfiles([]);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      // Show empty state - no fallback to mock data
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Load more profiles when running low
   */
  async function loadMoreProfiles() {
    if (!userId) return;

    try {
      const { data: dbProfiles } = await fetchDiscoverProfiles(userId, 10);

      if (dbProfiles && dbProfiles.length > 0) {
        const displayProfiles = dbProfiles.map(convertDBProfileToDisplay);
        setProfiles((prev) => [...prev, ...displayProfiles]);
      }
    } catch (error) {
      console.error("Failed to load more profiles:", error);
    }
  }

  /**
   * Handle like action
   */
  async function handleLike() {
    if (!userId || !currentProfile) return;

    // Save like to database
    const result = await likeProfile(userId, currentProfile.id);

    if (result.success && result.isMatch) {
      // Show match modal
      setMatchedProfile(result.matchedProfile || null);
      setShowMatchModal(true);
    }

    // Move to next profile
    moveToNextProfile();
  }

  /**
   * Handle pass action
   */
  async function handlePass() {
    if (!userId || !currentProfile) return;

    // Save pass to database
    await passProfile(userId, currentProfile.id);

    // Move to next profile
    moveToNextProfile();
  }

  /**
   * Handle super like action
   */
  async function handleSuperLike() {
    if (!userId || !currentProfile) return;

    // Save super like to database
    const result = await superLikeProfile(userId, currentProfile.id);

    if (result.success && result.isMatch) {
      // Show match modal
      setMatchedProfile(result.matchedProfile || null);
      setShowMatchModal(true);
    }

    // Move to next profile
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
    console.log("Send message to:", matchedProfile);
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
  if (profiles.length === 0 || !currentProfile) {
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
        {profiles[currentIndex + 1] && (
          <ProfileCard
            profile={profiles[currentIndex + 1]}
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
    fontFamily: "HelloParisSans",
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
