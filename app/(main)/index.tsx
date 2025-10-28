// app/(tabs)/index.tsx
import { accountApi } from "@/src/features/account/api/accountApi";
import { UserType } from "@/src/features/auth/api/authApi";
import { LinearGradient } from "expo-linear-gradient";
import { Heart, Info, MapPin, Sparkles, Star, X } from "lucide-react-native";
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

// Brand Colors
const BRAND_BG = "#0F0814";
const ACCENT_PURPLE = "#8D69F6";
const ACCENT_PINK = "#EF3E78";
const VERIFIED_GREEN = "#10B981";
const SUPER_LIKE_GOLD = "#F59E0B";
const WHITE = "#FFFFFF";

// Profile type
type Profile = {
  id: string;
  name: string;
  age: number;
  location: string;
  distance: string;
  image: any;
  verified: boolean;
  interests: string[];
  bio: string;
  gender: "female" | "male";
};

// Filipina profiles (for foreign men)
const filipinaProfiles: Profile[] = [
  {
    id: "1",
    name: "Maria",
    age: 25,
    location: "Manila, Philippines",
    distance: "2 km away",
    image: require("../../assets/girls/ai1.jpg"),
    verified: true,
    interests: ["Travel", "Photography", "Food"],
    bio: "Love traveling and exploring new cultures. Looking for genuine connections and meaningful conversations.",
    gender: "female",
  },
  {
    id: "2",
    name: "Angel",
    age: 23,
    location: "Cebu City, Philippines",
    distance: "5 km away",
    image: require("../../assets/girls/ai2.jpg"),
    verified: true,
    interests: ["Photography", "Adventure", "Music"],
    bio: "Passionate about photography and adventure. Let's create memories together!",
    gender: "female",
  },
  {
    id: "3",
    name: "Jessa",
    age: 27,
    location: "Davao, Philippines",
    distance: "12 km away",
    image: require("../../assets/girls/ai3.jpg"),
    verified: true,
    interests: ["Reading", "Coffee", "Art"],
    bio: "Coffee lover and bookworm. Seeking someone who shares my love for deep conversations.",
    gender: "female",
  },
  {
    id: "4",
    name: "Kim",
    age: 24,
    location: "Quezon City, Philippines",
    distance: "8 km away",
    image: require("../../assets/girls/ai4.jpg"),
    verified: true,
    interests: ["Fitness", "Cooking", "Yoga"],
    bio: "Fitness enthusiast and foodie. Balance is key in life and relationships.",
    gender: "female",
  },
  {
    id: "5",
    name: "Liza",
    age: 26,
    location: "Baguio, Philippines",
    distance: "150 km away",
    image: require("../../assets/girls/ai5.jpg"),
    verified: true,
    interests: ["Art", "Nature", "Painting"],
    bio: "Artist and nature lover. Looking for someone to share beautiful moments with.",
    gender: "female",
  },
  {
    id: "6",
    name: "Bea",
    age: 22,
    location: "Makati, Philippines",
    distance: "3 km away",
    image: require("../../assets/girls/ai6.jpg"),
    verified: true,
    interests: ["Fashion", "Brunch", "Movies"],
    bio: "City girl who loves brunch spots and weekend films.",
    gender: "female",
  },
  {
    id: "7",
    name: "Carla",
    age: 24,
    location: "Pasig, Philippines",
    distance: "6 km away",
    image: require("../../assets/girls/ai7.jpg"),
    verified: true,
    interests: ["Cycling", "Street Food", "Karaoke"],
    bio: "Weekday hustler, weekend rider. Food trips and karaoke nights are my thing.",
    gender: "female",
  },
  {
    id: "8",
    name: "Denise",
    age: 25,
    location: "Taguig, Philippines",
    distance: "4 km away",
    image: require("../../assets/girls/ai8.jpg"),
    verified: true,
    interests: ["Startups", "Coffee", "Podcasts"],
    bio: "Tech and coffee keep me going. Down for cafe hopping and good talks.",
    gender: "female",
  },
];

