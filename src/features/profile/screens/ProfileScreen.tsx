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
import { useRouter } from "expo-router";
import { Settings } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { accountApi } from "@/src/features/account/api/accountApi";
import { UserType } from "@/src/features/auth/api/authApi";
import { useProfileStore } from "@/src/stores/profileStore";
import { theme, useTheme, withAlpha } from "@/src/theme";
import { useProfileScreen } from "../hooks/useProfileScreen";
import { ProfileHeader } from "../components/ProfileHeader";
import { ProfilePreferencesCard } from "../components/ProfilePreferencesCard";
import {
    ProfileMenuList,
    getDefaultMenuItems,
} from "../components/ProfileMenuList";

const TEST_GUEST_PROFILE: ProfileData = {
  firstName: "Guest",
  lastName: "Tester",
  age: 25,
  userType: "foreigner",
  location: "Preview Mode",
  photoUri: null,
  isVerified: false,
  interestedIn: null,
  relationshipGoal: null,
  ageMin: null,
  ageMax: null,
  maxDistanceKm: null,
};

/**
 * Profile data interface
 */
interface ProfileData {
  firstName: string;
  lastName: string;
  age: number;
  userType: UserType;
  location: string;
  photoUri: string | null;
  isVerified: boolean;
  interestedIn: string | null;
  relationshipGoal: string | null;
  ageMin: number | null;
  ageMax: number | null;
  maxDistanceKm: number | null;
}

/**
 * ProfileScreen Component
 *
 * Displays user profile with settings menu.
 * Integrates with Zustand for global state.
 */
export const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  // Zustand store
  const { setProfile, clearProfile } = useProfileStore();

  // Data hook — replaces the inline supabase calls (A3 compliance).
  const { profileRow, loading, signOut } = useProfileScreen();

  // Derive local ProfileData from the query result, mirroring the exact
  // mapping that previously lived in the inline useEffect.
  useEffect(() => {
    if (loading) return;

    if (!profileRow) {
      // No active session — show guest profile (TEMP TEST BYPASS).
      setProfileData(TEST_GUEST_PROFILE);
      return;
    }

    const photosArray = profileRow.photos || [];
    const firstPhoto = photosArray.length > 0 ? photosArray[0] : null;

    const data: ProfileData = {
      firstName: profileRow.first_name || "Unknown",
      lastName: profileRow.last_name || "",
      age: profileRow.age || 0,
      userType: profileRow.user_type as UserType,
      location: profileRow.location_name || "Unknown Location",
      photoUri: firstPhoto,
      isVerified: profileRow.is_verified || false,
      interestedIn: profileRow.interested_in ?? null,
      relationshipGoal: profileRow.relationship_goal ?? null,
      ageMin: profileRow.age_min ?? null,
      ageMax: profileRow.age_max ?? null,
      maxDistanceKm: profileRow.max_distance_km ?? null,
    };

    setProfileData(data);

    // Update Zustand store
    setProfile({
      id: profileRow.id,
      firstName: data.firstName,
      lastName: data.lastName,
      age: data.age,
      location: data.location,
      photos: photosArray,
      isVerified: data.isVerified,
    });
  }, [profileRow, loading, setProfile]);

  // Handle menu item press
  const handleMenuItemPress = (route: string) => {
    router.push(route as any);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      // Sign out via the api layer (A3: no supabase import in screen).
      await signOut();

      // Clear Zustand store
      clearProfile();

      // Clear local storage
      accountApi.clearBasicInfo();
      accountApi.clearLocation();
      accountApi.clearPreferences();
      accountApi.clearVerification();

      // After sign-out, return to the auth entry (welcome → sign in).
      router.replace("/(auth)/welcome");
    } catch (error) {
      if (__DEV__) {
        console.error("❌ Error during logout:", error);
      }
      // Even if sign-out errored, send the user back to the auth entry.
      router.replace("/(auth)/welcome");
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.root, styles.centerContent]}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.brandBackground}
          translucent={false}
        />
        {insets.top > 0 && (
          <View style={{ height: insets.top, backgroundColor: colors.brandBackground }} />
        )}
        <LinearGradient
          colors={[
            colors.brandBackground,
            withAlpha(colors.secondaryDark, 0.32),
            withAlpha(colors.primaryDark, 0.24),
            colors.brandBackground,
          ]}
          locations={[0, 0.3, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  // No profile data
  if (!profileData) {
    return (
      <View style={[styles.root, styles.centerContent]}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.brandBackground}
          translucent={false}
        />
        {insets.top > 0 && (
          <View style={{ height: insets.top, backgroundColor: colors.brandBackground }} />
        )}
        <LinearGradient
          colors={[
            colors.brandBackground,
            withAlpha(colors.secondaryDark, 0.32),
            withAlpha(colors.primaryDark, 0.24),
            colors.brandBackground,
          ]}
          locations={[0, 0.3, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.errorText}>Profile not found</Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => router.replace("/(auth)/welcome")}
        >
          <Text style={styles.retryText}>Go to Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Menu items
  const menuItems = getDefaultMenuItems();

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.brandBackground}
        translucent={false}
      />
      {insets.top > 0 && (
        <View style={{ height: insets.top, backgroundColor: colors.brandBackground }} />
      )}

      {/* Brand gradient background */}
      <LinearGradient
        colors={[
          colors.brandBackground,
          withAlpha(colors.secondaryDark, 0.32),
          withAlpha(colors.primaryDark, 0.24),
          colors.brandBackground,
        ]}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
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
            style={styles.settingsButton}
            hitSlop={theme.hitSlop.sm}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <Settings
              size={theme.iconSizes.feature}
              color={colors.secondary}
              strokeWidth={theme.strokeWidths.default}
            />
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

        {/* Saved match preferences */}
        <ProfilePreferencesCard
          interestedIn={profileData.interestedIn}
          relationshipGoal={profileData.relationshipGoal}
          ageMin={profileData.ageMin}
          ageMax={profileData.ageMax}
          maxDistanceKm={profileData.maxDistanceKm}
        />

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

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.brandBackground,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.screen,
    paddingTop: theme.spacing.field,
    paddingBottom: theme.spacing.related,
  },
  title: {
    fontSize: 32,
    fontFamily: "DMSans-Bold",
    color: colors.onPrimary,
    letterSpacing: 0,
  },
  settingsButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: theme.componentSizes.iconButton,
    minWidth: theme.componentSizes.iconButton,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "DMSans-Medium",
    color: withAlpha(colors.onPrimary, 0.75),
    marginTop: 16,
  },
  errorText: {
    fontSize: 18,
    fontFamily: "DMSans-Bold",
    color: withAlpha(colors.onPrimary, 0.85),
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
  },
  retryText: {
    fontSize: 16,
    fontFamily: "DMSans-Bold",
    color: colors.onSecondary,
  },
});
