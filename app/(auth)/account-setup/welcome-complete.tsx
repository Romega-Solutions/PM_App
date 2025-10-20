// app/(auth)/welcome-complete.tsx
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Camera,
  Eye,
  Heart,
  MapPin,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react-native";
import React from "react";
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PrimaryButton from "../../../src/components/ui/PrimaryButton";
import SecondaryButton from "../../../src/components/ui/SecondaryButton";

const { width, height } = Dimensions.get("window");

// Brand Colors
const BRAND_BG = "#0F0814";
const ACCENT_PURPLE = "#8D69F6";
const ACCENT_PINK = "#EF3E78";
const SUCCESS_GREEN = "#10B981";
const GOLD = "#F59E0B";
const WHITE = "#FFFFFF";
const SURFACE = "rgba(255,255,255,0.12)";
const SURFACE_BORDER = "rgba(141,105,246,0.25)";

// Responsive sizing
const LOGO_SIZE = Math.min(width * 0.32, 130);
const AVATAR_SIZE = Platform.OS === "ios" ? 70 : 66;

interface UserData {
  firstName: string;
  lastName: string;
  age: number;
  location: string;
  interestedIn: string;
  relationship: string;
  photos: number;
  verified: boolean;
}

interface ProfileDetailItemProps {
  icon: React.ReactNode;
  text: string;
}

const ProfileDetailItem: React.FC<ProfileDetailItemProps> = ({
  icon,
  text,
}) => (
  <View style={styles.detailItem}>
    <View style={styles.detailIconBox}>{icon}</View>
    <Text style={styles.detailText} numberOfLines={2}>
      {text}
    </Text>
  </View>
);

