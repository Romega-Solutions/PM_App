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
          PinayMate helps Filipina women and foreign men build intentional
          relationships with clearer profiles, trust checks, privacy controls,
          and respectful conversations.
        </Text>

        <View style={styles.missionStrip}>
          <Text style={styles.missionStripTitle}>Dating with more context</Text>
          <Text style={styles.missionStripText}>
            We keep the focus on relationship intent, profile clarity, and safer
            ways to decide who feels worth meeting.
          </Text>
        </View>

        <View style={styles.valuesGroup}>
          <View style={styles.valueRow}>
            <View style={styles.valueIcon}>
              <Shield size={24} color={ACCENT_PURPLE} />
            </View>
            <View style={styles.valueCopy}>
              <Text style={styles.featureTitle}>
                Privacy and safety controls
              </Text>
              <Text style={styles.featureDesc}>
                Choose what others can see, report concerns, and keep your
                account protected.
              </Text>
            </View>
          </View>

          <View style={styles.valueRow}>
            <View style={styles.valueIcon}>
              <Sparkles size={24} color={ACCENT_PURPLE} />
            </View>
            <View style={styles.valueCopy}>
              <Text style={styles.featureTitle}>Verification review</Text>
              <Text style={styles.featureDesc}>
                Verified badges add useful context while still encouraging
                thoughtful, careful conversations.
              </Text>
            </View>
          </View>

          <View style={[styles.valueRow, styles.valueRowLast]}>
            <View style={styles.valueIcon}>
              <Heart size={24} color={ACCENT_PURPLE} />
            </View>
            <View style={styles.valueCopy}>
              <Text style={styles.featureTitle}>Meaningful connections</Text>
              <Text style={styles.featureDesc}>
                Profiles highlight intent, interests, and values before either
                person chooses to connect.
              </Text>
            </View>
          </View>
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
  missionStrip: {
    borderLeftWidth: 3,
    borderLeftColor: ACCENT_PINK,
    paddingLeft: 16,
    paddingVertical: 6,
    marginBottom: 18,
  },
  missionStripTitle: {
    color: WHITE,
    fontSize: 16,
    fontFamily: "DMSans-Bold",
    marginBottom: 6,
  },
  missionStripText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    lineHeight: 21,
  },
  valuesGroup: {
    marginTop: 4,
    marginBottom: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  valueRow: {
    flexDirection: "row",
    gap: 14,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  valueRowLast: {
    borderBottomWidth: 0,
  },
  valueIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(141, 105, 246, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  valueCopy: {
    flex: 1,
  },
  featureTitle: {
    color: WHITE,
    fontSize: 18,
    fontFamily: "DMSans-Bold",
    marginBottom: 6,
  },
  featureDesc: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontFamily: "DMSans-Regular",
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
