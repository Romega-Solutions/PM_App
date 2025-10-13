// app/(auth)/welcome.tsx
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PrimaryButton from "../../src/components/ui/PrimaryButton";
import SecondaryButton from "../../src/components/ui/SecondaryButton";

const { width } = Dimensions.get("window");

// Brand-aligned colors
const BRAND_BG = "#0F0814"; // deep aubergine
const OVERLAY = [
  "rgba(141,105,246,0.10)", // soft purple haze
  "rgba(239,62,120,0.15)",  // subtle pink tint
  "rgba(15,8,20,0.85)",     // dark base blend
  "rgba(15,8,20,0.98)",     // near-opaque base
];

export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: BRAND_BG }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Background */}
      <View style={StyleSheet.absoluteFill}>
        <Image
          source={require("../../assets/welcome.jpg")}
          style={styles.bgImage}
          resizeMode="cover"
          accessible
          accessibilityLabel="Beautiful Filipino couple representing love and connection"
        />
        <LinearGradient
          colors={OVERLAY}
          locations={[0, 0.35, 0.75, 1]}
          style={styles.gradient}
        />
      </View>

      {/* Content */}
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 8,
            paddingBottom: 24,
            paddingHorizontal: 24,
          },
        ]}
      >
        {/* Center header */}
        <View style={styles.header}>
          {/* Logo only (removed wordmark) */}
          <View
            style={styles.logoContainer}
            accessible
            accessibilityRole="image"
            accessibilityLabel="PinayMate logo"
          >
            <Image
              source={require("../../assets/logo-no-bg.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Messaging */}
          <View style={styles.heroTextWrap} accessible>
            <Text style={[styles.heroHeading, { fontFamily: "HelloParis-Bold" }]}>
              Find Love in the{"\n"}Filipino Community
            </Text>
            <Text style={[styles.subtitle, { fontFamily: "Lora-Regular" }]}>
              Connect with verified Filipino singles{"\n"}worldwide. Start meaningful relationships today.
            </Text>
          </View>
        </View>

        {/* Bottom actions */}
        <View style={{ gap: 14 }}>
          <PrimaryButton
            title="Create Account"
            onPress={() => router.push("/(auth)/signup")}
            accessibilityLabel="Create Account"
            accessibilityHint="Sign up to start finding matches"
          />
          <SecondaryButton
            title="Sign In"
            variant="purple"
            onPress={() => router.push("/(auth)/signin")}
            accessibilityLabel="Sign In"
            accessibilityHint="Log in to your existing account"
          />
          <Text
            style={[styles.legal, { fontFamily: "DMSans-Regular" }]}
            accessible
          >
            By continuing, you agree to our Terms of Service{"\n"}and Privacy Policy
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bgImage: { width: "100%", height: "100%", position: "absolute" },
  gradient: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },

  content: {
    flex: 1,
    justifyContent: "space-between",
    zIndex: 2,
  },
  header: { alignItems: "center", flex: 1, justifyContent: "center" },

  logoContainer: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#EF3E78",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 20,
  },
  logoImage: { width: 140, height: 140 },

  heroTextWrap: { alignItems: "center", marginBottom: 24 },
  heroHeading: {
    fontSize: Math.min(width * 0.09, 40),
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: Math.min(width * 0.115, 48),
    marginBottom: 16,
    textShadowColor: "rgba(239, 62, 120, 0.5)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 12,
    letterSpacing: -0.5,
    paddingHorizontal: 10,
  },
  subtitle: {
    fontSize: Math.min(width * 0.043, 17),
    color: "rgba(255, 255, 255, 0.95)",
    textAlign: "center",
    lineHeight: Math.min(width * 0.063, 25),
    paddingHorizontal: 16,
    textShadowColor: "rgba(0, 0, 0, 0.6)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  legal: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.65)",
    textAlign: "center",
    lineHeight: 17,
    marginTop: 16,
    paddingHorizontal: 16,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
