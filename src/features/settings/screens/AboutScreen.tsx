import {
  SettingsScreenScaffold,
  SettingsSectionTitle,
} from "@/src/components/settings/SettingsScreenScaffold";
import { useTheme, withAlpha } from "@/src/theme";
import { Globe, Heart, Shield, Sparkles } from "lucide-react-native";
import React from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function AboutScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <SettingsScreenScaffold title="About">
      <View style={styles.logoSection}>
        <View style={styles.logoBg}>
          <Heart size={48} color={colors.primary} fill={colors.primary} />
        </View>
        <Text style={styles.appName}>PinayMate</Text>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>

      <Text style={styles.description}>
        PinayMate is a modern dating platform designed to connect Filipina women
        with foreign men seeking meaningful relationships. Our mission is to
        create authentic connections based on shared values and mutual respect.
      </Text>

      <SettingsSectionTitle>Product Values</SettingsSectionTitle>
      <FeatureCard
        icon={Shield}
        title="Safe & Secure"
        description="Your privacy and safety are our top priorities. We use security measures to protect your data."
      />
      <FeatureCard
        icon={Sparkles}
        title="Verified Profiles"
        description="Profiles go through verification to support authenticity and create a trusted community."
      />
      <FeatureCard
        icon={Heart}
        title="Meaningful Connections"
        description="We focus on helping you find genuine relationships built on shared interests and values."
      />

      <TouchableOpacity
        style={styles.websiteBtn}
        onPress={() => Linking.openURL("https://pinaymate.com")}
        accessibilityRole="button"
        accessibilityLabel="Visit PinayMate website"
      >
        <Globe size={20} color={colors.onSecondary} />
        <Text style={styles.websiteBtnText}>Visit Our Website</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Copyright 2026 PinayMate. All rights reserved.
        </Text>
        <Text style={styles.footerText}>Made in the Philippines</Text>
      </View>
    </SettingsScreenScaffold>
  );
}

interface FeatureCardProps {
  icon: typeof Shield;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.featureCard}>
      <Icon size={32} color={colors.secondary} />
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDesc}>{description}</Text>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    logoSection: {
      alignItems: "center",
      marginBottom: 32,
      marginTop: 20,
    },
    logoBg: {
      alignItems: "center",
      backgroundColor: withAlpha(colors.primary, 0.15),
      borderColor: colors.primary,
      borderRadius: 50,
      borderWidth: 3,
      height: 100,
      justifyContent: "center",
      marginBottom: 16,
      width: 100,
    },
    appName: {
      color: colors.primary,
      fontFamily: "Lora-Bold",
      fontSize: 28,
      marginBottom: 4,
    },
    version: {
      color: withAlpha(colors.onPrimary, 0.62),
      fontFamily: "DMSans-Regular",
      fontSize: 14,
    },
    description: {
      color: withAlpha(colors.onPrimary, 0.86),
      fontFamily: "DMSans-Regular",
      fontSize: 15,
      lineHeight: 22,
      marginBottom: 12,
      textAlign: "center",
    },
    featureCard: {
      alignItems: "center",
      backgroundColor: colors.brandSurface,
      borderColor: colors.brandBorder,
      borderRadius: 16,
      borderWidth: 1,
      marginBottom: 16,
      padding: 20,
    },
    featureTitle: {
      color: colors.onPrimary,
      fontFamily: "DMSans-Bold",
      fontSize: 18,
      marginBottom: 8,
      marginTop: 12,
    },
    featureDesc: {
      color: withAlpha(colors.onPrimary, 0.72),
      fontFamily: "DMSans-Regular",
      fontSize: 14,
      lineHeight: 20,
      textAlign: "center",
    },
    websiteBtn: {
      alignItems: "center",
      backgroundColor: colors.secondary,
      borderRadius: 12,
      flexDirection: "row",
      gap: 8,
      justifyContent: "center",
      marginBottom: 32,
      marginTop: 16,
      minHeight: 52,
      padding: 16,
    },
    websiteBtnText: {
      color: colors.onSecondary,
      fontFamily: "DMSans-Bold",
      fontSize: 16,
    },
    footer: {
      alignItems: "center",
      gap: 4,
    },
    footerText: {
      color: withAlpha(colors.onPrimary, 0.52),
      fontFamily: "DMSans-Regular",
      fontSize: 12,
      textAlign: "center",
    },
  });
