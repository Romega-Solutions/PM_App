import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, Globe, Heart, Shield, Sparkles } from "lucide-react-native";
import React from "react";
import {
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BRAND_BG = "#0F0814";
const ACCENT_PURPLE = "#8D69F6";
const ACCENT_PINK = "#EF3E78";
const WHITE = "#FFFFFF";
const SURFACE_STRONG = "rgba(255, 255, 255, 0.08)";
const TILE_BORDER = "rgba(168, 85, 247, 0.13)";

export default function AboutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_BG} />
      {Platform.OS === "ios" && (
        <View style={{ height: insets.top, backgroundColor: BRAND_BG }} />
      )}

      <LinearGradient
        colors={[BRAND_BG, "#1A0F1F", "#2D1B35", BRAND_BG]}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/(main)/profile")}
          style={styles.backBtn}
          activeOpacity={0.78}
          accessibilityRole="button"
          accessibilityLabel="Back to profile"
          accessibilityHint="Returns to your profile screen"
        >
          <ArrowLeft size={24} color={WHITE} />
        </TouchableOpacity>
        <Text style={styles.title}>About PinayMate</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentBody,
          { paddingBottom: Math.max(insets.bottom, 24) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoSection}>
          <View style={styles.logoBg}>
            <Heart size={48} color={ACCENT_PINK} fill={ACCENT_PINK} />
          </View>
          <Text style={styles.appName}>PinayMate</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <Text style={styles.description}>
          PinayMate is being built as a dating platform for Filipina women and
          foreign men seeking meaningful relationships. The current app should
          be treated as launch-stage: account, privacy, verification, matching,
          messaging, and support behavior must follow the readiness evidence
          shown in-app and on the launch website.
        </Text>

        <View style={styles.launchCard}>
          <Text style={styles.launchCardTitle}>Launch-stage app</Text>
          <Text style={styles.launchCardText}>
            Your account can use the features available in this build, but
            public matching, calls, paid plans, store availability, and final
            safety operations depend on release sign-off.
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Shield size={32} color={ACCENT_PURPLE} />
          <Text style={styles.featureTitle}>Privacy and safety controls</Text>
          <Text style={styles.featureDesc}>
            Privacy and safety controls help protect your account, reports, and
            messages while launch checks continue.
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Sparkles size={32} color={ACCENT_PURPLE} />
          <Text style={styles.featureTitle}>Verification Review</Text>
          <Text style={styles.featureDesc}>
            Verification submissions are reviewed before a verified badge is
            shown. A badge is a trust signal, not a safety guarantee.
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Heart size={32} color={ACCENT_PURPLE} />
          <Text style={styles.featureTitle}>Meaningful Connections</Text>
          <Text style={styles.featureDesc}>
            We focus on helping people understand relationship intent, shared
            interests, and values before they choose to connect.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.websiteBtn}
          onPress={() => Linking.openURL("https://pinaymate.com")}
          activeOpacity={0.84}
          accessibilityRole="button"
          accessibilityLabel="Visit the PinayMate website"
          accessibilityHint="Opens pinaymate.com in your browser"
        >
          <Globe size={20} color={WHITE} />
          <Text style={styles.websiteBtnText}>Visit Our Website</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 PinayMate. All rights reserved.
          </Text>
          <Text style={styles.footerText}>Made in the Philippines</Text>
        </View>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    fontSize: 20,
    color: WHITE,
    fontFamily: "DMSans-Bold",
    textAlign: "center",
  },
  headerSpacer: {
    width: 44,
    height: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentBody: {
    paddingBottom: 24,
  },
  logoSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 32,
  },
  logoBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(239, 62, 120, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: ACCENT_PINK,
  },
  appName: {
    fontSize: 28,
    color: ACCENT_PINK,
    fontFamily: "Lora-Bold",
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    fontFamily: "DMSans-Regular",
  },
  description: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 15,
    fontFamily: "DMSans-Regular",
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 32,
  },
  featureCard: {
    backgroundColor: SURFACE_STRONG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: TILE_BORDER,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  launchCard: {
    backgroundColor: "rgba(239, 62, 120, 0.1)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(239, 62, 120, 0.28)",
    padding: 18,
    marginBottom: 18,
  },
  launchCardTitle: {
    color: WHITE,
    fontSize: 16,
    fontFamily: "DMSans-Bold",
    marginBottom: 8,
    textAlign: "center",
  },
  launchCardText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    lineHeight: 21,
    textAlign: "center",
  },
  featureTitle: {
    color: WHITE,
    fontSize: 18,
    fontFamily: "DMSans-Bold",
    marginTop: 12,
    marginBottom: 8,
  },
  featureDesc: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  websiteBtn: {
    backgroundColor: ACCENT_PURPLE,
    borderRadius: 12,
    minHeight: 54,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    marginBottom: 32,
  },
  websiteBtnText: {
    color: WHITE,
    fontSize: 16,
    fontFamily: "DMSans-Bold",
  },
  footer: {
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontFamily: "DMSans-Regular",
  },
});
