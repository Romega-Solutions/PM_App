/**
 * ProfileScreen Component
 *
 * Main user profile screen displaying avatar, info, and settings menu.
 * Integrates with Zustand profileStore for global state management.
 *
 * SOLID Principles:
 * - Single Responsibility: Manages profile screen UI and user interactions
 * - Open/Closed: Extensible via props, uses composable components
 * - Liskov Substitution: Can be used in any screen context
 * - Interface Segregation: Uses focused hooks and stores
 * - Dependency Inversion: Depends on abstractions (stores, APIs)
 *
 * Data Flow:
 * 1. Load profile from Supabase on mount
 * 2. Store in Zustand profileStore
 * 3. Display using ProfileHeader and ProfileMenuList components
 * 4. Handle logout and navigation
 *
 * @module features/profile/screens
 */

import { LinearGradient } from "expo-linear-gradient";
import { useRouter, type Href } from "expo-router";
import { Settings } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { makeStyles } from "../../../theme/makeStyles";
import { useAppTheme } from "../../../theme/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { supabase } from "@/src/config/supabase";
import { accountApi } from "@/src/features/account/api/accountApi";
import { UserType } from "@/src/features/auth/api/authApi";
import {
  BETA_DEMO_COPY,
  type DemoPreviewUserType,
} from "@/src/features/auth/demoMode";
import { useDemoMatchingStore } from "@/src/stores/demoMatchingStore";
import { useAuthStore } from "@/src/stores/authStore";
import { useChatStore } from "@/src/stores/chatStore";
import { useMessageStore } from "@/src/stores/messageStore";
import { useProfileStore } from "@/src/stores/profileStore";
import { ProfileHeader } from "../components/ProfileHeader";
import {
  ProfileMenuList,
  getDefaultMenuItems,
} from "../components/ProfileMenuList";
import {
  clearDemoProfileOverrides,
  getDemoProfileScreenData,
} from "../data/demoProfileStore";

/**
 * Profile data interface
 */
export interface ProfileData {
  firstName: string | null;
  lastName: string | null;
  age: number | null;
  userType: UserType | null;
  location: string | null;
  photoUri: string | null;
  isVerified: boolean;
}

type ProfileRow = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  age?: number | null;
  user_type?: string | null;
  location_name?: string | null;
  photos?: string[] | null;
  is_verified?: boolean | null;
};

function cleanString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function cleanAge(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : null;
}

function cleanUserType(value: unknown): UserType | null {
  return value === "filipina" || value === "foreigner" ? value : null;
}

function cleanPhotos(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((photo): photo is string => cleanString(photo) !== null)
    : [];
}

export function createProfileData(profileFromDB: ProfileRow): ProfileData {
  const photosArray = cleanPhotos(profileFromDB.photos);
  const firstPhoto =
    photosArray.find((photo) => photo.startsWith("http")) ?? null;

  return {
    firstName: cleanString(profileFromDB.first_name),
    lastName: cleanString(profileFromDB.last_name),
    age: cleanAge(profileFromDB.age),
    userType: cleanUserType(profileFromDB.user_type),
    location: cleanString(profileFromDB.location_name),
    photoUri: firstPhoto,
    isVerified: profileFromDB.is_verified === true,
  };
}

/**
 * ProfileScreen Component
 *
 * Displays user profile with settings menu.
 * Integrates with Zustand for global state.
 */
