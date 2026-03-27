import { theme, colors, semanticColors } from "@/src/theme";
import React from "react";
import { Dimensions, Image, Platform, StyleSheet, Text, View } from "react-native";

const { width } = Dimensions.get("window");
const scale = (size: number) => (width / 375) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
}

export default function AuthHeader({
  title,
  subtitle,
  showLogo = true,
}: AuthHeaderProps) {
  return (
    <View style={styles.container}>
      {showLogo && (
        <View style={styles.logoWrap}>
          <Image
            source={require("@/assets/logo-no-bg.png")}
            style={styles.logo}
            resizeMode="contain"
            accessible
            accessibilityLabel="PinayMate logo"
          />
        </View>
      )}

      <Text style={styles.title}>{title}</Text>

      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: moderateScale(40),
    paddingHorizontal: theme.spacing.lg,
  },
  logoWrap: {
    width: moderateScale(100),
    height: moderateScale(100),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
    shadowColor: semanticColors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 15,
  },
  logo: {
    width: moderateScale(100),
    height: moderateScale(100),
  },
  title: {
    fontSize: moderateScale(36),
    color: colors.neutral.white,
    textAlign: "center",
    marginBottom: moderateScale(12),
    fontFamily: theme.fontFamilies.header.semiBold,
    textShadowColor: `${semanticColors.primary}99`, // 60% opacity
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: Platform.select({ ios: -0.5, android: -0.3, web: -0.4 }),
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: `${colors.neutral.white}E6`, // 90% opacity
    textAlign: "center",
    lineHeight: moderateScale(24),
    fontFamily: theme.fontFamilies.header.medium,
    letterSpacing: Platform.select({ ios: 0.2, android: 0.15, web: 0.2 }),
  },
});