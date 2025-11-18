// app/(tabs)/profile.tsx
import { supabase } from "@/src/config/supabase";
import { accountApi } from "@/src/features/account/api/accountApi";
import { UserType } from "@/src/features/auth/api/authApi";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    Bell,
    ChevronRight,
    Edit,
    HelpCircle,
    Info,
    Lock,
    LogOut,
    MapPin,
    Settings,
    SlidersHorizontal,
    Sparkles,
    User,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");
const isSmallDevice = width < 375;

/** Brand tokens */
const BRAND_BG = "#0F0814";
const ACCENT_PURPLE = "#8D69F6";
const ACCENT_PINK = "#EF3E78";
const VERIFIED_GREEN = "#10B981";
const WARNING_YELLOW = "#F59E0B";
const WHITE = "#FFFFFF";

/** Derived surfaces and borders */
const SURFACE_STRONG = "rgba(255, 255, 255, 0.08)";
const TILE_BORDER = "rgba(168, 85, 247, 0.13)";
const DANGER_BG = "rgba(239, 62, 120, 0.12)";

type ProfileData = {
  firstName: string;
  lastName: string;
  age: number;
  userType: UserType;
  location: string;
  photoUri: string | null;
  isVerified: boolean;
};

export default function Profile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile data
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
        const { data: profile, error } = await supabase
          .from("profiles")
          .select(
            "id, email, first_name, last_name, age, user_type, gender, location_name, photos, is_verified"
          )
          .eq("id", userId)
          .single();

        if (error) {
          console.error("❌ Failed to fetch profile:", error);
          setLoading(false);
          return;
        }

        if (profile) {
          console.log("✅ Profile loaded:", profile);
          
          // Parse photos array
          const photosArray = profile.photos || [];
          const firstPhoto = photosArray.length > 0 ? photosArray[0] : null;

          setProfileData({
            firstName: profile.first_name || "Unknown",
            lastName: profile.last_name || "",
            age: profile.age || 0,
            userType: profile.user_type as UserType,
            location: profile.location_name || "Unknown Location",
            photoUri: firstPhoto,
            isVerified: profile.is_verified || false,
          });
        }
      } catch (error) {
        console.error("❌ Failed to fetch profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const profileOptions: { title: string; icon: React.ReactNode; route: string }[] = [
    { title: "Edit Profile", icon: <Edit size={22} color={ACCENT_PURPLE} />, route: "/(main)/profile-settings/edit" },
    {
      title: "Preferences",
      icon: <SlidersHorizontal size={22} color={ACCENT_PURPLE} />,
      route: "/(main)/profile-settings/preferences",
    },
    { title: "Privacy", icon: <Lock size={22} color={ACCENT_PURPLE} />, route: "/(main)/profile-settings/privacy" },
    { title: "Notifications", icon: <Bell size={22} color={ACCENT_PURPLE} />, route: "/(main)/profile-settings/notifications" },
    {
      title: "Help & Support",
      icon: <HelpCircle size={22} color={ACCENT_PURPLE} />,
      route: "/(main)/profile-settings/help",
    },
    { title: "About", icon: <Info size={22} color={ACCENT_PURPLE} />, route: "/(main)/profile-settings/about" },
  ];

  const handleLogout = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear local profile data
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

  const formatUserType = (type: UserType): string => {
    return type === "filipina" ? "Filipina" : "Foreigner";
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

        {/* Avatar and user info */}
        <View style={styles.profileTop}>
          <View style={styles.avatarWrap}>
            {profileData.photoUri ? (
              <Image
                source={{ uri: profileData.photoUri }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={48} color={ACCENT_PINK} strokeWidth={2} />
              </View>
            )}
          </View>

          <Text style={styles.name}>
            {profileData.firstName} {profileData.lastName}
          </Text>

          {/* Age and User Type */}
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>{profileData.age} years old</Text>
            <View style={styles.infoDot} />
            <Text style={styles.infoText}>
              {formatUserType(profileData.userType)}
            </Text>
          </View>

          {/* Location row */}
          <View style={styles.locationRow}>
            <MapPin size={16} color={ACCENT_PINK} strokeWidth={2.5} />
            <Text style={styles.locationText}>{profileData.location}</Text>
          </View>

          {/* Verification badge */}
          {profileData.isVerified ? (
            <View style={styles.verifiedPill}>
              <Sparkles size={12} color={WHITE} strokeWidth={2.5} />
              <Text style={styles.verifiedText}>VERIFIED</Text>
            </View>
          ) : (
            <View style={styles.unverifiedPill}>
              <Text style={styles.unverifiedText}>NOT VERIFIED</Text>
            </View>
          )}
        </View>

        {/* Options list */}
        <View style={styles.listWrap}>
          {profileOptions.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.listItem}
              activeOpacity={0.75}
              onPress={() => router.push(item.route as any)}
            >
              <View style={{ marginRight: 16 }}>{item.icon}</View>
              <Text style={styles.listItemText}>{item.title}</Text>
              <ChevronRight size={20} color={ACCENT_PURPLE} />
            </TouchableOpacity>
          ))}

          {/* Logout */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <LogOut size={20} color={ACCENT_PINK} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: Math.max(insets.bottom, 20) }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND_BG,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
    fontFamily: "DMSans-Medium",
  },
  errorText: {
    fontSize: 18,
    color: "rgba(255,255,255,0.85)",
    fontFamily: "DMSans-Medium",
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: ACCENT_PINK,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: WHITE,
    fontSize: 16,
    fontFamily: "DMSans-Bold",
  },

  header: {
    paddingTop: Platform.OS === "ios" ? 16 : 20,
    paddingBottom: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontSize: isSmallDevice ? 28 : 32,
    color: ACCENT_PINK,
    fontFamily: "Lora-Bold",
    letterSpacing: 1,
    textShadowColor: "rgba(239, 62, 120, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  profileTop: {
    alignItems: "center",
    marginTop: 6,
    marginBottom: 24,
    paddingHorizontal: 24,
  },

  avatarWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: ACCENT_PINK,
    backgroundColor: "rgba(239, 62, 120, 0.1)",
    marginBottom: 16,
  },

  avatar: {
    width: "100%",
    height: "100%",
  },

  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(239, 62, 120, 0.15)",
  },

  name: {
    color: WHITE,
    fontSize: 24,
    fontFamily: "Lora-Bold",
    letterSpacing: 0.4,
    textShadowColor: "rgba(141, 105, 246, 0.7)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 6,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },

  infoText: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 14,
    fontFamily: "DMSans-Medium",
  },

  infoDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: ACCENT_PURPLE,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },

  locationText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 15,
    fontFamily: "DMSans-Medium",
    letterSpacing: 0.2,
  },

  verifiedPill: {
    marginTop: 12,
    backgroundColor: VERIFIED_GREEN,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 2,
    borderColor: WHITE,
  },

  verifiedText: {
    fontSize: 10,
    fontFamily: "DMSans-Bold",
    color: WHITE,
    letterSpacing: 1,
  },

  unverifiedPill: {
    marginTop: 12,
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: WARNING_YELLOW,
  },

  unverifiedText: {
    fontSize: 10,
    fontFamily: "DMSans-Bold",
    color: WARNING_YELLOW,
    letterSpacing: 1,
  },

  listWrap: {
    paddingHorizontal: 24,
  },

  listItem: {
    backgroundColor: SURFACE_STRONG,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: TILE_BORDER,
  },

  listItemText: {
    color: WHITE,
    fontSize: 16,
    fontFamily: "DMSans-SemiBold",
    letterSpacing: 0.2,
    flex: 1,
  },

  logoutBtn: {
    backgroundColor: DANGER_BG,
    borderRadius: 18,
    padding: 18,
    marginTop: 8,
    marginBottom: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: ACCENT_PINK,
    gap: 10,
  },

  logoutText: {
    color: ACCENT_PINK,
    fontSize: 16,
    fontFamily: "DMSans-Bold",
    marginLeft: 8,
  },
});
