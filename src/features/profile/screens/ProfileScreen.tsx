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
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { supabase } from "@/src/config/supabase";
import { accountApi } from "@/src/features/account/api/accountApi";
import { UserType } from "@/src/features/auth/api/authApi";
import { useProfileStore } from "@/src/stores/profileStore";
import { ProfileHeader } from "../components/ProfileHeader";
import {
  ProfileMenuList,
  getDefaultMenuItems,
} from "../components/ProfileMenuList";

// Brand Colors
const BRAND_BG = "#0F0814";
const ACCENT_PURPLE = "#8D69F6";
const ACCENT_PINK = "#EF3E78";
const WHITE = "#FFFFFF";

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
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Zustand store
  const { setProfile, clearProfile } = useProfileStore();

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
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
  }, [router, setProfile]);

  // Handle menu item press
  const handleMenuItemPress = (route: string) => {
    router.push(route as any);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
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

  // Loading state
  if (loading) {
    return (
      <View style={[styles.root, styles.centerContent]}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={BRAND_BG}
          translucent={false}
        />
        {Platform.OS === "ios" && (
          <View style={{ height: insets.top, backgroundColor: BRAND_BG }} />
        )}
        <LinearGradient
          colors={[BRAND_BG, "#1A0F1F", "#2D1B35", BRAND_BG]}
          locations={[0, 0.3, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator
          size="large"
          color={ACCENT_PINK}
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
          backgroundColor={BRAND_BG}
          translucent={false}
        />
        {Platform.OS === "ios" && (
          <View style={{ height: insets.top, backgroundColor: BRAND_BG }} />
        )}
        <LinearGradient
          colors={[BRAND_BG, "#1A0F1F", "#2D1B35", BRAND_BG]}
          locations={[0, 0.3, 0.7, 1]}
          style={StyleSheet.absoluteFill}
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
  const menuItems = getDefaultMenuItems();

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

      {/* Brand gradient background */}
      <LinearGradient
        colors={[BRAND_BG, "#1A0F1F", "#2D1B35", BRAND_BG]}
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
            style={styles.settingsBtn}
            activeOpacity={0.78}
            accessibilityRole="button"
            accessibilityLabel="Open profile preferences"
            accessibilityHint="Opens match preference settings"
          >
            <Settings size={28} color={ACCENT_PURPLE} />
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND_BG,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
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
    color: WHITE,
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
    borderLeftColor: ACCENT_PURPLE,
    backgroundColor: "rgba(141, 105, 246, 0.08)",
  },
  profileStatusTitle: {
    fontSize: 15,
    fontFamily: "DMSans-Bold",
    color: WHITE,
    marginBottom: 6,
  },
  profileStatusText: {
    fontSize: 13,
    fontFamily: "DMSans-Regular",
    color: "rgba(255, 255, 255, 0.72)",
    lineHeight: 20,
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
    borderLeftColor: ACCENT_PURPLE,
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
    backgroundColor: ACCENT_PURPLE,
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
    color: WHITE,
  },
});
