import AuthLayout from "@/src/components/auth/AuthLayout";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import { theme } from "@/src/theme";
import { useRouter } from "expo-router";
import { Heart, Users } from "lucide-react-native";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

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
          {/* Filipina Card */}
          <Pressable
            style={[
              styles.card,
              selectedType === "filipina" && styles.cardSelected,
            ]}
            onPress={() => setSelectedType("filipina")}
            accessible
            accessibilityRole="radio"
            accessibilityState={{ checked: selectedType === "filipina" }}
            accessibilityLabel="I am a Filipina woman"
          >
            <View
              style={[
                styles.iconCircle,
                selectedType === "filipina" && styles.iconCircleSelected,
              ]}
            >
              <Heart
                size={32}
                color={
                  selectedType === "filipina"
                    ? theme.colors.neutral.white
                    : theme.colors.amihan[500]
                }
                fill={
                  selectedType === "filipina"
                    ? theme.colors.neutral.white
                    : "transparent"
                }
                strokeWidth={2.5}
              />
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>I'm a Filipina</Text>
              <Text style={styles.cardDescription}>
                Looking to connect with foreign men for meaningful relationships
              </Text>
            </View>

            {selectedType === "filipina" && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </Pressable>

          {/* Foreign Man Card */}
          <Pressable
            style={[
              styles.card,
              selectedType === "foreigner" && styles.cardSelected,
            ]}
            onPress={() => setSelectedType("foreigner")}
            accessible
            accessibilityRole="radio"
            accessibilityState={{ checked: selectedType === "foreigner" }}
            accessibilityLabel="I am a foreign man"
          >
            <View
              style={[
                styles.iconCircle,
                selectedType === "foreigner" && styles.iconCircleSelected,
              ]}
            >
              <Users
                size={32}
                color={
                  selectedType === "foreigner"
                    ? theme.colors.neutral.white
                    : theme.colors.dalisay[500]
                }
                strokeWidth={2.5}
              />
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>I'm a Foreign Man</Text>
              <Text style={styles.cardDescription}>
                Seeking genuine connections with Filipina women
              </Text>
            </View>

            {selectedType === "foreigner" && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </Pressable>
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
  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.12)",
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  cardSelected: {
    backgroundColor: "rgba(141,105,246,0.15)",
    borderColor: theme.colors.dalisay[500],
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(239,62,120,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  iconCircleSelected: {
    backgroundColor: theme.colors.amihan[500],
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: theme.fontFamilies.header.semiBold,
    color: theme.colors.neutral.white,
    marginBottom: theme.spacing.xs,
  },
  cardDescription: {
    fontSize: 13,
    fontFamily: theme.fontFamilies.body.regular,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 19,
  },
  checkmark: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.dalisay[500],
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkText: {
    fontSize: 16,
    color: theme.colors.neutral.white,
    fontWeight: "bold",
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
