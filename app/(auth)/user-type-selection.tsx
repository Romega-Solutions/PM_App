import AuthLayout from "@/src/components/auth/AuthLayout";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import { theme } from "@/src/theme";
import { useRouter } from "expo-router";
import {
  BadgeCheck,
  Check,
  Heart,
  ShieldCheck,
  Users,
} from "lucide-react-native";
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
          <Text style={styles.eyebrow}>Step 1 of profile setup</Text>
          <Text style={styles.title}>Choose your profile path</Text>
          <Text style={styles.subtitle}>
            This shapes your setup questions, safety reminders, and match
            expectations. Launch access currently supports Filipina women and
            foreign men profile paths; if that does not fit you, wait for
            broader eligibility before continuing.
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
            accessibilityHint="Selects the Filipina onboarding path"
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
                Set your boundaries, add profile details, and prepare for
                verification prompts before matching.
              </Text>
            </View>

            {selectedType === "filipina" && (
              <View style={styles.checkmark}>
                <Check
                  size={17}
                  color={theme.colors.neutral.white}
                  strokeWidth={3}
                />
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
            accessibilityHint="Selects the foreign man onboarding path"
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
                Create a respectful profile with clear intent and safety
                reminders before browsing matches.
              </Text>
            </View>

            {selectedType === "foreigner" && (
              <View style={styles.checkmark}>
                <Check
                  size={17}
                  color={theme.colors.neutral.white}
                  strokeWidth={3}
                />
              </View>
            )}
          </Pressable>
        </View>

        {/* Info Banner */}
        <View
          style={styles.infoBanner}
          accessible
          accessibilityLabel="Community trust note. PinayMate uses this choice to tailor onboarding and safety prompts."
        >
          <ShieldCheck size={18} color={theme.colors.amihan[300]} />
          <Text style={styles.infoText}>
            PinayMate keeps this step simple so setup feels relevant, not
            intrusive. Matching does not begin until your profile is ready.
          </Text>
        </View>

        <View style={styles.trustRow}>
          <View style={styles.trustItem}>
            <BadgeCheck size={15} color={theme.colors.neutral.white} />
            <Text style={styles.trustText}>Verification-ready</Text>
          </View>
          <View style={styles.trustItem}>
            <Users size={15} color={theme.colors.neutral.white} />
            <Text style={styles.trustText}>Profile-first</Text>
          </View>
        </View>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title="Continue"
            onPress={handleContinue}
            disabled={!selectedType}
            showChevron
            accessibilityLabel={
              selectedType
                ? "Continue to account signup"
                : "Choose a profile type before continuing"
            }
            accessibilityHint="Continues to signup after a profile type is selected"
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
  eyebrow: {
    fontSize: 12,
    fontFamily: theme.fontFamilies.body.semiBold,
    color: theme.colors.amihan[300],
    textTransform: "uppercase",
    letterSpacing: 0,
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: 30,
    fontFamily: theme.fontFamilies.header.bold,
    color: theme.colors.neutral.white,
    textAlign: "center",
    marginBottom: theme.spacing.xs,
    lineHeight: 36,
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
    minHeight: 124,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.12)",
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    shadowColor: theme.colors.amihan[500],
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4,
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
  infoBanner: {
    backgroundColor: "rgba(141,105,246,0.12)",
    borderRadius: 14,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: "rgba(141,105,246,0.25)",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: theme.fontFamilies.body.regular,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 19,
  },
  trustRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: theme.spacing.lg,
  },
  trustItem: {
    minHeight: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  trustText: {
    color: "rgba(255,255,255,0.9)",
    fontFamily: theme.fontFamilies.body.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  buttonContainer: {
    paddingBottom: moderateScale(20),
  },
});
