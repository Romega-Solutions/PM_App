// app/(tabs)/index.tsx
import { accountApi } from "@/src/features/account/api/accountApi";
import { UserType } from "@/src/features/auth/api/authApi";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Heart,
  Info,
  Languages,
  MapPin,
  Ruler,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
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
  const [showSwipeHints, setShowSwipeHints] = useState(true);
  const [expandedSections, setExpandedSections] = useState<{
    lookingFor: boolean;
    moreAbout: boolean;
  }>({
    lookingFor: false,
    moreAbout: false,
  });
  const [showGestureGuide, setShowGestureGuide] = useState(false);
  const [gestureType, setGestureType] = useState<
    "swipe-left" | "swipe-right" | "swipe-up" | null
  >(null);

  // Animation values
  const pan = useRef(new Animated.ValueXY()).current;
  const swipeUpValue = useRef(new Animated.Value(0)).current;
  const rotate = pan.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ["-10deg", "0deg", "10deg"],
    extrapolate: "clamp",
  });

  // Hide swipe hints after first interaction
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSwipeHints(false);
    }, 5000); // Hide after 5 seconds

    return () => clearTimeout(timer);
  }, []);

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

  // Pan Responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Show gesture guide when user starts touching
        setShowGestureGuide(true);
      },
      onPanResponderMove: (_, gesture) => {
        // Swipe left/right for like/pass
        if (Math.abs(gesture.dx) > Math.abs(gesture.dy)) {
          pan.setValue({ x: gesture.dx, y: 0 });
          // Determine gesture type
          if (gesture.dx > 20) {
            setGestureType("swipe-right");
          } else if (gesture.dx < -20) {
            setGestureType("swipe-left");
          }
        }
        // Swipe up for details
        else if (gesture.dy < -20) {
          swipeUpValue.setValue(Math.abs(gesture.dy));
          setGestureType("swipe-up");
        }
      },
      onPanResponderRelease: (_, gesture) => {
        // Hide gesture guide
        setShowGestureGuide(false);
        setGestureType(null);

        // Swipe right - Like
        if (gesture.dx > 120) {
          setShowSwipeHints(false); // Hide hints on interaction
          Animated.spring(pan, {
            toValue: { x: width + 100, y: gesture.dy },
            useNativeDriver: false,
          }).start(() => {
            handleLike();
            pan.setValue({ x: 0, y: 0 });
          });
        }
        // Swipe left - Pass
        else if (gesture.dx < -120) {
          setShowSwipeHints(false); // Hide hints on interaction
          Animated.spring(pan, {
            toValue: { x: -width - 100, y: gesture.dy },
            useNativeDriver: false,
          }).start(() => {
            handlePass();
            pan.setValue({ x: 0, y: 0 });
          });
        }
        // Swipe up - Show details
        else if (gesture.dy < -100) {
          setShowSwipeHints(false); // Hide hints on interaction
          setShowInfo(true);
          Animated.spring(swipeUpValue, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
        // Reset if not enough swipe
        else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
          Animated.spring(swipeUpValue, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const handleLike = () => {
    setCurrentIndex((prev) => (prev + 1) % profiles.length);
    setShowInfo(false);
  };

  const handlePass = () => {
    setCurrentIndex((prev) => (prev + 1) % profiles.length);
    setShowInfo(false);
  };

  const handleSuperLike = () => {
    // Animate up for super like
    Animated.spring(pan, {
      toValue: { x: 0, y: -height },
      useNativeDriver: false,
    }).start(() => {
      setCurrentIndex((prev) => (prev + 1) % profiles.length);
      setShowInfo(false);
      pan.setValue({ x: 0, y: 0 });
    });
  };

  // Modal swipe down handler
  const modalPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) => {
        // Only respond to downward swipes
        return gesture.dy > 10 && Math.abs(gesture.dy) > Math.abs(gesture.dx);
      },
      onPanResponderMove: (_, gesture) => {
        // Only allow downward movement
        if (gesture.dy > 0) {
          // You can add animation here if needed
        }
      },
      onPanResponderRelease: (_, gesture) => {
        // Close modal if swiped down more than 150px
        if (gesture.dy > 150) {
          setShowInfo(false);
        }
      },
    })
  ).current;

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
        {/* Swipe Hint Indicators - Only shown on first load */}
        {showSwipeHints && (
          <Animated.View
            style={[
              styles.swipeHintsContainer,
              {
                opacity: swipeUpValue.interpolate({
                  inputRange: [0, 50],
                  outputRange: [1, 0],
                  extrapolate: "clamp",
                }),
              },
            ]}
          >
            <View style={styles.swipeHintArrow}>
              <Text style={styles.arrowText}>←</Text>
              <Text style={styles.hintText}>Pass</Text>
            </View>
            <View style={styles.swipeHintArrow}>
              <Text style={styles.arrowText}>↑</Text>
              <Text style={styles.hintText}>Details</Text>
            </View>
            <View style={styles.swipeHintArrow}>
              <Text style={styles.arrowText}>→</Text>
              <Text style={styles.hintText}>Like</Text>
            </View>
          </Animated.View>
        )}

        {/* Active Gesture Guide - Shows when holding the screen */}
        {showGestureGuide && (
          <View style={styles.gestureGuideOverlay}>
            <View style={styles.gestureGuideRow}>
              {/* Left - Pass */}
              <View
                style={[
                  styles.gestureGuideItem,
                  gestureType === "swipe-left" && styles.gestureGuideItemActive,
                ]}
              >
                {gestureType === "swipe-left" && (
                  <LinearGradient
                    colors={[
                      "rgba(239, 62, 120, 0.2)",
                      "rgba(239, 62, 120, 0.05)",
                    ]}
                    style={styles.gestureGradient}
                  />
                )}
                <View
                  style={[
                    styles.gestureIconCircle,
                    gestureType === "swipe-left" &&
                      styles.gestureIconCircleActive,
                  ]}
                >
                  <X
                    size={28}
                    color={
                      gestureType === "swipe-left"
                        ? ACCENT_PINK
                        : "rgba(255, 255, 255, 0.5)"
                    }
                    strokeWidth={2.5}
                  />
                </View>
                <Text
                  style={[
                    styles.gestureLabel,
                    gestureType === "swipe-left" && styles.gestureLabelActive,
                  ]}
                >
                  Pass
                </Text>
              </View>

              {/* Middle - Details */}
              <View
                style={[
                  styles.gestureGuideItem,
                  gestureType === "swipe-up" && styles.gestureGuideItemActive,
                ]}
              >
                {gestureType === "swipe-up" && (
                  <LinearGradient
                    colors={[
                      "rgba(141, 105, 246, 0.2)",
                      "rgba(141, 105, 246, 0.05)",
                    ]}
                    style={styles.gestureGradient}
                  />
                )}
                <View
                  style={[
                    styles.gestureIconCircle,
                    gestureType === "swipe-up" &&
                      styles.gestureIconCircleActive,
                  ]}
                >
                  <Info
                    size={28}
                    color={
                      gestureType === "swipe-up"
                        ? ACCENT_PURPLE
                        : "rgba(255, 255, 255, 0.5)"
                    }
                    strokeWidth={2.5}
                  />
                </View>
                <Text
                  style={[
                    styles.gestureLabel,
                    gestureType === "swipe-up" && styles.gestureLabelActive,
                  ]}
                >
                  Details
                </Text>
              </View>

              {/* Right - Like */}
              <View
                style={[
                  styles.gestureGuideItem,
                  gestureType === "swipe-right" &&
                    styles.gestureGuideItemActive,
                ]}
              >
                {gestureType === "swipe-right" && (
                  <LinearGradient
                    colors={[
                      "rgba(16, 185, 129, 0.25)",
                      "rgba(16, 185, 129, 0.05)",
                    ]}
                    style={styles.gestureGradient}
                  />
                )}
                <View
                  style={[
                    styles.gestureIconCircle,
                    gestureType === "swipe-right" &&
                      styles.gestureIconCircleActive,
                  ]}
                >
                  <Heart
                    size={28}
                    color={
                      gestureType === "swipe-right"
                        ? VERIFIED_GREEN
                        : "rgba(255, 255, 255, 0.5)"
                    }
                    strokeWidth={2.5}
                  />
                </View>
                <Text
                  style={[
                    styles.gestureLabel,
                    gestureType === "swipe-right" && styles.gestureLabelActive,
                  ]}
                >
                  Like
                </Text>
              </View>
            </View>
          </View>
        )}

        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                { translateX: pan.x },
                { translateY: pan.y },
                { rotate: rotate },
              ],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Swipe Indicators */}
          <Animated.View
            style={[
              styles.likeIndicator,
              {
                opacity: pan.x.interpolate({
                  inputRange: [0, width / 4],
                  outputRange: [0, 1],
                  extrapolate: "clamp",
                }),
              },
            ]}
          >
            <Text style={styles.likeIndicatorText}>LIKE</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.nopeIndicator,
              {
                opacity: pan.x.interpolate({
                  inputRange: [-width / 4, 0],
                  outputRange: [1, 0],
                  extrapolate: "clamp",
                }),
              },
            ]}
          >
            <Text style={styles.nopeIndicatorText}>NOPE</Text>
          </Animated.View>

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
          </ScrollView>

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
        </Animated.View>
      </View>

      {/* User Details Modal */}
      <Modal
        visible={showInfo}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowInfo(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowInfo(false)}
          />
          <View style={styles.modalContent} {...modalPanResponder.panHandlers}>
            <LinearGradient
              colors={["rgba(141, 105, 246, 0.15)", "rgba(239, 62, 120, 0.15)"]}
              style={StyleSheet.absoluteFill}
            />

            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalDragHandle} />
              <TouchableOpacity
                onPress={() => setShowInfo(false)}
                style={styles.modalCloseBtn}
              >
                <X size={24} color={WHITE} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            {/* Profile Image in Modal */}
            <View style={styles.modalImageContainer}>
              <Image
                source={user.image}
                style={styles.modalImage}
                resizeMode="cover"
              />
              {user.verified && (
                <View style={styles.modalVerifiedBadge}>
                  <Sparkles size={14} color={WHITE} strokeWidth={2.5} />
                  <Text style={styles.verifiedText}>VERIFIED</Text>
                </View>
              )}
            </View>

            {/* User Details */}
            <ScrollView
              style={styles.modalDetailsScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalDetailsContent}
            >
              {/* Name and Basic Info */}
              <View style={styles.modalInfoSection}>
                <Text style={styles.modalName}>
                  {user.name}, {user.age}
                </Text>

                <View style={styles.modalLocationContainer}>
                  <MapPin size={18} color={ACCENT_PINK} strokeWidth={2.5} />
                  <Text style={styles.modalLocationText}>{user.location}</Text>
                </View>

                <View style={styles.distanceRow}>
                  <View style={styles.distanceDot} />
                  <Text style={styles.modalDistanceText}>{user.distance}</Text>
                </View>
              </View>

              {/* Interests Section */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Interests</Text>
                <View style={styles.modalInterestsContainer}>
                  {user.interests.map((interest, idx) => (
                    <View key={idx} style={styles.modalInterestTag}>
                      <Text style={styles.modalInterestText}>{interest}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* About Section */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>About</Text>
                <Text style={styles.modalBioText}>{user.bio}</Text>
              </View>

              {/* Looking For Section - Ready for Supabase */}
              <TouchableOpacity
                style={styles.modalSection}
                onPress={() =>
                  setExpandedSections((prev) => ({
                    ...prev,
                    lookingFor: !prev.lookingFor,
                  }))
                }
                activeOpacity={0.7}
              >
                <View style={styles.expandableHeader}>
                  <Text style={styles.modalSectionTitle}>Looking For</Text>
                  {expandedSections.lookingFor ? (
                    <ChevronUp
                      size={18}
                      color={ACCENT_PURPLE}
                      strokeWidth={2.5}
                    />
                  ) : (
                    <ChevronDown
                      size={18}
                      color={ACCENT_PURPLE}
                      strokeWidth={2.5}
                    />
                  )}
                </View>
                {expandedSections.lookingFor && (
                  <Text style={styles.modalSubText}>
                    {/* TODO: Fetch from Supabase profile.looking_for */}
                    Genuine connections, meaningful conversations, and someone
                    to share adventures with.
                  </Text>
                )}
              </TouchableOpacity>

              {/* Additional Info - Ready for Supabase */}
              <TouchableOpacity
                style={styles.modalSection}
                onPress={() =>
                  setExpandedSections((prev) => ({
                    ...prev,
                    moreAbout: !prev.moreAbout,
                  }))
                }
                activeOpacity={0.7}
              >
                <View style={styles.expandableHeader}>
                  <Text style={styles.modalSectionTitle}>
                    More About {user.name}
                  </Text>
                  {expandedSections.moreAbout ? (
                    <ChevronUp
                      size={18}
                      color={ACCENT_PURPLE}
                      strokeWidth={2.5}
                    />
                  ) : (
                    <ChevronDown
                      size={18}
                      color={ACCENT_PURPLE}
                      strokeWidth={2.5}
                    />
                  )}
                </View>

                {expandedSections.moreAbout && (
                  <>
                    {/* TODO: Fetch from Supabase */}
                    <View style={styles.modalPillsContainer}>
                      <View style={styles.modalPill}>
                        <Ruler
                          size={14}
                          color={ACCENT_PURPLE}
                          strokeWidth={2.5}
                        />
                        <Text style={styles.modalPillText}>5'4"</Text>
                      </View>
                      <View style={styles.modalPill}>
                        <GraduationCap
                          size={14}
                          color={ACCENT_PURPLE}
                          strokeWidth={2.5}
                        />
                        <Text style={styles.modalPillText}>College</Text>
                      </View>
                      <View style={styles.modalPill}>
                        <Languages
                          size={14}
                          color={ACCENT_PURPLE}
                          strokeWidth={2.5}
                        />
                        <Text style={styles.modalPillText}>
                          English, Tagalog
                        </Text>
                      </View>
                      <View style={styles.modalPill}>
                        <Users
                          size={14}
                          color={ACCENT_PURPLE}
                          strokeWidth={2.5}
                        />
                        <Text style={styles.modalPillText}>Single</Text>
                      </View>
                    </View>
                  </>
                )}
              </TouchableOpacity>

              {/* Spacer for bottom */}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

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

  // Swipe Hints
  swipeHintsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingBottom: 16,
    paddingTop: 8,
  },
  swipeHintArrow: {
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(15, 8, 20, 0.85)",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: ACCENT_PURPLE,
    minWidth: 90,
    ...Platform.select({
      ios: {
        shadowColor: ACCENT_PURPLE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  arrowText: {
    fontSize: 32,
    color: ACCENT_PINK,
    fontWeight: "bold",
    textShadowColor: "rgba(239, 62, 120, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  hintText: {
    color: WHITE,
    fontSize: 11,
    fontFamily: "DMSans-Bold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
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

  // Swipe Indicators
  likeIndicator: {
    position: "absolute",
    top: 50,
    left: 30,
    zIndex: 10,
    backgroundColor: "rgba(16, 185, 129, 0.9)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: VERIFIED_GREEN,
    transform: [{ rotate: "-15deg" }],
  },
  likeIndicatorText: {
    color: WHITE,
    fontSize: 32,
    fontFamily: "DMSans-Bold",
    letterSpacing: 2,
  },
  nopeIndicator: {
    position: "absolute",
    top: 50,
    right: 30,
    zIndex: 10,
    backgroundColor: "rgba(239, 62, 120, 0.9)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: ACCENT_PINK,
    transform: [{ rotate: "15deg" }],
  },
  nopeIndicatorText: {
    color: WHITE,
    fontSize: 32,
    fontFamily: "DMSans-Bold",
    letterSpacing: 2,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: BRAND_BG,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: height * 0.85, // Take 85% of screen
    borderWidth: 1.5,
    borderColor: "rgba(141, 105, 246, 0.3)",
    overflow: "hidden",
  },
  modalHeader: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
    position: "relative",
    backgroundColor: BRAND_BG,
    zIndex: 10,
  },
  modalDragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 3,
  },
  modalCloseBtn: {
    position: "absolute",
    right: 20,
    top: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalImageContainer: {
    width: width,
    height: height * 0.18, // Reduced to 18% for smaller image
    position: "relative",
  },
  modalImage: {
    width: "100%",
    height: "100%",
  },
  modalVerifiedBadge: {
    position: "absolute",
    top: 16,
    right: 16,
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
  modalDetailsScroll: {
    flex: 1,
  },
  modalDetailsContent: {
    paddingBottom: 30,
  },
  modalInfoSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(141, 105, 246, 0.1)",
  },
  modalLocationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  modalDistanceText: {
    color: ACCENT_PURPLE,
    fontSize: 15,
    fontFamily: "DMSans-SemiBold",
    letterSpacing: 0.3,
  },
  modalSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(141, 105, 246, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(141, 105, 246, 0.3)",
  },
  modalInterestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  modalInterestTag: {
    backgroundColor: "rgba(141, 105, 246, 0.2)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderWidth: 1.5,
    borderColor: "rgba(141, 105, 246, 0.4)",
  },
  modalInterestText: {
    color: ACCENT_PURPLE,
    fontSize: 14,
    fontFamily: "DMSans-SemiBold",
    letterSpacing: 0.4,
  },
  modalSubText: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 15,
    fontFamily: "DMSans-Regular",
    lineHeight: 23,
    letterSpacing: 0.2,
  },
  expandableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalPillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  modalPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(141, 105, 246, 0.15)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: "rgba(141, 105, 246, 0.35)",
  },
  modalPillText: {
    color: WHITE,
    fontSize: 14,
    fontFamily: "DMSans-SemiBold",
    letterSpacing: 0.3,
  },
  modalInfoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  modalInfoItem: {
    width: "48%",
    backgroundColor: "rgba(141, 105, 246, 0.08)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(141, 105, 246, 0.2)",
  },
  modalInfoLabel: {
    color: ACCENT_PURPLE,
    fontSize: 12,
    fontFamily: "DMSans-Bold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  modalInfoValue: {
    color: WHITE,
    fontSize: 15,
    fontFamily: "DMSans-SemiBold",
    letterSpacing: 0.2,
  },
  modalName: {
    color: WHITE,
    fontSize: 28,
    fontFamily: "Lora-Bold",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  modalLocationText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 16,
    fontFamily: "DMSans-Medium",
    letterSpacing: 0.2,
  },
  modalSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(141, 105, 246, 0.08)",
  },
  modalSectionTitle: {
    color: ACCENT_PURPLE,
    fontSize: 14,
    fontFamily: "DMSans-Bold",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  modalBioText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 15,
    fontFamily: "DMSans-Regular",
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 24,
    gap: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(141, 105, 246, 0.15)",
  },
  // Gesture Guide Overlay Styles
  gestureGuideOverlay: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    paddingHorizontal: 20,
  },
  gestureGuideRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    gap: 12,
  },
  gestureGuideItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(15, 8, 20, 0.85)",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.1)",
    position: "relative",
    overflow: "hidden",
  },
  gestureGuideItemActive: {
    borderColor: "rgba(255, 255, 255, 0.3)",
    transform: [{ scale: 1.05 }],
  },
  gestureGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gestureIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  gestureIconCircleActive: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  gestureLabel: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 13,
    fontFamily: "DMSans-Bold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  gestureLabelActive: {
    color: WHITE,
  },
  gestureGuideContainer: {
    backgroundColor: "rgba(15, 8, 20, 0.95)",
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: ACCENT_PURPLE,
    minWidth: 200,
    shadowColor: ACCENT_PURPLE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  gestureGuideBox: {
    alignItems: "center",
  },
  gestureIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(141, 105, 246, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: ACCENT_PURPLE,
  },
  gestureIcon: {
    fontSize: 40,
  },
  gestureGuideTitle: {
    color: WHITE,
    fontSize: 20,
    fontFamily: "Lora-Bold",
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: "center",
  },
  gestureGuideText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    letterSpacing: 0.3,
    textAlign: "center",
  },
  gestureProgressBar: {
    width: 150,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    marginTop: 16,
    overflow: "hidden",
  },
  gestureProgress: {
    height: "100%",
    borderRadius: 2,
  },
});
