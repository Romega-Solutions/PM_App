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
import { LaunchStateNotice } from "@/src/components/ui/LaunchStateNotice";
import {
  fetchDiscoverProfiles,
  likeProfile,
  MATCHING_ERRORS,
  passProfile,
  superLikeProfile,
} from "@/src/features/matching/api/matchingApi";
import { Profile as DBProfile } from "@/src/features/matching/types";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  UserSearch,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActionButtons } from "../components/ActionButtons";
import { MatchModal, MatchedProfile } from "../components/MatchModal";
import { ProfileCard, ProfileCardData } from "../components/ProfileCard";
import { ProfileDetailsModal } from "../components/ProfileDetailsModal";
import { useSwipeGesture } from "../hooks/useSwipeGesture";
import { getSeedProfiles } from "../data/seedProfiles";

// Brand Colors
const BRAND_BG = "#0F0814";
const ACCENT_PINK = "#EF3E78";
const WHITE = "#FFFFFF";
const TEXT_SECONDARY = "rgba(255, 255, 255, 0.74)";
const TEXT_MUTED = "rgba(255, 255, 255, 0.56)";
const SURFACE_BORDER = "rgba(239, 62, 120, 0.24)";
function isMissingAuthSession(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "AuthSessionMissingError"
  );
}

/**
 * Convert database profile to display format
 */
function convertDBProfileToDisplay(dbProfile: DBProfile): ProfileCardData {
  const location = [dbProfile.city, dbProfile.country]
    .filter(Boolean)
    .join(", ");

  return {
    id: dbProfile.id,
    name: dbProfile.first_name,
    age: dbProfile.age,
    location: location || "Location not shown",
    distance: "Approximate area",
    image: dbProfile.photos?.[0] ? { uri: dbProfile.photos[0] } : null,
    verified: dbProfile.is_verified,
    interests: dbProfile.interests || [],
    bio: dbProfile.bio || "No bio yet",
    matchScore: dbProfile.matchScore,
    heightCm: dbProfile.height_cm,
    education: dbProfile.education,
    occupation: dbProfile.occupation,
    relationshipGoal: dbProfile.relationship_goal,
    languages: dbProfile.languages,
    bodyType: dbProfile.body_type,
  };
}

