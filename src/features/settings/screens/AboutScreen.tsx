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

export function AboutScreen() {
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
        >
          <ArrowLeft size={24} color={WHITE} />
        </TouchableOpacity>
        <Text style={styles.title}>About</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logoSection}>
          <View style={styles.logoBg}>
            <Heart size={48} color={ACCENT_PINK} fill={ACCENT_PINK} />
          </View>
          <Text style={styles.appName}>PinayMate</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <Text style={styles.description}>
          PinayMate is a modern dating platform designed to connect Filipina
          women with foreign men seeking meaningful relationships. Our mission
          is to create authentic connections based on shared values and mutual
          respect.
        </Text>

        <View style={styles.featureCard}>
          <Shield size={32} color={ACCENT_PURPLE} />
          <Text style={styles.featureTitle}>Safe & Secure</Text>
          <Text style={styles.featureDesc}>
            Your privacy and safety are our top priorities. We use advanced
            security measures to protect your data.
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Sparkles size={32} color={ACCENT_PURPLE} />
          <Text style={styles.featureTitle}>Verified Profiles</Text>
          <Text style={styles.featureDesc}>
            All profiles go through a verification process to ensure
            authenticity and create a trusted community.
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Heart size={32} color={ACCENT_PURPLE} />
          <Text style={styles.featureTitle}>Meaningful Connections</Text>
          <Text style={styles.featureDesc}>
            We focus on helping you find genuine relationships built on shared
            interests and values.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.websiteBtn}
          onPress={() => Linking.openURL("https://pinaymate.com")}
        >
          <Globe size={20} color={WHITE} />
          <Text style={styles.websiteBtnText}>Visit Our Website</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 PinayMate. All rights reserved.
          </Text>
          <Text style={styles.footerText}>Made with ❤️ in the Philippines</Text>
        </View>

        <View style={{ height: 40 }} />
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
    padding: 4,
  },
  title: {
    fontSize: 20,
    color: WHITE,
    fontFamily: "DMSans-Bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
    padding: 16,
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