export default function WelcomeComplete() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Sample user data - in real app this would come from previous steps/database
  const userData: UserData = {
    firstName: "Maria",
    lastName: "Santos",
    age: 26,
    location: "Manila, Philippines",
    interestedIn: "Men",
    relationship: "Long-term relationship",
    photos: 4,
    verified: true,
  };

  const handleStartDating = () => {
    router.replace("/(main)");
  };

  const handleExploreApp = () => {
    router.replace("/(main)");
  };

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

      {/* Background Gradient */}
      <LinearGradient
        colors={[BRAND_BG, "#1A0F1F", "#2D1B35", BRAND_BG]}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 24, 40) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo Header */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../../assets/logo-no-bg.png")}
              style={[styles.logo, { width: LOGO_SIZE, height: LOGO_SIZE }]}
              resizeMode="contain"
            />
          </View>

          {/* Welcome Message */}
          <View style={styles.welcomeContainer}>
            <View style={styles.welcomeHeader}>
              <Sparkles size={24} color={GOLD} fill={GOLD} />
              <Text style={styles.welcomeTitle}>
                Welcome, {userData.firstName}!
              </Text>
              <Sparkles size={24} color={GOLD} fill={GOLD} />
            </View>

            <Text style={styles.welcomeSubtitle}>
              Your profile is complete and ready to shine!
            </Text>
          </View>
        </View>

        {/* Profile Summary Card */}
        <View style={styles.profileCard}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View
                style={[
                  styles.avatar,
                  {
                    width: AVATAR_SIZE,
                    height: AVATAR_SIZE,
                    borderRadius: AVATAR_SIZE / 2,
                  },
                ]}
              >
                <User size={32} color={ACCENT_PINK} strokeWidth={2.5} />
              </View>
              {userData.photos > 0 && (
                <View style={styles.photoBadge}>
                  <Camera size={12} color={WHITE} strokeWidth={2.5} />
                </View>
              )}
            </View>

            <View style={styles.profileHeaderInfo}>
              <Text style={styles.profileName}>
                {userData.firstName} {userData.lastName}
              </Text>
              <View style={styles.profileAgeRow}>
                <Text style={styles.profileAge}>{userData.age} years old</Text>
                {userData.verified && (
                  <View style={styles.verifiedBadge}>
                    <ShieldCheck size={12} color={WHITE} strokeWidth={2.5} />
                    <Text style={styles.verifiedText}>VERIFIED</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Profile Details */}
          <View style={styles.detailsContainer}>
            <ProfileDetailItem
              icon={<MapPin size={18} color={ACCENT_PINK} strokeWidth={2.5} />}
              text={userData.location}
            />

            <ProfileDetailItem
              icon={<Heart size={18} color={ACCENT_PINK} strokeWidth={2.5} />}
              text={`Looking for ${userData.interestedIn.toLowerCase()} • ${userData.relationship}`}
            />

            <ProfileDetailItem
              icon={<Eye size={18} color={ACCENT_PINK} strokeWidth={2.5} />}
              text={`${userData.photos} photo${userData.photos !== 1 ? "s" : ""} uploaded`}
            />
          </View>
        </View>

        {/* Success Banner */}
        <View style={styles.successBanner}>
          <Sparkles size={20} color={SUCCESS_GREEN} fill={SUCCESS_GREEN} />
          <View style={styles.successTextContainer}>
            <Text style={styles.successTitle}>Profile Complete!</Text>
            <Text style={styles.successSubtitle}>
              You're all set to start connecting with amazing Filipino singles
              worldwide!
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            Join 50,000+ verified Filipino singles
          </Text>
          <Text style={styles.statsSubtext}>
            Ready to find meaningful connections
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View
        style={[
          styles.buttonContainer,
          { paddingBottom: Math.max(insets.bottom + 16, 32) },
        ]}
      >
        <PrimaryButton
          title="Start Dating"
          onPress={handleStartDating}
          accessibilityLabel="Start dating on PinayMate"
          accessibilityHint="Begin browsing and matching with other users"
          icon={<Heart size={20} color={WHITE} fill={WHITE} strokeWidth={2} />}
        />

        <SecondaryButton
          title="Explore the App First"
          variant="white"
          onPress={handleExploreApp}
          accessibilityLabel="Explore app features first"
          accessibilityHint="Browse the app without starting to match"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND_BG,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 32 : 24,
  },

  // Logo Section
  logoSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: ACCENT_PINK,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 30,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  logo: {
    // Dynamic size applied inline
  },

  // Welcome
  welcomeContainer: {
    alignItems: "center",
  },
  welcomeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  welcomeTitle: {
    fontSize: Platform.OS === "ios" ? 32 : 30,
    fontFamily: "Lora-Bold",
    color: WHITE,
    textAlign: "center",
    letterSpacing: 0.4,
    ...Platform.select({
      ios: {
        textShadowColor: "rgba(0, 0, 0, 0.6)",
        textShadowOffset: { width: 0, height: 3 },
        textShadowRadius: 10,
      },
    }),
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontFamily: "DMSans-Regular",
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
    letterSpacing: 0.2,
  },

  // Profile Card
  profileCard: {
    backgroundColor: SURFACE,
    borderRadius: 24,
    padding: Platform.OS === "ios" ? 24 : 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: SURFACE_BORDER,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  // Profile Header
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.15)",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    backgroundColor: "rgba(239, 62, 120, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: ACCENT_PINK,
    ...Platform.select({
      ios: {
        shadowColor: ACCENT_PINK,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  photoBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: ACCENT_PURPLE,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: BRAND_BG,
  },
  profileHeaderInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: Platform.OS === "ios" ? 24 : 22,
    fontFamily: "Lora-Bold",
    color: WHITE,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  profileAgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  profileAge: {
    fontSize: 15,
    fontFamily: "DMSans-Regular",
    color: "rgba(255, 255, 255, 0.8)",
    letterSpacing: 0.2,
  },
  verifiedBadge: {
    backgroundColor: SUCCESS_GREEN,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    ...Platform.select({
      ios: {
        shadowColor: SUCCESS_GREEN,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  verifiedText: {
    fontSize: 10,
    fontFamily: "DMSans-Bold",
    color: WHITE,
    letterSpacing: 0.5,
  },

  // Details
  detailsContainer: {
    gap: 14,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    padding: 14,
    borderRadius: 14,
  },
  detailIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(239, 62, 120, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    color: "rgba(255, 255, 255, 0.9)",
    letterSpacing: 0.2,
    lineHeight: 20,
  },

  // Success Banner
  successBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderRadius: 18,
    padding: Platform.OS === "ios" ? 20 : 18,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: "rgba(16, 185, 129, 0.3)",
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: SUCCESS_GREEN,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  successTextContainer: {
    flex: 1,
  },
  successTitle: {
    fontSize: 16,
    fontFamily: "Lora-Bold",
    color: WHITE,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  successSubtitle: {
    fontSize: 13,
    fontFamily: "DMSans-Regular",
    color: "rgba(255, 255, 255, 0.85)",
    lineHeight: 19,
    letterSpacing: 0.2,
  },

  // Stats
  statsContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  statsText: {
    fontSize: 14,
    fontFamily: "DMSans-SemiBold",
    color: ACCENT_PURPLE,
    textAlign: "center",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  statsSubtext: {
    fontSize: 13,
    fontFamily: "DMSans-Regular",
    color: "rgba(255, 255, 255, 0.65)",
    textAlign: "center",
    letterSpacing: 0.2,
  },

  // Buttons
  buttonContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 14,
    backgroundColor: "rgba(15, 8, 20, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(141, 105, 246, 0.15)",
  },
});
