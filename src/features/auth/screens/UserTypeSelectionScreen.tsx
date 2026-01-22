/**
 * UserTypeSelectionScreen
 *
 * Screen for selecting user type (Filipina or Foreign Man).
 * First step in the signup flow.
 *
 * Features:
 * - Logo display
 * - Two selection cards
 * - Info banner about selection purpose
 * - Continue button (disabled until selection made)
 */

import AuthLayout from "@/src/components/auth/AuthLayout";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import { theme } from "@/src/theme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import { UserTypeCard } from "../components/UserTypeCard";

const { width } = Dimensions.get("window");
const scale = (size: number) => (width / 375) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

type UserType = "filipina" | "foreigner";

export default function UserTypeSelectionScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<UserType | null>(null);

  const handleContinue = () => {
    if (!selectedType) return;
    router.push({
      pathname: "/(auth)/signup",
      params: { userType: selectedType },
    });
  };

  return (
    <AuthLayout showBackButton={false}>
      <View style={styles.container}>
        {/* Logo */}
        <View style={styles.logoWrap}>
          <Image
            source={require("@/assets/logo-no-bg.png")}
            style={styles.logo}
            resizeMode="contain"
            accessible
            accessibilityLabel="PinayMate logo"
          />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Who are you?</Text>
          <Text style={styles.subtitle}>
            This helps us create the perfect experience for you
          </Text>
        </View>

        {/* User Type Cards */}
        <View style={styles.cardsContainer}>
          <UserTypeCard
            type="filipina"
            title="I'm a Filipina"
            description="Looking to connect with foreign men for meaningful relationships"
            isSelected={selectedType === "filipina"}
            onSelect={() => setSelectedType("filipina")}
          />

          <UserTypeCard
            type="foreigner"
            title="I'm a Foreign Man"
            description="Seeking genuine connections with Filipina women"
            isSelected={selectedType === "foreigner"}
            onSelect={() => setSelectedType("foreigner")}
          />
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoText}>
            🔒 Your selection helps us match you with compatible partners and
            ensure a safe community
          </Text>
        </View>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title="Continue"
            onPress={handleContinue}
            disabled={!selectedType}
            showChevron
          />
        </View>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  logoWrap: {
    alignItems: "center",
    marginTop: moderateScale(8),
    marginBottom: theme.spacing.md,
  },
  logo: {
    width: Math.min(140, width * 0.4),
    height: undefined,
    aspectRatio: 1.8,
  },
  header: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 32,
    fontFamily: theme.fontFamilies.header.bold,
    color: theme.colors.neutral.white,
    textAlign: "center",
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: theme.fontFamilies.body.regular,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: theme.spacing.md,
  },
  cardsContainer: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  infoBanner: {
    backgroundColor: "rgba(141,105,246,0.12)",
    borderRadius: 14,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: "rgba(141,105,246,0.25)",
  },
  infoText: {
    fontSize: 13,
    fontFamily: theme.fontFamilies.body.regular,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    lineHeight: 19,
  },
  buttonContainer: {
    paddingBottom: moderateScale(12),
  },
});
