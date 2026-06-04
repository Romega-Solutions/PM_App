import { useReduceMotion } from "@/src/hooks/useReduceMotion";
import { theme, useTheme, withAlpha } from "@/src/theme";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), reduceMotion ? 300 : 1800);
    return () => clearTimeout(timer);
  }, [reduceMotion]);

  if (showSplash) {
    return (
      <View style={[styles.container, { backgroundColor: colors.brandBackground }]}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.brandBackground}
          translucent={false}
        />

        <LinearGradient
          colors={[colors.brandBackground, colors.secondaryDark, colors.brandBackground]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={[styles.logoWrap, { shadowColor: colors.primary }]}>
            <Image
              source={require("../assets/logo-no-bg.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text
            style={[
              styles.brandText,
              {
                color: colors.onPrimary,
                textShadowColor: withAlpha(colors.primary, 0.85),
              },
            ]}
          >
            PinayMate
          </Text>

          <Text style={[styles.tagline, { color: withAlpha(colors.onPrimary, 0.88) }]}>
            Elite Filipino Dating
          </Text>

          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.loader}
          />
        </LinearGradient>
      </View>
    );
  }

  const bypassAuth = process.env.EXPO_PUBLIC_BYPASS_AUTH === "true";
  return <Redirect href={bypassAuth ? "/(main)" : "/(auth)/welcome"} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
  },
  logoWrap: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.48,
    shadowRadius: 28,
    elevation: 14,
    marginBottom: theme.spacing.xl,
  },
  logo: {
    width: 140,
    height: 140,
  },
  brandText: {
    ...theme.textStyles.h1,
    fontFamily: theme.fontFamilies.logo.bold,
    letterSpacing: 0,
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  tagline: {
    ...theme.textStyles.body,
    fontFamily: theme.fontFamilies.header.medium,
    letterSpacing: 0,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
  },
  loader: {
    transform: [{ scale: Platform.OS === "ios" ? 1.15 : 1.3 }],
  },
});
