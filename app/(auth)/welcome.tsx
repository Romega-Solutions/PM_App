import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  Platform,
  StatusBar,
  Text,
  View,
} from "react-native";
import PrimaryButton from "../../src/components/ui/PrimaryButton";
import SecondaryButton from "../../src/components/ui/SecondaryButton";

const { width, height } = Dimensions.get("window");

export default function Welcome() {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* Hero Background Image - Full Screen */}
      <View style={{ flex: 1, position: "relative" }}>
        <Image
          source={require("../../assets/welcome.jpg")}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
          }}
          resizeMode="cover"
          accessible={true}
          accessibilityLabel="Beautiful Filipino couple representing love and connection"
          accessibilityRole="image"
        />

        {/* Gradient Overlay - Brand Colors */}
        <LinearGradient
          colors={[
            "rgba(52, 8, 57, 0.1)", // #340839 - deep purple (top, lighter)
            "rgba(141, 105, 246, 0.2)", // #8D69F6 - purple (middle, subtle)
            "rgba(52, 8, 57, 0.75)", // #340839 - deep purple (bottom, stronger)
            "rgba(52, 8, 57, 0.95)", // #340839 - deep purple (very bottom)
          ]}
          locations={[0, 0.3, 0.7, 1]}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />

        {/* Content Container - Full Screen with Status Bar */}
        <View
          style={{
            flex: 1,
            justifyContent: "space-between",
            paddingHorizontal: 24,
            paddingTop: Platform.select({
              ios: height * 0.12, // More space for status bar
              android: height * 0.1,
            }),
            paddingBottom: Platform.select({ ios: 40, android: 32 }),
            zIndex: 2,
          }}
        >
          {/* Header Section */}
          <View
            style={{
              alignItems: "center",
              flex: 1,
              justifyContent: "center",
            }}
          >
            {/* Logo Container - Brand Glow */}
            <View
              style={{
                width: 200,
                height: 200,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 40,
                shadowColor: "#EF3E78", // Pink accent
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 40,
                elevation: 20,
              }}
              accessible={true}
              accessibilityRole="image"
              accessibilityLabel="PinayMate logo"
            >
              <Image
                source={require("../../assets/logo-no-bg.png")}
                style={{
                  width: 200,
                  height: 200,
                }}
                resizeMode="contain"
              />
            </View>

            {/* Main Message */}
            <View
              style={{ alignItems: "center", marginBottom: 32 }}
              accessible={true}
              accessibilityRole="header"
            >
              <Text
                style={{
                  fontSize: Math.min(width * 0.095, 40),
                  fontFamily: "HelloParis",
                  fontWeight: "700",
                  color: "#FFFFFF",
                  textAlign: "center",
                  lineHeight: Math.min(width * 0.115, 48),
                  marginBottom: 20,
                  textShadowColor: "rgba(239, 62, 120, 0.5)", // Pink glow
                  textShadowOffset: { width: 0, height: 3 },
                  textShadowRadius: 12,
                  letterSpacing: -0.5,
                  paddingHorizontal: 10,
                }}
              >
                Find Love in the{"\n"}Filipino Community
              </Text>

              <Text
                style={{
                  fontSize: Math.min(width * 0.043, 17),
                  fontFamily: "PlayfairDisplay",
                  fontWeight: "400",
                  color: "rgba(255, 255, 255, 0.95)",
                  textAlign: "center",
                  lineHeight: Math.min(width * 0.063, 25),
                  paddingHorizontal: 16,
                  textShadowColor: "rgba(0, 0, 0, 0.6)",
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 8,
                }}
              >
                Connect with verified Filipino singles{"\n"}worldwide. Start
                meaningful relationships today.
              </Text>
            </View>
          </View>

          {/* Action Buttons - Using Custom Components */}
          <View style={{ gap: 14 }}>
            {/* Primary CTA - Brand Gradient */}
            <PrimaryButton
              title="Create Account"
              onPress={() => router.push("/(auth)/signup")}
              accessibilityLabel="Create Account"
              accessibilityHint="Sign up to start finding matches"
            />

            {/* Secondary CTA - Outline with Brand Colors */}
            <SecondaryButton
              title="Sign In"
              variant="purple"
              onPress={() => router.push("/(auth)/signin")}
              accessibilityLabel="Sign In"
              accessibilityHint="Log in to your existing account"
            />

            {/* Terms and Privacy */}
            <Text
              style={{
                fontSize: 12,
                fontFamily: "PlayfairDisplay",
                fontWeight: "400",
                color: "rgba(255, 255, 255, 0.65)",
                textAlign: "center",
                lineHeight: 17,
                marginTop: 16,
                paddingHorizontal: 16,
                textShadowColor: "rgba(0, 0, 0, 0.5)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}
              accessible={true}
              accessibilityRole="text"
            >
              By continuing, you agree to our Terms of Service{"\n"}and Privacy
              Policy
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
