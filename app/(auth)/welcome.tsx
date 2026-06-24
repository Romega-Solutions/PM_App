// app/(auth)/welcome.tsx
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { BadgeCheck, ShieldCheck, Users } from "lucide-react-native";
import React from "react";
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PrimaryButton from "../../src/components/ui/PrimaryButton";
import SecondaryButton from "../../src/components/ui/SecondaryButton";
import {
  BETA_DEMO_COPY,
  isBetaDemoModeEnabled,
} from "../../src/features/auth/demoMode";
import { useAuthStore } from "../../src/stores/authStore";

const { width } = Dimensions.get("window");

// Brand-aligned colors
const BRAND_BG = "#0F0814"; // deep aubergine
const WHITE = "#FFFFFF";
const TEXT_SECONDARY = "rgba(255, 255, 255, 0.88)";
const OVERLAY = [
  "rgba(141,105,246,0.10)", // soft purple haze
  "rgba(239,62,120,0.15)", // subtle pink tint
  "rgba(15,8,20,0.85)", // dark base blend
  "rgba(15,8,20,0.98)", // near-opaque base
] as const;

export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const startDemoSession = useAuthStore((state) => state.startDemoSession);

  const handleBetaPreview = () => {
    startDemoSession();
    router.replace("/(main)");
  };

  return (
    <View style={{ flex: 1, backgroundColor: BRAND_BG }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Background */}
      <View style={StyleSheet.absoluteFill}>
        <Image
          source={require("../../assets/images/onboarding/welcome.webp")}
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
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 8,
            paddingBottom: Math.max(insets.bottom + 24, 36),
            paddingHorizontal: 24,
          },
        ]}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Center header */}
        <View style={styles.header}>
          <View
            style={styles.logoContainer}
            accessible
            accessibilityRole="image"
            accessibilityLabel="PinayMate logo"
          >
            <Image
              source={require("../../assets/images/brand/logo-no-bg.webp")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Messaging */}
          <View style={styles.heroTextWrap} accessible>
            <Text
              style={[styles.heroHeading, { fontFamily: "HelloParis-Bold" }]}
              maxFontSizeMultiplier={1.22}
            >
              Filipino dating,{"\n"}started with care
            </Text>
            <Text
              style={[styles.subtitle, { fontFamily: "Lora-Regular" }]}
              maxFontSizeMultiplier={1.25}
            >
              Build a profile with clear expectations, safety prompts, and
              privacy-aware setup before matching begins.
            </Text>
          </View>

          <View
            style={styles.trustGrid}
            accessible
            accessibilityLabel="PinayMate trust signals include profile-first setup, review cues, and clear privacy terms"
          >
            <View style={styles.trustPill}>
              <ShieldCheck size={16} color={WHITE} strokeWidth={2.4} />
              <Text style={styles.trustText}>Safety cues</Text>
            </View>
            <View style={styles.trustPill}>
              <BadgeCheck size={16} color={WHITE} strokeWidth={2.4} />
              <Text style={styles.trustText}>Review cues</Text>
            </View>
            <View style={styles.trustPill}>
              <Users size={16} color={WHITE} strokeWidth={2.4} />
              <Text style={styles.trustText}>Mutual intent</Text>
            </View>
          </View>
        </View>

        {/* Bottom actions */}
        <View style={[styles.actions, { paddingBottom: insets.bottom + 8 }]}>
          <PrimaryButton
            title="Start Profile Setup"
            onPress={() => router.push("/(auth)/user-type-selection")}
            accessibilityLabel="Start PinayMate profile setup"
            accessibilityHint="Starts onboarding for your PinayMate profile"
          />
          <SecondaryButton
            title="Sign In"
            variant="purple"
            onPress={() => router.push("/(auth)/signin")}
            accessibilityLabel="Sign In"
            accessibilityHint="Log in to your existing account"
          />
          {isBetaDemoModeEnabled() ? (
            <Pressable
              style={styles.demoPreview}
              onPress={handleBetaPreview}
              accessibilityRole="button"
              accessibilityLabel="Open beta preview with seeded demo data"
              accessibilityHint="Opens the main app without creating an account or writing profile data"
            >
              <Text style={styles.demoPreviewTitle}>
                {BETA_DEMO_COPY.title}
              </Text>
              <Text style={styles.demoPreviewText}>
                Preview the main tabs with seeded data. No account is created.
              </Text>
            </Pressable>
          ) : null}
          <View style={styles.legalWrap}>
            <Text style={[styles.legal, { fontFamily: "DMSans-Regular" }]}>
              By continuing, you agree to PinayMate's terms and privacy policy.
            </Text>
            <View style={styles.legalLinks}>
              <Pressable
                onPress={() => router.push("/(auth)/terms")}
                accessibilityRole="button"
                accessibilityLabel="Read PinayMate terms of service"
                accessibilityHint="Opens the PinayMate terms overview"
                hitSlop={10}
              >
                <Text
                  style={[styles.legalLink, { fontFamily: "DMSans-SemiBold" }]}
                >
                  Terms of Service
                </Text>
              </Pressable>
              <Text style={styles.legalSeparator}>and</Text>
              <Pressable
                onPress={() => router.push("/(auth)/privacy")}
                accessibilityRole="button"
                accessibilityLabel="Read PinayMate privacy policy"
                accessibilityHint="Opens the PinayMate privacy overview"
                hitSlop={10}
              >
                <Text
                  style={[styles.legalLink, { fontFamily: "DMSans-SemiBold" }]}
                >
                  Privacy Policy
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bgImage: { width: "100%", height: "100%", position: "absolute" },
  gradient: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },

  content: {
    flexGrow: 1,
    justifyContent: "space-between",
    zIndex: 2,
  },
  header: { alignItems: "center", flex: 1, justifyContent: "center" },

  logoContainer: {
    width: Math.min(width * 0.42, 170),
    height: Math.min(width * 0.42, 170),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    shadowColor: "#EF3E78",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 20,
  },
  logoImage: {
    width: Math.min(width * 0.28, 118),
    height: Math.min(width * 0.28, 118),
  },

  heroTextWrap: { alignItems: "center", marginBottom: 24 },
  heroHeading: {
    fontSize: 31,
    color: WHITE,
    textAlign: "center",
    lineHeight: 37,
    marginBottom: 16,
    textShadowColor: "rgba(239, 62, 120, 0.5)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 12,
    letterSpacing: 0,
    paddingHorizontal: 10,
  },
  subtitle: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 16,
    textShadowColor: "rgba(0, 0, 0, 0.6)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  trustGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 4,
  },
  trustPill: {
    minHeight: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.22)",
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  trustText: {
    color: WHITE,
    fontFamily: "DMSans-SemiBold",
    fontSize: 12,
    lineHeight: 16,
  },
  actions: {
    gap: 14,
  },
  demoPreview: {
    minHeight: 68,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.24)",
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  demoPreviewTitle: {
    color: WHITE,
    fontFamily: "DMSans-SemiBold",
    fontSize: 14,
    marginBottom: 4,
    textAlign: "center",
  },
  demoPreviewText: {
    color: "rgba(255, 255, 255, 0.72)",
    fontFamily: "DMSans-Regular",
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
  },
  legal: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.65)",
    textAlign: "center",
    lineHeight: 17,
    paddingHorizontal: 16,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  legalWrap: {
    alignItems: "center",
    marginTop: 16,
    gap: 4,
  },
  legalLinks: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  legalLink: {
    minHeight: 44,
    paddingHorizontal: 4,
    color: "#FFFFFF",
    fontSize: 12,
    lineHeight: 44,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  legalSeparator: {
    color: "rgba(255, 255, 255, 0.65)",
    fontSize: 12,
    lineHeight: 18,
  },
});
