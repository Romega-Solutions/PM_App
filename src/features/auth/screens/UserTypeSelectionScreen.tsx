import AuthLayout from "@/src/components/auth/AuthLayout";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import { theme, useTheme, withAlpha, type SemanticColors } from "@/src/theme";
import { useRouter } from "expo-router";
import type { LucideIcon } from "lucide-react-native";
import { Check, Heart, Shield, Users } from "lucide-react-native";
import React, { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

type UserType = "filipina" | "foreigner";

type UserTypeOption = {
  type: UserType;
  title: string;
  description: string;
  accessibilityLabel: string;
  accessibilityHint: string;
  Icon: LucideIcon;
  selectedFill?: boolean;
  tint: (colors: SemanticColors) => string;
};

const USER_TYPE_OPTIONS: UserTypeOption[] = [
  {
    type: "filipina",
    title: "I'm a Filipina",
    description:
      "Looking to connect with foreign men for meaningful relationships",
    accessibilityLabel: "I am a Filipina woman",
    accessibilityHint: "Selects the Filipina account experience",
    Icon: Heart,
    selectedFill: true,
    tint: (colors) => colors.primary,
  },
  {
    type: "foreigner",
    title: "I'm a Foreign Man",
    description: "Seeking genuine connections with Filipina women",
    accessibilityLabel: "I am a foreign man",
    accessibilityHint: "Selects the foreign man account experience",
    Icon: Users,
    tint: (colors) => colors.secondary,
  },
];

export default function UserTypeSelectionScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);
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
        <View style={styles.logoWrap}>
          <Image
            source={require("@/assets/logo-no-bg.png")}
            style={styles.logo}
            resizeMode="contain"
            accessible
            accessibilityLabel="PinayMate logo"
          />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Who are you?</Text>
          <Text style={styles.subtitle}>
            This helps us create the perfect experience for you
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          {USER_TYPE_OPTIONS.map((option) => {
            const selected = selectedType === option.type;
            const tint = option.tint(colors);
            const Icon = option.Icon;

            return (
              <Pressable
                key={option.type}
                style={({ pressed }) => [
                  styles.card,
                  selected && styles.cardSelected,
                  pressed && styles.cardPressed,
                ]}
                onPress={() => setSelectedType(option.type)}
                accessible
                accessibilityRole="radio"
                accessibilityState={{ checked: selected, selected }}
                accessibilityLabel={option.accessibilityLabel}
                accessibilityHint={option.accessibilityHint}
              >
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: withAlpha(tint, 0.15) },
                    selected && { backgroundColor: tint },
                  ]}
                >
                  <Icon
                    size={32}
                    color={selected ? colors.onPrimary : tint}
                    fill={
                      option.selectedFill && selected
                        ? colors.onPrimary
                        : "transparent"
                    }
                    strokeWidth={2.5}
                  />
                </View>

                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{option.title}</Text>
                  <Text style={styles.cardDescription}>
                    {option.description}
                  </Text>
                </View>

                {selected ? (
                  <View style={styles.checkmark}>
                    <Check size={16} color={colors.onSecondary} strokeWidth={3} />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <View
          style={styles.infoBanner}
          accessible
          accessibilityRole="text"
          accessibilityLabel="Your selection helps us match you with compatible partners and support a safe community"
        >
          <Shield size={16} color={colors.secondary} style={styles.infoIcon} />
          <Text style={styles.infoText}>
            Your selection helps us match you with compatible partners and
            support a safe community
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <PrimaryButton
            title="Continue"
            onPress={handleContinue}
            disabled={!selectedType}
            showChevron
            accessibilityHint="Continues to account creation after selecting your account type"
          />
        </View>
      </View>
    </AuthLayout>
  );
}

const createStyles = (colors: SemanticColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: theme.spacing.lg,
    },
    logoWrap: {
      alignItems: "center",
      marginBottom: theme.spacing.md,
    },
    logo: {
      aspectRatio: 1.8,
      height: 78,
      width: 140,
    },
    header: {
      alignItems: "center",
      marginBottom: theme.spacing.lg,
    },
    title: {
      color: colors.onPrimary,
      fontFamily: theme.fontFamilies.header.bold,
      fontSize: 32,
      marginBottom: theme.spacing.xs,
      textAlign: "center",
    },
    subtitle: {
      color: withAlpha(colors.onPrimary, 0.75),
      fontFamily: theme.fontFamilies.body.regular,
      fontSize: 15,
      lineHeight: 22,
      paddingHorizontal: theme.spacing.md,
      textAlign: "center",
    },
    cardsContainer: {
      gap: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    card: {
      alignItems: "center",
      backgroundColor: colors.brandSurface,
      borderColor: colors.brandBorder,
      borderRadius: theme.borderRadius.xl,
      borderWidth: 2,
      flexDirection: "row",
      minHeight: 112,
      padding: theme.spacing.lg,
      position: "relative",
    },
    cardSelected: {
      backgroundColor: withAlpha(colors.secondary, 0.15),
      borderColor: colors.secondary,
    },
    cardPressed: {
      opacity: 0.88,
    },
    iconCircle: {
      alignItems: "center",
      borderRadius: 32,
      height: 64,
      justifyContent: "center",
      marginRight: theme.spacing.md,
      width: 64,
    },
    cardContent: {
      flex: 1,
      paddingRight: theme.spacing.md,
    },
    cardTitle: {
      color: colors.onPrimary,
      fontFamily: theme.fontFamilies.header.semiBold,
      fontSize: 18,
      marginBottom: theme.spacing.xs,
    },
    cardDescription: {
      color: withAlpha(colors.onPrimary, 0.7),
      fontFamily: theme.fontFamilies.body.regular,
      fontSize: 13,
      lineHeight: 19,
    },
    checkmark: {
      alignItems: "center",
      backgroundColor: colors.secondary,
      borderRadius: 14,
      height: 28,
      justifyContent: "center",
      position: "absolute",
      right: 12,
      top: 12,
      width: 28,
    },
    infoBanner: {
      alignItems: "flex-start",
      backgroundColor: withAlpha(colors.secondary, 0.12),
      borderColor: withAlpha(colors.secondary, 0.25),
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      flexDirection: "row",
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
      padding: theme.spacing.md,
    },
    infoIcon: {
      marginTop: 1,
    },
    infoText: {
      color: withAlpha(colors.onPrimary, 0.85),
      flex: 1,
      fontFamily: theme.fontFamilies.body.regular,
      fontSize: 13,
      lineHeight: 19,
      textAlign: "left",
    },
    buttonContainer: {
      paddingBottom: theme.spacing.md,
    },
  });