export const ProfileScreen: React.FC = () => {
  const styles = useStyles();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const isDemoMode = useAuthStore((state) => state.isDemoMode);
  const demoUserType = useAuthStore((state) => state.demoUserType);
  const startDemoSession = useAuthStore((state) => state.startDemoSession);
  const endDemoSession = useAuthStore((state) => state.endDemoSession);
  const resetDemoMatching = useDemoMatchingStore(
    (state) => state.resetDemoMatching,
  );
  const clearChat = useChatStore((state) => state.clearChat);
  const clearMessageCache = useMessageStore((state) => state.clearCache);

  // Zustand store
  const { setProfile, clearProfile } = useProfileStore();

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        if (isDemoMode) {
          setProfileData(getDemoProfileScreenData(demoUserType));
          setLoading(false);
          return;
        }

        // Get current session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          setProfileData(null);
          setLoading(false);
          router.replace("/(auth)/welcome");
          return;
        }

        const userId = session.user.id;

        // Fetch profile from Supabase
        const { data: profileFromDB, error } = await supabase
          .from("profiles")
          .select(
            "id, email, first_name, last_name, age, user_type, gender, location_name, photos, is_verified",
          )
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Failed to fetch profile.");
          setProfileData(null);
          setLoading(false);
          return;
        }

        if (profileFromDB) {
          const photosArray = cleanPhotos(profileFromDB.photos);
          const data = createProfileData(profileFromDB);

          // Update local state
          setProfileData(data);

          // Update Zustand store
          setProfile({
            id: profileFromDB.id,
            firstName: data.firstName ?? "",
            lastName: data.lastName ?? "",
            age: data.age ?? 0,
            location: data.location ?? "",
            photos: photosArray,
            isVerified: data.isVerified,
          });
        }
      } catch {
        console.error("Failed to fetch profile data.");
        setProfileData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [demoUserType, isDemoMode, router, setProfile]);

  // Handle menu item press
  const handleMenuItemPress = (route: Href) => {
    router.push(route);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      if (isDemoMode) {
        endDemoSession();
        clearProfile();
        router.replace("/(auth)/welcome");
        return;
      }

      // Sign out from Supabase
      await supabase.auth.signOut();

      // Clear Zustand store
      clearProfile();

      // Clear local storage
      accountApi.clearBasicInfo();
      accountApi.clearLocation();
      accountApi.clearPreferences();
      accountApi.clearVerification();

      router.replace("/(auth)/welcome");
    } catch {
      console.error("Error during logout.");
      router.replace("/(auth)/welcome");
    }
  };

  const handleSwitchDemoPreview = (nextUserType: DemoPreviewUserType) => {
    if (nextUserType === demoUserType) return;

    resetDemoMatching();
    clearMessageCache();
    clearChat();
    clearDemoProfileOverrides();
    startDemoSession(nextUserType);
    setProfileData(getDemoProfileScreenData(nextUserType));
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.root, styles.centerContent]}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.semanticColors.background}
          translucent={false}
        />
        {Platform.OS !== "web" && (
          <View style={{ height: insets.top, backgroundColor: theme.semanticColors.background }} />
        )}
        <LinearGradient
          colors={[
            theme.semanticColors.background,
            theme.colors.dalisay[900],
            theme.colors.dalisay[900],
            theme.semanticColors.background,
          ]}
          locations={[0, 0.3, 0.7, 1]}
          style={styles.absoluteFill}
        />
        <ActivityIndicator
          size="large"
          color={theme.semanticColors.primary}
          accessibilityLabel="Loading profile"
        />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  // No profile data
  if (!profileData) {
    return (
      <View style={[styles.root, styles.centerContent]}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.semanticColors.background}
          translucent={false}
        />
        {Platform.OS !== "web" && (
          <View style={{ height: insets.top, backgroundColor: theme.semanticColors.background }} />
        )}
        <LinearGradient
          colors={[
            theme.semanticColors.background,
            theme.colors.dalisay[900],
            theme.colors.dalisay[900],
            theme.semanticColors.background,
          ]}
          locations={[0, 0.3, 0.7, 1]}
          style={styles.absoluteFill}
        />
        <View
          style={styles.emptyProfilePanel}
          accessible
          accessibilityLabel="Could not load profile. Sign in again to restore your profile and settings."
        >
          <Text style={styles.emptyTitle}>Profile needs a refresh</Text>
          <Text style={styles.emptyText}>
            We could not load your profile. Sign in again to restore your
            profile, privacy settings, and discovery controls.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => router.replace("/(auth)/welcome")}
          activeOpacity={0.78}
          accessibilityRole="button"
          accessibilityLabel="Go to sign in"
          accessibilityHint="Returns to the welcome screen so you can sign in again"
        >
          <Text style={styles.retryText}>Go to Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Menu items
  const menuItems = getDefaultMenuItems(theme);

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.semanticColors.background}
        translucent={false}
      />
      {Platform.OS !== "web" && (
        <View style={{ height: insets.top, backgroundColor: theme.semanticColors.background }} />
      )}

      {/* Brand gradient background */}
      <LinearGradient
        colors={[
          theme.semanticColors.background,
          theme.colors.dalisay[900],
          theme.colors.dalisay[900],
          theme.semanticColors.background,
        ]}
        locations={[0, 0.3, 0.7, 1]}
        style={styles.absoluteFill}
      />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity
            onPress={() => router.push("/(main)/profile-settings/preferences")}
            style={styles.settingsBtn}
            activeOpacity={0.78}
            accessibilityRole="button"
            accessibilityLabel="Open profile preferences"
            accessibilityHint="Opens match preference settings"
          >
            <Settings size={28} color={theme.semanticColors.secondary} />
          </TouchableOpacity>
        </View>

        {/* Profile Header Component */}
        <ProfileHeader
          firstName={profileData.firstName}
          lastName={profileData.lastName}
          age={profileData.age}
          userType={profileData.userType}
          location={profileData.location}
          photoUri={profileData.photoUri}
          isVerified={profileData.isVerified}
        />

        <View
          style={styles.profileStatusStrip}
          accessible
          accessibilityLabel="Profile notice. Your profile information loads from your account. Discovery and connection features depend on your privacy settings, review status, and available app access."
        >
          <Text style={styles.profileStatusTitle}>Profile access</Text>
          <Text style={styles.profileStatusText}>
            Your profile information loads from your account. Discovery and
            connection features depend on privacy settings, review status, and
            available app access.
          </Text>
        </View>

        {isDemoMode ? (
          <View style={styles.demoStatusStrip}>
            <View style={styles.demoStatusHeader}>
              <View style={styles.demoStatusCopy}>
                <Text style={styles.demoStatusTitle}>
                  {BETA_DEMO_COPY.title}
                </Text>
                <Text style={styles.demoStatusText}>
                  {BETA_DEMO_COPY.message}
                </Text>
              </View>
              <View style={styles.demoStatusBadge}>
                <Text style={styles.demoStatusBadgeText}>
                  {demoUserType === "filipina" ? "Pinay" : "Foreigner"}
                </Text>
              </View>
            </View>
            <View style={styles.demoSwitchGroup}>
              <TouchableOpacity
                style={[
                  styles.demoSwitchButton,
                  demoUserType === "foreigner" && styles.demoSwitchButtonActive,
                ]}
                onPress={() => handleSwitchDemoPreview("foreigner")}
                activeOpacity={0.84}
                accessibilityRole="button"
                accessibilityLabel="Switch to foreigner preview"
                accessibilityState={{ selected: demoUserType === "foreigner" }}
              >
                <Text
                  style={[
                    styles.demoSwitchButtonText,
                    demoUserType === "foreigner" &&
                      styles.demoSwitchButtonTextActive,
                  ]}
                >
                  Foreigner
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.demoSwitchButton,
                  demoUserType === "filipina" && styles.demoSwitchButtonActive,
                ]}
                onPress={() => handleSwitchDemoPreview("filipina")}
                activeOpacity={0.84}
                accessibilityRole="button"
                accessibilityLabel="Switch to Pinay preview"
                accessibilityState={{ selected: demoUserType === "filipina" }}
              >
                <Text
                  style={[
                    styles.demoSwitchButtonText,
                    demoUserType === "filipina" &&
                      styles.demoSwitchButtonTextActive,
                  ]}
                >
                  Pinay
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Menu List Component */}
        <ProfileMenuList
          items={menuItems}
          onItemPress={handleMenuItemPress}
          onLogout={handleLogout}
        />

        <View style={{ height: Math.max(insets.bottom, 20) }} />
      </ScrollView>
    </View>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.semanticColors.background,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  absoluteFill: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 32,
    fontFamily: "DMSans-Bold",
    color: theme.semanticColors.text,
    letterSpacing: 0.5,
  },
  settingsBtn: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  profileStatusStrip: {
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 8,
    paddingLeft: 16,
    paddingVertical: 12,
    borderLeftWidth: 3,
    borderLeftColor: theme.semanticColors.secondary,
    backgroundColor: "rgba(141, 105, 246, 0.08)",
  },
  profileStatusTitle: {
    fontSize: 15,
    fontFamily: "DMSans-Bold",
    color: theme.semanticColors.text,
    marginBottom: 6,
  },
  profileStatusText: {
    fontSize: 13,
    fontFamily: "DMSans-Regular",
    color: "rgba(255, 255, 255, 0.72)",
    lineHeight: 20,
  },
  demoStatusStrip: {
    marginHorizontal: 24,
    marginBottom: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(239, 62, 120, 0.3)",
    borderRadius: 18,
    backgroundColor: "rgba(239, 62, 120, 0.1)",
  },
  demoStatusHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  demoStatusCopy: {
    flex: 1,
  },
  demoStatusTitle: {
    fontSize: 15,
    fontFamily: "DMSans-Bold",
    color: theme.semanticColors.text,
    marginBottom: 6,
  },
  demoStatusText: {
    fontSize: 13,
    fontFamily: "DMSans-Regular",
    color: "rgba(255, 255, 255, 0.72)",
    lineHeight: 20,
  },
  demoStatusBadge: {
    minHeight: 30,
    borderRadius: 15,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
  },
  demoStatusBadgeText: {
    fontSize: 12,
    fontFamily: "DMSans-Bold",
    color: theme.colors.neutral.white,
  },
  demoSwitchGroup: {
    marginTop: 12,
    padding: 4,
    borderRadius: 16,
    backgroundColor: "rgba(15, 8, 20, 0.62)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    flexDirection: "row",
    gap: 4,
  },
  demoSwitchButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  demoSwitchButtonActive: {
    backgroundColor: theme.semanticColors.primary,
  },
  demoSwitchButtonText: {
    fontSize: 13,
    fontFamily: "DMSans-Bold",
    color: "rgba(255, 255, 255, 0.72)",
  },
  demoSwitchButtonTextActive: {
    color: theme.colors.neutral.white,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "DMSans-Medium",
    color: "rgba(255, 255, 255, 0.75)",
    marginTop: 16,
  },
  emptyProfilePanel: {
    width: "100%",
    maxWidth: 320,
    paddingLeft: 18,
    paddingVertical: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderLeftWidth: 3,
    borderLeftColor: theme.semanticColors.secondary,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 19,
    fontFamily: "DMSans-Bold",
    color: "rgba(255, 255, 255, 0.85)",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    color: "rgba(255, 255, 255, 0.72)",
    lineHeight: 21,
    textAlign: "center",
  },
  retryBtn: {
    backgroundColor: theme.semanticColors.secondary,
    minHeight: 44,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  retryText: {
    fontSize: 16,
    fontFamily: "DMSans-Bold",
    color: theme.colors.neutral.white,
  },
}));