export const DiscoverScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<ProfileCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [usingSeedProfiles, setUsingSeedProfiles] = useState(false);
  const [lastFailedAction, setLastFailedAction] = useState<
    "pass" | "like" | "superLike" | null
  >(null);
  const [matchedProfile, setMatchedProfile] = useState<MatchedProfile | null>(
    null,
  );
  const [showMatchModal, setShowMatchModal] = useState(false);

  const currentProfile = profiles[currentIndex] || null;

  const resetPositionRef = React.useRef<(() => void) | null>(null);

  const previewPan = React.useRef(new Animated.ValueXY()).current;
  const previewRotate = previewPan.x.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["0deg", "0deg", "0deg"],
    extrapolate: "clamp",
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
  const loadMoreProfiles = useCallback(async () => {
    if (!userId) return;

    try {
      const { data: dbProfiles } = await fetchDiscoverProfiles(userId, 10);

      if (dbProfiles && dbProfiles.length > 0) {
        const displayProfiles = dbProfiles.map(convertDBProfileToDisplay);
        setProfiles((prev) => [...prev, ...displayProfiles]);
      }
    } catch {
      console.error("Failed to load more profiles.");
    }
  }, [userId]);

  /**
   * Load more profiles when running low
   */
  useEffect(() => {
    if (profiles.length - currentIndex <= 2) {
      loadMoreProfiles();
    }
  }, [currentIndex, loadMoreProfiles, profiles.length]);

  /**
   * Fetch user data and initial profiles
   */
  async function loadUserDataAndProfiles() {
    setLoading(true);
    setLoadError(null);
    setActionError(null);
    setCurrentIndex(0);

    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        if (userError && !isMissingAuthSession(userError)) {
          console.error("Failed to fetch user.");
        }
        setLoadError("Please sign in to view discover profiles.");
        setProfiles([]);
        setLoading(false);
        return;
      }

      setUserId(user.id);

      // Fetch discover profiles from database
      const { data: dbProfiles, error: profilesError } =
        await fetchDiscoverProfiles(user.id, 20);

      if (profilesError) {
        console.error("Failed to fetch profiles.");
        setLoadError("We could not refresh your discover feed.");
        // Show empty state - no fallback to mock data
        setProfiles([]);
      } else if (dbProfiles && dbProfiles.length > 0) {
        // Convert database profiles to display format
        const displayProfiles: ProfileCardData[] = dbProfiles.map(
          convertDBProfileToDisplay,
        );
        setProfiles(displayProfiles);
        setUsingSeedProfiles(false);
      } else {
        // No real profiles — show seed demo profiles
        setProfiles(getSeedProfiles());
        setUsingSeedProfiles(true);
      }
    } catch {
      console.error("Failed to fetch user data.");
      setLoadError("We could not refresh your discover feed.");
      // Show empty state - no fallback to mock data
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Move to next profile in stack
   */
  const moveToNextProfile = useCallback(() => {
    setCurrentIndex((prev) => prev + 1);
    setShowInfo(false);
    setActionError(null);
    setLastFailedAction(null);
    resetPositionRef.current?.();
  }, []);

  /**
   * Handle like action
   */
  const handleLike = useCallback(async () => {
    if (!currentProfile || actionPending) return;

    // Seed profiles: just move to next card, no backend call
    if (currentProfile.isSeedProfile) {
      moveToNextProfile();
      return;
    }

    if (!userId) return;

    setActionPending(true);
    setActionError(null);
    setLastFailedAction(null);

    try {
      // Save like to database
      const result = await likeProfile(userId, currentProfile.id);

      if (!result.success) {
        setActionError(
          result.error || MATCHING_ERRORS.LIKE,
        );
        setLastFailedAction("like");
        resetPositionRef.current?.();
        return;
      }

      if (result.success && result.isMatch) {
        // Show match modal
        setMatchedProfile(result.matchedProfile || null);
        setShowMatchModal(true);
      }

      // Move to next profile
      moveToNextProfile();
    } catch {
      console.error("Failed to like profile.");
      setActionError(MATCHING_ERRORS.LIKE);
      setLastFailedAction("like");
      resetPositionRef.current?.();
    } finally {
      setActionPending(false);
    }
  }, [currentProfile, actionPending, userId, moveToNextProfile]);

  /**
   * Handle pass action
   */
  const handlePass = useCallback(async () => {
    if (!currentProfile || actionPending) return;

    // Seed profiles: just move to next card, no backend call
    if (currentProfile.isSeedProfile) {
      moveToNextProfile();
      return;
    }

    if (!userId) return;

    setActionPending(true);
    setActionError(null);
    setLastFailedAction(null);

    try {
      // Save pass to database
      const result = await passProfile(userId, currentProfile.id);

      if (!result.success) {
        setActionError(
          result.error || MATCHING_ERRORS.PASS,
        );
        setLastFailedAction("pass");
        resetPositionRef.current?.();
        return;
      }

      // Move to next profile
      moveToNextProfile();
    } catch {
      console.error("Failed to pass profile.");
      setActionError(MATCHING_ERRORS.PASS);
      setLastFailedAction("pass");
      resetPositionRef.current?.();
    } finally {
      setActionPending(false);
    }
  }, [currentProfile, actionPending, userId, moveToNextProfile]);

  /**
   * Handle super like action
   */
  const handleSuperLike = useCallback(async () => {
    if (!currentProfile || actionPending) return;

    // Seed profiles: just move to next card, no backend call
    if (currentProfile.isSeedProfile) {
      moveToNextProfile();
      return;
    }

    if (!userId) return;

    setActionPending(true);
    setActionError(null);
    setLastFailedAction(null);

    try {
      // Save super like to database
      const result = await superLikeProfile(userId, currentProfile.id);

      if (!result.success) {
        setActionError(
          result.error || MATCHING_ERRORS.SUPERLIKE,
        );
        setLastFailedAction("superLike");
        resetPositionRef.current?.();
        return;
      }

      if (result.success && result.isMatch) {
        // Show match modal
        setMatchedProfile(result.matchedProfile || null);
        setShowMatchModal(true);
      }

      // Move to next profile
      moveToNextProfile();
    } catch {
      console.error("Failed to super like profile.");
      setActionError(MATCHING_ERRORS.SUPERLIKE);
      setLastFailedAction("superLike");
      resetPositionRef.current?.();
    } finally {
      setActionPending(false);
    }
  }, [currentProfile, actionPending, userId, moveToNextProfile]);


  const retryLastFailedAction = useCallback(() => {
    if (!lastFailedAction || actionPending) return;

    if (lastFailedAction === "pass") {
      handlePass();
      return;
    }

    if (lastFailedAction === "like") {
      handleLike();
      return;
    }

    handleSuperLike();
  }, [lastFailedAction, actionPending, handlePass, handleLike, handleSuperLike]);

  // Swipe gesture hook
  const { pan, rotate, panResponder, resetPosition } = useSwipeGesture({
    onSwipeLeft: handlePass,
    onSwipeRight: handleLike,
    onSwipeUp: handleSuperLike,
    onShowDetails: () => setShowInfo(true),
  });

  useEffect(() => {
    resetPositionRef.current = resetPosition;
  }, [resetPosition]);


  const handleKeepSwiping = useCallback(() => {
    setShowMatchModal(false);
    setMatchedProfile(null);
  }, []);

  const handleSendMessage = useCallback(() => {
    setShowMatchModal(false);
    setMatchedProfile(null);
    router.push("/(main)/likes");
  }, [router]);

  const handleReportCurrentProfile = useCallback(() => {
    if (!currentProfile) return;

    setShowInfo(false);
    router.push({
      pathname: "/(modals)/report-user",
      params: {
        userId: currentProfile.id,
        userName: currentProfile.name,
        source: "discovery",
      },
    });
  }, [currentProfile, router]);

  // Loading state
  if (loading) {
    return (
      <View
        style={[
          styles.root,
          styles.centerContent,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}
      >
        <LinearGradient
          colors={[BRAND_BG, "#1A0F1F", "#2D1B35", BRAND_BG]}
          locations={[0, 0.3, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.loadingPanel}>
          <View style={styles.stageGlow} />
          <Text style={styles.stageEyebrow}>Discovery is calibrating</Text>
          <ActivityIndicator
            size="large"
            color={ACCENT_PINK}
            accessibilityLabel="Loading discover profiles"
          />
          <Text style={styles.loadingText}>
            Checking your preferences and profile review...
          </Text>
          <Text style={styles.loadingSubtext}>
            Discovery respects profile visibility, privacy settings, and the
            profiles currently available for this launch stage.
          </Text>
        </View>
      </View>
    );
  }

  // No profiles available
  if (profiles.length === 0 || !currentProfile) {
    return (
      <View
        style={[
          styles.root,
          styles.centerContent,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}
      >
        <LinearGradient
          colors={[BRAND_BG, "#1A0F1F", "#2D1B35", BRAND_BG]}
          locations={[0, 0.3, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.emptyPanel}>
          <View style={styles.stageGlow} />
          <Text style={styles.stageEyebrow}>
            {loadError ? "Refresh needed" : "Discovery set reviewed"}
          </Text>
          <View style={styles.emptyIconWrap}>
            {loadError ? (
              <RefreshCw size={34} color={ACCENT_PINK} strokeWidth={2} />
            ) : (
              <UserSearch size={38} color={ACCENT_PINK} strokeWidth={1.8} />
            )}
          </View>
          <Text style={styles.emptyText}>
            {loadError
              ? "Discover did not refresh"
              : "No profiles available here yet"}
          </Text>
          <Text style={styles.emptySubtext}>
            {loadError ??
              "You reached the end of this preference set. Privacy settings, profile review, distance filters, or who is currently available can limit who appears."}
          </Text>
          <View style={styles.emptyTrustRow}>
            <View style={styles.emptyTrustPill}>
              <ShieldCheck size={13} color={WHITE} strokeWidth={2.2} />
              <Text style={styles.emptyTrustText}>Visibility respected</Text>
            </View>
            <View style={styles.emptyTrustPillQuiet}>
              <Text style={styles.emptyTrustTextQuiet}>Filters can be changed</Text>
            </View>
          </View>
          <View style={styles.emptyActions}>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={loadUserDataAndProfiles}
              accessibilityRole="button"
              accessibilityLabel="Refresh discover profiles"
              accessibilityHint="Attempts to load profiles again"
              activeOpacity={0.84}
            >
              <RefreshCw size={18} color={WHITE} strokeWidth={2.4} />
              <Text style={styles.retryButtonText}>Refresh</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryEmptyButton}
              onPress={() => router.push("/(modals)/filters")}
              accessibilityRole="button"
              accessibilityLabel="Adjust discovery filters"
              accessibilityHint="Opens age, distance, and relationship filters"
              activeOpacity={0.84}
            >
              <SlidersHorizontal size={18} color={WHITE} strokeWidth={2.4} />
              <Text style={styles.secondaryEmptyButtonText}>Adjust filters</Text>
            </TouchableOpacity>
          </View>
        </View>
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
      {Platform.OS !== "web" && (
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
        <Text style={styles.helperText}>
          Review details before choosing. You can pass, like, or report without
          pressure.
        </Text>
      </View>

      {usingSeedProfiles && (
        <View style={styles.seedBanner}>
          <Text style={styles.seedBannerText}>
            Showing demo profiles — real members will appear once the community grows
          </Text>
        </View>
      )}

      <LaunchStateNotice
        testID="discover-launch-state-notice"
        style={styles.discoveryNotice}
        title="Preference-based discovery"
        message="Visibility settings are respected. Discovery depends on privacy settings, review status, filters, and who is currently available. Review details before liking, report anything that feels off, and pass whenever you are unsure."
        accessibilityLabel="Discovery safety note. Preference-based discovery respects visibility settings, profile review, filters, and current availability. Reports stay available, and passing is always okay."
      />

      {/* Cards Container */}
      <View style={styles.cardsContainer}>
        {/* Next Profile Card (Preview) */}
        {profiles[currentIndex + 1] && (
          <ProfileCard
            profile={profiles[currentIndex + 1]}
            pan={previewPan}
            rotate={previewRotate}
            panHandlers={{}}
            style={styles.nextCard}
            isPreview
          />
        )}

        {/* Current Profile Card */}
        {currentProfile && (
          <ProfileCard
            profile={currentProfile}
            pan={pan}
            rotate={rotate}
            panHandlers={actionPending ? {} : panResponder.panHandlers}
          />
        )}
      </View>

      {actionError ? (
        <View
          style={styles.actionError}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          <Text style={styles.actionErrorText}>{actionError}</Text>
          {lastFailedAction ? (
            <TouchableOpacity
              style={styles.retryActionButton}
              onPress={retryLastFailedAction}
              disabled={actionPending}
              accessibilityRole="button"
              accessibilityLabel="Retry last discover action"
              accessibilityHint="Tries the failed swipe action again without changing cards"
              accessibilityState={{ disabled: actionPending }}
              activeOpacity={0.84}
            >
              <RotateCcw size={16} color={WHITE} strokeWidth={2.4} />
              <Text style={styles.retryActionButtonText}>
                {actionPending ? "Retrying..." : "Retry this card"}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {!actionError && actionPending ? (
        <View
          style={styles.actionStatus}
          accessibilityRole="progressbar"
          accessibilityLiveRegion="polite"
          accessibilityLabel="Saving your discover choice"
        >
          <ActivityIndicator size="small" color={WHITE} />
          <Text style={styles.actionStatusText}>
            Saving your choice. The card will stay here until it finishes.
          </Text>
        </View>
      ) : null}

      {/* Action Buttons */}
      <ActionButtons
        onPass={handlePass}
        onLike={handleLike}
        onSuperLike={handleSuperLike}
        onInfo={() => setShowInfo(true)}
        disabled={!currentProfile || actionPending}
        bottomInset={insets.bottom}
      />

      {/* Profile Details Modal */}
      <ProfileDetailsModal
        visible={showInfo}
        profile={currentProfile}
        onClose={() => setShowInfo(false)}
        onReport={handleReportCurrentProfile}
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
    paddingHorizontal: 32,
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

  // Seed profile demo banner
  seedBanner: {
    marginHorizontal: 24,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(141, 105, 246, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(141, 105, 246, 0.32)",
  },
  seedBannerText: {
    fontSize: 12,
    fontFamily: "DMSans-Medium",
    color: "rgba(255, 255, 255, 0.82)",
    textAlign: "center",
    lineHeight: 17,
  },

  // Cards
  cardsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  nextCard: {
    opacity: 0.42,
    transform: [{ scale: 0.95 }],
  },
  actionError: {
    marginHorizontal: 24,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "rgba(239, 62, 120, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(239, 62, 120, 0.32)",
    gap: 10,
    alignItems: "center",
  },
  actionErrorText: {
    fontSize: 13,
    fontFamily: "DMSans-Bold",
    color: WHITE,
    lineHeight: 18,
    textAlign: "center",
  },
  retryActionButton: {
    minHeight: 42,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: ACCENT_PINK,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  retryActionButtonText: {
    fontSize: 13,
    fontFamily: "DMSans-Bold",
    color: WHITE,
  },
  actionStatus: {
    marginHorizontal: 24,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.16)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  actionStatusText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "DMSans-Medium",
    color: "rgba(255, 255, 255, 0.78)",
    lineHeight: 18,
  },

  // Loading & Empty States
  loadingPanel: {
    width: "100%",
    maxWidth: 318,
    paddingHorizontal: 8,
    paddingVertical: 22,
    alignItems: "center",
  },
  stageGlow: {
    position: "absolute",
    top: 4,
    width: 172,
    height: 172,
    borderRadius: 86,
    backgroundColor: "rgba(239, 62, 120, 0.16)",
    opacity: 0.72,
  },
  stageEyebrow: {
    marginBottom: 16,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
    fontSize: 12,
    fontFamily: "DMSans-Bold",
    color: "rgba(255, 255, 255, 0.78)",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    overflow: "hidden",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "DMSans-Medium",
    color: TEXT_SECONDARY,
    textAlign: "center",
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    color: TEXT_MUTED,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 286,
  },
  emptyPanel: {
    width: "100%",
    maxWidth: 336,
    paddingHorizontal: 8,
    paddingVertical: 26,
    alignItems: "center",
  },
  emptyIconWrap: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "rgba(239, 62, 120, 0.12)",
    borderWidth: 1,
    borderColor: SURFACE_BORDER,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 22,
  },
  emptyText: {
    fontSize: 24,
    fontFamily: "DMSans-Bold",
    color: WHITE,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 16,
    fontFamily: "DMSans-Regular",
    color: TEXT_MUTED,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
  emptyTrustRow: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  emptyTrustPill: {
    minHeight: 30,
    borderRadius: 15,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(239, 62, 120, 0.76)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  emptyTrustPillQuiet: {
    minHeight: 30,
    borderRadius: 15,
    paddingHorizontal: 10,
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
  },
  emptyTrustText: {
    fontSize: 12,
    fontFamily: "DMSans-Bold",
    color: WHITE,
  },
  emptyTrustTextQuiet: {
    fontSize: 12,
    fontFamily: "DMSans-Bold",
    color: "rgba(255, 255, 255, 0.74)",
  },
  emptyActions: {
    marginTop: 22,
    gap: 12,
    width: "100%",
    maxWidth: 280,
  },
  retryButton: {
    minHeight: 50,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 16,
    backgroundColor: ACCENT_PINK,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  retryButtonText: {
    fontSize: 15,
    fontFamily: "DMSans-Bold",
    color: WHITE,
  },
  secondaryEmptyButton: {
    minHeight: 50,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryEmptyButtonText: {
    fontSize: 15,
    fontFamily: "DMSans-Bold",
    color: WHITE,
  },
  helperText: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: "DMSans-Medium",
    color: TEXT_MUTED,
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 310,
  },
  discoveryNotice: {
    marginHorizontal: 22,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
});