// Male profiles (for filipinas)
const maleProfiles: Profile[] = [
  {
    id: "9",
    name: "James",
    age: 28,
    location: "New York, USA",
    distance: "12,500 km away",
    image: require("../../assets/girls/ai9.jpg"),
    verified: true,
    interests: ["Travel", "Business", "Fitness"],
    bio: "Entrepreneur who loves exploring new cultures. Looking for meaningful connections.",
    gender: "male",
  },
  {
    id: "10",
    name: "Michael",
    age: 32,
    location: "London, UK",
    distance: "10,800 km away",
    image: require("../../assets/girls/ai10.jpg"),
    verified: true,
    interests: ["Photography", "Adventure", "Cooking"],
    bio: "Adventure seeker and food enthusiast. Let's explore the world together.",
    gender: "male",
  },
  {
    id: "11",
    name: "David",
    age: 30,
    location: "Sydney, Australia",
    distance: "6,200 km away",
    image: require("../../assets/girls/ai11.jpg"),
    verified: true,
    interests: ["Surfing", "Music", "Beach"],
    bio: "Beach lover and music fan. Looking for someone to share sunny days with.",
    gender: "male",
  },
  {
    id: "12",
    name: "Robert",
    age: 35,
    location: "Toronto, Canada",
    distance: "13,000 km away",
    image: require("../../assets/girls/ai12.png"),
    verified: true,
    interests: ["Technology", "Reading", "Hiking"],
    bio: "Tech professional who loves the outdoors. Seeking genuine connections.",
    gender: "male",
  },
  {
    id: "13",
    name: "Thomas",
    age: 29,
    location: "Berlin, Germany",
    distance: "10,500 km away",
    image: require("../../assets/girls/ai13.png"),
    verified: true,
    interests: ["Art", "Coffee", "Museums"],
    bio: "Art lover and coffee enthusiast. Let's discover new places together.",
    gender: "male",
  },
  {
    id: "14",
    name: "Christopher",
    age: 31,
    location: "Dubai, UAE",
    distance: "6,800 km away",
    image: require("../../assets/girls/ai14.png"),
    verified: true,
    interests: ["Business", "Travel", "Luxury"],
    bio: "Business professional who enjoys the finer things. Looking for a partner.",
    gender: "male",
  },
  {
    id: "15",
    name: "Daniel",
    age: 27,
    location: "Singapore",
    distance: "2,400 km away",
    image: require("../../assets/girls/ai15.png"),
    verified: true,
    interests: ["Finance", "Fitness", "Food"],
    bio: "Finance professional who loves staying active and trying new restaurants.",
    gender: "male",
  },
];

