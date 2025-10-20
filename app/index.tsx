import { colors, semanticColors, theme } from "@/src/theme";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

// Responsive sizing helper
const scale = (size: number) => (width / 375) * size; // Based on iPhone X width
const verticalScale = (size: number) => (height / 812) * size; // Based on iPhone X height

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.dalisay[950]}
          translucent={false}
        />

        <LinearGradient
          colors={[colors.dalisay[950], colors.dalisay[500]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Logo Container */}
          <View style={styles.logoWrap}>
            <Image
              source={require("../assets/logo-no-bg.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Brand Name */}
          <Text style={styles.brandText}>PinayMate</Text>

          {/* Tagline */}
          <Text style={styles.tagline}>Elite Filipino Dating</Text>

          {/* Loading Indicator */}
          <ActivityIndicator
            size="large"
            color={semanticColors.primary}
            style={styles.loader}
          />
        </LinearGradient>
      </View>
    );
  }

  return <Redirect href="/(auth)/welcome" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dalisay[950],
  },

  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
  },

  logoWrap: {
    shadowColor: semanticColors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 15,
    marginBottom: verticalScale(28),
  },

  logo: {
    width: scale(140),
    height: scale(140),
  },

  brandText: {
    color: colors.neutral.white,
    fontSize: scale(40),
    fontFamily: theme.fontFamilies.logo.bold,
    letterSpacing: 1.2,
    textShadowColor: `${semanticColors.primary}D9`, // 85% opacity
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
    marginBottom: verticalScale(18),
    textAlign: "center",
  },

  tagline: {
    color: colors.neutral.white,
    opacity: 0.88,
    fontSize: scale(15),
    fontFamily: theme.fontFamilies.header.medium,
    letterSpacing: 0.6,
    textAlign: "center",
    marginBottom: verticalScale(28),
    paddingHorizontal: theme.spacing.xl,
  },

  loader: {
    transform: [{ scale: Platform.OS === "ios" ? 1.15 : 1.3 }],
  },
});
