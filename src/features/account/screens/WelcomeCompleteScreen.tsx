import UserPreferences from "@/src/components/account/UserPreferences";
import GhostButton from "@/src/components/ui/GhostButton";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import { theme } from "@/src/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  AlertCircle,
  Camera,
  Eye,
  Heart,
  MapPin,
  ShieldCheck,
  Sparkles,
  User,
  Users, // Add this icon for user type
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWelcomeData } from "../hooks/useWelcomeData";

const ACCENT_PURPLE = theme.colors.dalisay?.[500] ?? "#8D69F6";
const ACCENT_PINK = theme.colors.amihan?.[500] ?? "#EF3E78";
const SUCCESS_GREEN = "#10B981";
const GOLD = "#F59E0B";
const WARNING_YELLOW = "#F59E0B";
const WHITE = "#FFFFFF";
const SURFACE = "rgba(255,255,255,0.12)";

export default function WelcomeCompleteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, loading } = useWelcomeData();

  // Then extract the properties from data:
  const basicInfo = data?.basicInfo ?? null;
  const location = data?.location ?? null;
  const preferences = data?.preferences ?? null;
  const verification = data?.verification ?? null;
  const photos = data?.photos ?? [];
  const userType = data?.userType ?? null;

  const handleStartDating = () => {
    router.replace("/(main)");
  };

  const handleExploreApp = () => {
    router.replace("/(main)");
  };

  if (loading) {
    return (
      <View
        style={[
          styles.root,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={ACCENT_PINK} />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  const firstName = basicInfo?.firstName ?? "Friend";
  const lastName = basicInfo?.lastName ?? "";
  const age = basicInfo?.age ?? 0;
  const locationName = location?.locationName ?? "Unknown";
  const interestedIn = preferences?.interestedIn ?? "everyone";
  const relationshipGoal =
    preferences?.relationshipGoal?.replace(/_/g, " ") ?? "Not specified";
  const ageRange = preferences
    ? `${preferences.ageMin} - ${preferences.ageMax}`
    : "18 - 70";
  const distance = preferences?.maxDistanceKm ?? 50;
  const isVerified = verification?.isVerified ?? false;
  const photoCount = photos.length;

  // Format user type for display
  const formatUserType = (type: string | null) => {
    if (!type) return "Not specified";
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  const displayUserType = formatUserType(userType);

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.dalisay[950] ?? "#0F0814"}
      />
      {Platform.OS === "ios" && (
        <View
          style={{
            height: insets.top,
            backgroundColor: theme.colors.dalisay[950] ?? "#0F0814",
          }}
        />
      )}

      <LinearGradient
        colors={[theme.colors.dalisay[950] ?? "#0F0814", "#1A0F1F", "#2D1B35"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom + 24, 40) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoSection}>
          <Image
            source={require("@/assets/logo-no-bg.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Welcome Header */}
        <View style={styles.welcomeContainer}>
          <View style={styles.welcomeHeader}>
            <Sparkles size={24} color={GOLD} fill={GOLD} />
            <Text style={styles.welcomeTitle}>Welcome, {firstName}!</Text>
            <Sparkles size={24} color={GOLD} fill={GOLD} />
          </View>
          <Text style={styles.welcomeSubtitle}>
            Your profile is{" "}
            {isVerified ? "complete and ready to shine!" : "almost complete!"}
          </Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                {photos.length > 0 ? (
                  <Image
                    source={{ uri: photos[0] }}
                    style={StyleSheet.absoluteFill}
                  />
                ) : (
                  <User size={32} color={ACCENT_PINK} strokeWidth={2.5} />
                )}
              </View>
              {photoCount > 0 && (
                <View style={styles.photoBadge}>
                  <Camera size={12} color={WHITE} strokeWidth={2.5} />
                </View>
              )}
            </View>

            <View style={styles.profileHeaderInfo}>
              <Text style={styles.profileName}>
                {firstName} {lastName}
              </Text>
              <View style={styles.profileAgeRow}>
                <Text style={styles.profileAge}>{age} years old</Text>
                {isVerified ? (
                  <View style={styles.verifiedBadge}>
                    <ShieldCheck size={12} color={WHITE} strokeWidth={2.5} />
                    <Text style={styles.verifiedText}>VERIFIED</Text>
                  </View>
                ) : (
                  <View style={styles.unverifiedBadge}>
                    <AlertCircle size={12} color={WHITE} strokeWidth={2.5} />
                    <Text style={styles.unverifiedText}>UNVERIFIED</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <View style={styles.detailIconBox}>
                <MapPin size={18} color={ACCENT_PINK} strokeWidth={2.5} />
              </View>
              <Text style={styles.detailText}>{locationName}</Text>
            </View>

            {/* User Type Detail */}
            <View style={styles.detailItem}>
              <View style={styles.detailIconBox}>
                <Users size={18} color={ACCENT_PINK} strokeWidth={2.5} />
              </View>
              <Text style={styles.detailText}>{displayUserType}</Text>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIconBox}>
                <Heart size={18} color={ACCENT_PINK} strokeWidth={2.5} />
              </View>
              <Text style={styles.detailText}>
                Looking for {interestedIn} • {relationshipGoal}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIconBox}>
                <Eye size={18} color={ACCENT_PINK} strokeWidth={2.5} />
              </View>
              <Text style={styles.detailText}>
                {photoCount} photo{photoCount !== 1 ? "s" : ""} uploaded
              </Text>
            </View>
          </View>
        </View>

        {/* Preferences */}
        {preferences && (
          <UserPreferences
            interestedIn={interestedIn}
            ageRange={ageRange}
            distance={distance}
            relationshipGoal={relationshipGoal}
          />
        )}

        {/* Verification Warning (if not verified) */}
        {!isVerified && (
          <View style={styles.warningBanner}>
            <AlertCircle size={20} color={WARNING_YELLOW} strokeWidth={2.5} />
            <View style={styles.warningTextContainer}>
              <Text style={styles.warningTitle}>Profile Not Verified</Text>
              <Text style={styles.warningSubtitle}>
                Verified profiles get more visibility and trust. You can verify
                anytime in Settings.
              </Text>
            </View>
          </View>
        )}

        {/* Success Banner (if verified) */}
        {isVerified && (
          <View style={styles.successBanner}>
            <Sparkles size={20} color={SUCCESS_GREEN} fill={SUCCESS_GREEN} />
            <View style={styles.successTextContainer}>
              <Text style={styles.successTitle}>Profile Complete!</Text>
              <Text style={styles.successSubtitle}>
                You&apos;re all set to start connecting with amazing Filipino singles
                worldwide!
              </Text>
            </View>
          </View>
        )}

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

      {/* Buttons */}
      <View
        style={[
          styles.buttonContainer,
          { paddingBottom: Math.max(insets.bottom + 16, 32) },
        ]}
      >
        <PrimaryButton title="Start Dating" onPress={handleStartDating} />
        <GhostButton title="Explore the App First" onPress={handleExploreApp} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.dalisay[950] ?? "#0F0814" },
  content: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 32 : 24,
  },
  logoSection: { alignItems: "center", marginBottom: 24 },
  logo: { width: 130, height: 130 },
  welcomeContainer: { alignItems: "center", marginBottom: 24 },
  welcomeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  welcomeTitle: {
    fontSize: 32,
    color: WHITE,
    textAlign: "center",
    fontFamily: theme.fontFamilies.header?.bold,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    lineHeight: 24,
  },
  profileCard: {
    backgroundColor: SURFACE,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(141,105,246,0.25)",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.15)",
  },
  avatarContainer: { position: "relative", marginRight: 16 },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(239,62,120,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: ACCENT_PINK,
    overflow: "hidden",
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
    borderColor: theme.colors.dalisay[950],
  },
  profileHeaderInfo: { flex: 1 },
  profileName: {
    fontSize: 24,
    color: WHITE,
    marginBottom: 6,
    fontFamily: theme.fontFamilies.header?.bold,
  },
  profileAgeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  profileAge: { fontSize: 15, color: "rgba(255,255,255,0.8)" },
  verifiedBadge: {
    backgroundColor: SUCCESS_GREEN,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  verifiedText: { fontSize: 10, color: WHITE, fontWeight: "bold" },
  unverifiedBadge: {
    backgroundColor: WARNING_YELLOW,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  unverifiedText: { fontSize: 10, color: WHITE, fontWeight: "bold" },
  detailsContainer: { gap: 14 },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: 14,
    borderRadius: 14,
  },
  detailIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(239,62,120,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  detailText: { flex: 1, fontSize: 14, color: "rgba(255,255,255,0.9)" },
  warningBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(245,158,11,0.15)",
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    marginTop: 20,
    borderWidth: 1.5,
    borderColor: "rgba(245,158,11,0.3)",
    gap: 12,
  },
  warningTextContainer: { flex: 1 },
  warningTitle: {
    fontSize: 16,
    color: WHITE,
    marginBottom: 6,
    fontWeight: "bold",
  },
  warningSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 19,
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(16,185,129,0.15)",
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    marginTop: 20,
    borderWidth: 1.5,
    borderColor: "rgba(16,185,129,0.3)",
    gap: 12,
  },
  successTextContainer: { flex: 1 },
  successTitle: {
    fontSize: 16,
    color: WHITE,
    marginBottom: 6,
    fontWeight: "bold",
  },
  successSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 19,
  },
  statsContainer: { alignItems: "center", marginBottom: 16 },
  statsText: {
    fontSize: 14,
    color: ACCENT_PURPLE,
    textAlign: "center",
    marginBottom: 4,
    fontWeight: "600",
  },
  statsSubtext: {
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 14,
    backgroundColor: "rgba(15,8,20,0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(141,105,246,0.15)",
  },
  loadingText: { marginTop: 16, fontSize: 16, color: "rgba(255,255,255,0.85)" },
});
