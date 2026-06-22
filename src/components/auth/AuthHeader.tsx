import { useAppTheme } from "@/src/theme";
import { useResponsive } from "@/src/hooks/useResponsive";
import React, { useMemo } from "react";
import { Image, Platform, StyleSheet, Text, View } from "react-native";

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
  const theme = useAppTheme();

  const { moderateScale } = useResponsive();

  const styles = useMemo(() => StyleSheet.create({
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
      shadowColor: theme.semanticColors.primary,
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
      color: theme.colors.neutral.white,
      textAlign: "center",
      marginBottom: moderateScale(12),
      fontFamily: theme.fontFamilies.header.semiBold,
      textShadowColor: `${theme.semanticColors.primary}99`, // 60% opacity
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 8,
      letterSpacing: Platform.select({ ios: -0.5, android: -0.3, web: -0.4 }),
    },
    subtitle: {
      fontSize: moderateScale(16),
      color: `${theme.colors.neutral.white}E6`, // 90% opacity
      textAlign: "center",
      lineHeight: moderateScale(24),
      fontFamily: theme.fontFamilies.header.medium,
      letterSpacing: Platform.select({ ios: 0.2, android: 0.15, web: 0.2 }),
    },
  }), [moderateScale, theme]);

  return (
    <View style={styles.container}>
      {showLogo && (
        <View style={styles.logoWrap}>
          <Image
            source={require("@/assets/images/brand/logo-no-bg.png")}
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
