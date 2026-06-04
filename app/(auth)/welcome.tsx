// app/(auth)/welcome.tsx
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PrimaryButton from "../../src/components/ui/PrimaryButton";
import SecondaryButton from "../../src/components/ui/SecondaryButton";
import { theme, withAlpha } from "../../src/theme";

const BRAND_BG = theme.lightColors.brandBackground;
const WHITE = theme.colors.neutral.white;
const OVERLAY = [
  withAlpha(theme.colors.dalisay[500], 0.1),
  withAlpha(theme.colors.amihan[500], 0.15),
  withAlpha(BRAND_BG, 0.85),
  withAlpha(BRAND_BG, 0.98),
] as const;

export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
            <Text
              style={[styles.heroHeading, { fontFamily: "Lora-Bold" }]}
            >
              Find Love in the{"\n"}Filipino Community
            </Text>
            <Text style={[styles.subtitle, { fontFamily: "Lora-Regular" }]}>
              Connect with verified Filipino singles{"\n"}worldwide. Start
              meaningful relationships today.
            </Text>
          </View>
        </View>

        {/* Bottom actions */}
        <View style={{ gap: 14 }}>
          <PrimaryButton
            title="Create Account"
            onPress={() => router.push("/(auth)/user-type-selection")}
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
          <View
            style={styles.legalWrap}
            accessible
            accessibilityRole="text"
            accessibilityLabel="By continuing, you agree to our Terms of Service and Privacy Policy"
          >
            <Text style={[styles.legal, { fontFamily: "DMSans-Regular" }]}>
              By continuing, you agree to our
            </Text>
            <View style={styles.legalLinks}>
              <TouchableOpacity
                onPress={() => router.push("/(auth)/terms")}
                accessibilityRole="link"
                accessibilityLabel="Terms of Service"
              >
                <Text style={[styles.legalLink, { fontFamily: "DMSans-Regular" }]}>
                  Terms of Service
                </Text>
              </TouchableOpacity>
              <Text style={[styles.legal, { fontFamily: "DMSans-Regular" }]}>
                and
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(auth)/privacy")}
                accessibilityRole="link"
                accessibilityLabel="Privacy Policy"
              >
                <Text style={[styles.legalLink, { fontFamily: "DMSans-Regular" }]}>
                  Privacy Policy
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
    shadowColor: theme.colors.amihan[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 20,
  },
  logoImage: { width: 140, height: 140 },

  heroTextWrap: { alignItems: "center", marginBottom: 24 },
  heroHeading: {
    fontSize: 36,
    color: WHITE,
    textAlign: "center",
    lineHeight: 43,
    marginBottom: 16,
    textShadowColor: withAlpha(theme.colors.amihan[500], 0.5),
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 12,
    letterSpacing: 0,
    paddingHorizontal: 10,
  },
  subtitle: {
    fontSize: 16,
    color: withAlpha(WHITE, 0.95),
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 16,
    textShadowColor: withAlpha(theme.colors.neutral.black, 0.6),
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  legalWrap: {
    marginTop: 16,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  legalLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 4,
  },
  legal: {
    fontSize: 12,
    color: withAlpha(WHITE, 0.65),
    textAlign: "center",
    lineHeight: 17,
    textShadowColor: withAlpha(theme.colors.neutral.black, 0.5),
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  legalLink: {
    fontSize: 12,
    color: WHITE,
    textAlign: "center",
    lineHeight: 17,
    textDecorationLine: "underline",
    fontWeight: "700",
    textShadowColor: withAlpha(theme.colors.neutral.black, 0.5),
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
