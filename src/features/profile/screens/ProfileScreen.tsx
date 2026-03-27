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
interface ProfileData {
  firstName: string;
  lastName: string;
  age: number;
  userType: UserType;
  location: string;
  photoUri: string | null;
  isVerified: boolean;
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
  const { profile, setProfile, clearProfile } = useProfileStore();

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Get current session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          console.log("❌ No session found");
          setLoading(false);
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
          console.error("❌ Failed to fetch profile:", error);
          setLoading(false);
          return;
        }

        if (profileFromDB) {
          console.log("✅ Profile loaded:", profileFromDB);

          // Parse photos array
          const photosArray = profileFromDB.photos || [];
          const firstPhoto = photosArray.length > 0 ? photosArray[0] : null;

          const data: ProfileData = {
            firstName: profileFromDB.first_name || "Unknown",
            lastName: profileFromDB.last_name || "",
            age: profileFromDB.age || 0,
            userType: profileFromDB.user_type as UserType,
            location: profileFromDB.location_name || "Unknown Location",
            photoUri: firstPhoto,
            isVerified: profileFromDB.is_verified || false,
          };

          // Update local state
          setProfileData(data);

          // Update Zustand store
          setProfile({
            id: profileFromDB.id,
            firstName: data.firstName,
            lastName: data.lastName,
            age: data.age,
            location: data.location,
            photos: photosArray,
            isVerified: data.isVerified,
          });
        }
      } catch (error) {
        console.error("❌ Failed to fetch profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [setProfile]);

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

      // Navigate to welcome screen
      router.replace("/(auth)/welcome");
    } catch (error) {
      console.error("❌ Error during logout:", error);
      // Still navigate to welcome even if there's an error
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
        <ActivityIndicator size="large" color={ACCENT_PINK} />
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
            accessibilityRole="button"
            accessibilityLabel="Settings"
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
  loadingText: {
    fontSize: 16,
    fontFamily: "DMSans-Medium",
    color: "rgba(255, 255, 255, 0.75)",
    marginTop: 16,
  },
  errorText: {
    fontSize: 18,
    fontFamily: "DMSans-Bold",
    color: "rgba(255, 255, 255, 0.85)",
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: ACCENT_PURPLE,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
  },
  retryText: {
    fontSize: 16,
    fontFamily: "DMSans-Bold",
    color: WHITE,
  },
});