export default function Home() {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user type on mount
  useEffect(() => {
    const fetchUserType = async () => {
      try {
        const basicInfo = await accountApi.getBasicInfo();
        setUserType(basicInfo?.userType ?? null);
      } catch (error) {
        console.error("Failed to fetch user type:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserType();
  }, []);

  // Select profiles based on user type
  const profiles = getProfilesForUserType(userType);
  const user = profiles[currentIndex];

  const handleLike = () => {
    setCurrentIndex((prev) => (prev + 1) % profiles.length);
    setShowInfo(false);
  };

  const handlePass = () => {
    setCurrentIndex((prev) => (prev + 1) % profiles.length);
    setShowInfo(false);
  };

  const handleSuperLike = () => {
    setCurrentIndex((prev) => (prev + 1) % profiles.length);
    setShowInfo(false);
  };

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
  if (profiles.length === 0) {
    return (
      <View style={[styles.root, styles.centerContent]}>
        <LinearGradient
          colors={[BRAND_BG, "#1A0F1F", "#2D1B35", BRAND_BG]}
          locations={[0, 0.3, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.emptyText}>No profiles available</Text>
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

      {/* Header with Logo Text */}
      <View style={styles.header}>
        <Text style={styles.logoText}>PinayMate</Text>
      </View>

      {/* Main Card Area */}
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          {/* Profile Image */}
          <View style={styles.imageContainer}>
            <Image
              source={user.image}
              style={styles.profileImage}
              resizeMode="cover"
            />

            {/* Verified Badge */}
            {user.verified && (
              <View style={styles.verifiedBadge}>
                <Sparkles size={12} color={WHITE} strokeWidth={2.5} />
                <Text style={styles.verifiedText}>VERIFIED</Text>
              </View>
            )}

            {/* Info Button */}
            <TouchableOpacity
              style={[styles.infoBtn, showInfo && styles.infoBtnActive]}
              onPress={() => setShowInfo(!showInfo)}
              accessibilityRole="button"
              accessibilityLabel={
                showInfo ? "Hide profile details" : "View profile details"
              }
            >
              <Info
                size={20}
                color={showInfo ? ACCENT_PURPLE : WHITE}
                strokeWidth={2.5}
              />
            </TouchableOpacity>

            {/* Gradient Overlay */}
            <LinearGradient
              colors={["transparent", "rgba(0, 0, 0, 0.95)"]}
              style={styles.gradientOverlay}
            />
          </View>

          {/* Profile Info - Scrollable */}
          <ScrollView
            style={styles.profileInfoScroll}
            contentContainerStyle={styles.profileInfo}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.nameContainer}>
              <Text style={styles.nameText}>
                {user.name}, {user.age}
              </Text>
            </View>

            {/* Location */}
            <View style={styles.locationRow}>
              <MapPin size={16} color={ACCENT_PINK} strokeWidth={2.5} />
              <Text style={styles.locationText}>{user.location}</Text>
            </View>

            <View style={styles.distanceRow}>
              <View style={styles.distanceDot} />
              <Text style={styles.distanceText}>{user.distance}</Text>
            </View>

            {/* Interests Tags - Always Visible */}
            <View style={styles.interestsContainer}>
              {user.interests.map((interest, idx) => (
                <View key={idx} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>

            {/* Bio - Always Visible when info toggled */}
            {showInfo && (
              <View style={styles.bioContainer}>
                <Text style={styles.bioLabel}>About</Text>
                <Text style={styles.bioText}>{user.bio}</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {/* Pass Button */}
          <TouchableOpacity
            style={[styles.actionBtn, styles.passBtn]}
            onPress={handlePass}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Pass"
          >
            <X size={32} color={ACCENT_PINK} strokeWidth={2.5} />
          </TouchableOpacity>

          {/* Super Like Button */}
          <TouchableOpacity
            style={[styles.actionBtn, styles.superLikeBtn]}
            onPress={handleSuperLike}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Super like"
          >
            <Star
              size={28}
              color={SUPER_LIKE_GOLD}
              fill={SUPER_LIKE_GOLD}
              strokeWidth={2}
            />
          </TouchableOpacity>

          {/* Like Button */}
          <TouchableOpacity
            style={[styles.actionBtn, styles.likeBtn]}
            onPress={handleLike}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Like"
          >
            <Heart size={36} color={WHITE} fill={WHITE} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom spacing for safe area */}
      <View style={{ height: Math.max(insets.bottom, 20) }} />
    </View>
  );
}

/**
 * Returns appropriate profiles based on user type
 * - Foreigners see Filipina profiles
 * - Filipinas see male (foreigner) profiles
 * - Default fallback to Filipina profiles
 */
function getProfilesForUserType(userType: string | null): Profile[] {
  if (!userType) {
    return filipinaProfiles; // Default fallback
  }

  // Foreigners see Filipina profiles
  if (userType === "foreigner") {
    return filipinaProfiles;
  }

  // Filipinas see male profiles
  if (userType === "filipina") {
    return maleProfiles;
  }

  // Default fallback
  return filipinaProfiles;
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
  emptyText: {
    fontSize: 18,
    color: "rgba(255,255,255,0.7)",
    fontFamily: "DMSans-Medium",
    textAlign: "center",
    paddingHorizontal: 40,
  },

  // Header
  header: {
    paddingTop: Platform.OS === "ios" ? 16 : 20,
    paddingBottom: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: Platform.OS === "ios" ? 32 : 30,
    fontFamily: "HelloParis-Bold",
    color: ACCENT_PINK,
    letterSpacing: 1,
    textShadowColor: "rgba(239, 62, 120, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  // Card Container
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    width: width - 40,
    maxHeight: height * 0.72,
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(141, 105, 246, 0.2)",
  },
  imageContainer: {
    position: "relative",
    height: "60%",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#1A1A1A",
  },
  verifiedBadge: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: VERIFIED_GREEN,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
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
  infoBtn: {
    position: "absolute",
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  infoBtnActive: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderColor: ACCENT_PURPLE,
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "35%",
  },

  // Profile Info - Scrollable
  profileInfoScroll: {
    flex: 1,
  },
  profileInfo: {
    padding: 24,
    paddingTop: 20,
    gap: 10,
  },
  nameContainer: {
    marginBottom: 2,
  },
  nameText: {
    color: WHITE,
    fontSize: Platform.OS === "ios" ? 28 : 26,
    fontFamily: "Lora-Bold",
    letterSpacing: 0.4,
    lineHeight: 34,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  locationText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 15,
    fontFamily: "DMSans-Medium",
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  distanceDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: ACCENT_PURPLE,
  },
  distanceText: {
    color: ACCENT_PURPLE,
    fontSize: 14,
    fontFamily: "DMSans-SemiBold",
    letterSpacing: 0.3,
  },

  // Interests
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  interestTag: {
    backgroundColor: "rgba(141, 105, 246, 0.18)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "rgba(141, 105, 246, 0.3)",
  },
  interestText: {
    color: ACCENT_PURPLE,
    fontSize: 13,
    fontFamily: "DMSans-SemiBold",
    letterSpacing: 0.3,
  },

  // Bio
  bioContainer: {
    marginTop: 8,
    gap: 8,
    paddingBottom: 10,
  },
  bioLabel: {
    color: ACCENT_PURPLE,
    fontSize: 13,
    fontFamily: "DMSans-Bold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  bioText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 15,
    fontFamily: "DMSans-Regular",
    lineHeight: 23,
    letterSpacing: 0.2,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    gap: 20,
  },
  actionBtn: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 999,
  },
  passBtn: {
    width: 64,
    height: 64,
    backgroundColor: "rgba(239, 62, 120, 0.12)",
    borderWidth: 2.5,
    borderColor: ACCENT_PINK,
    ...Platform.select({
      ios: {
        shadowColor: ACCENT_PINK,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  superLikeBtn: {
    width: 60,
    height: 60,
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    borderWidth: 2.5,
    borderColor: SUPER_LIKE_GOLD,
    ...Platform.select({
      ios: {
        shadowColor: SUPER_LIKE_GOLD,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  likeBtn: {
    width: 76,
    height: 76,
    backgroundColor: ACCENT_PINK,
    borderWidth: 3,
    borderColor: WHITE,
    ...Platform.select({
      ios: {
        shadowColor: ACCENT_PINK,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 14,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});
