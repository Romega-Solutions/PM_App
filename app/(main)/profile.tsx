// app/(tabs)/profile.tsx
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
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");
const isSmallDevice = width < 375;

/** Brand tokens from app/(tabs)/index.tsx */
const BRAND_BG = "#0F0814";
const ACCENT_PURPLE = "#8D69F6";
const ACCENT_PINK = "#EF3E78";
const VERIFIED_GREEN = "#10B981";
const SUPER_LIKE_GOLD = "#F59E0B"; // not used here but kept for parity
const WHITE = "#FFFFFF";

/** Derived surfaces and borders used in index.tsx styles */
const SURFACE_STRONG = "rgba(255, 255, 255, 0.08)";
const TILE_BORDER = "rgba(168, 85, 247, 0.13)";
const DANGER_BG = "rgba(239, 62, 120, 0.12)";

export default function Profile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const profileOptions: { title: string; icon: React.ReactNode }[] = [
    { title: "Edit Profile", icon: <Edit size={22} color={ACCENT_PURPLE} /> },
    {
      title: "Preferences",
      icon: <SlidersHorizontal size={22} color={ACCENT_PURPLE} />,
    },
    { title: "Privacy", icon: <Lock size={22} color={ACCENT_PURPLE} /> },
    { title: "Notifications", icon: <Bell size={22} color={ACCENT_PURPLE} /> },
    {
      title: "Help & Support",
      icon: <HelpCircle size={22} color={ACCENT_PURPLE} />,
    },
    { title: "About", icon: <Info size={22} color={ACCENT_PURPLE} /> },
  ];

  const handleLogout = () => {
    // TODO: add logout logic
    router.replace("/(auth)/welcome");
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

      {/* Brand gradient background to match index.tsx */}
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
            <Image
              source={require("../../assets/couple1.png")}
              style={styles.avatar}
              resizeMode="cover"
            />
          </View>

          <Text style={styles.name}>John Doe</Text>

          {/* Location row using lucide icon, no emoji */}
          <View style={styles.locationRow}>
            <MapPin size={16} color={ACCENT_PINK} strokeWidth={2.5} />
            <Text style={styles.locationText}>New York, USA</Text>
          </View>

          {/* Verified pill to mirror index.tsx verified badge */}
          <View style={styles.verifiedPill}>
            <Sparkles size={12} color={WHITE} strokeWidth={2.5} />
            <Text style={styles.verifiedText}>VERIFIED</Text>
          </View>
        </View>

        {/* Options list */}
        <View style={styles.listWrap}>
          {profileOptions.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.listItem}
              activeOpacity={0.75}
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
    backgroundColor: WHITE,
    marginBottom: 16,
  },

  avatar: {
    width: "100%",
    height: "100%",
  },

  name: {
    color: WHITE,
    fontSize: 24,
    fontFamily: "Lora-Bold",
    letterSpacing: 0.4,
    textShadowColor: "rgba(141, 105, 246, 0.7)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
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
    marginTop: 10,
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
