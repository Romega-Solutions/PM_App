import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { CheckCircle } from "lucide-react-native";
import React, { useEffect } from "react";
import {
  Dimensions,
  Image,
  Platform,
  StatusBar,
  Text,
  View,
} from "react-native";
import PrimaryButton from "../../src/components/ui/PrimaryButton";

const { width, height } = Dimensions.get("window");

export default function VerificationSuccess() {
  const router = useRouter();

  useEffect(() => {
    // Auto-advance after 3 seconds
    const timer = setTimeout(() => {
      router.push("/(auth)/account-setup/basic-info");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* Brand Gradient Background */}
      <LinearGradient
        colors={[
          "#340839", // Deep purple at top
          "#8D69F6", // Purple in middle
          "#EF3E78", // Pink accent
          "#340839", // Deep purple at bottom
        ]}
        locations={[0, 0.4, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      {/* Content Container */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 32,
          paddingTop: Platform.select({
            ios: height * 0.1,
            android: height * 0.08,
          }),
        }}
      >
        {/* Logo */}
        <View
          style={{
            width: 150,
            height: 150,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 40,
            shadowColor: "#EF3E78",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 25,
            elevation: 12,
          }}
        >
          <Image
            source={require("../../assets/logo-no-bg.png")}
            style={{ width: 150, height: 150 }}
            resizeMode="contain"
          />
        </View>

        {/* Success Check Icon with Glow */}
        <View
          style={{
            backgroundColor: "rgba(34, 197, 94, 0.15)",
            borderRadius: 50,
            padding: 24,
            marginBottom: 32,
            borderWidth: 2,
            borderColor: "rgba(34, 197, 94, 0.3)",
            shadowColor: "#22c55e",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 20,
            elevation: 12,
          }}
        >
          <CheckCircle size={48} color="#22c55e" strokeWidth={2} />
        </View>

        {/* Success Message */}
        <View style={{ alignItems: "center", marginBottom: 50 }}>
          {/* Main heading - Using HelloParis for UI elements */}
          <Text
            style={{
              fontSize: Math.min(width * 0.08, 32),
              fontFamily: "HelloParis",
              fontWeight: "700",
              color: "#FFFFFF",
              textAlign: "center",
              marginBottom: 16,
              textShadowColor: "rgba(0, 0, 0, 0.8)",
              textShadowOffset: { width: 0, height: 3 },
              textShadowRadius: 10,
              letterSpacing: -0.5,
            }}
          >
            Verified Successfully!
          </Text>

          {/* Description text - Using PlayfairDisplay for body text */}
          <Text
            style={{
              fontSize: Math.min(width * 0.045, 18),
              fontFamily: "PlayfairDisplay",
              fontWeight: "400",
              color: "rgba(255, 255, 255, 0.9)",
              textAlign: "center",
              lineHeight: 26,
              paddingHorizontal: 20,
              textShadowColor: "rgba(0, 0, 0, 0.6)",
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 6,
            }}
          >
            Great! Your email is verified.{"\n"}Let's set up your profile now.
          </Text>
        </View>

        {/* Continue Button - Using PrimaryButton */}
        <View style={{ width: "100%", gap: 16 }}>
          <PrimaryButton
            title="Continue Setup"
            onPress={() => router.push("/(auth)/account-setup/basic-info")}
            accessibilityLabel="Continue to Profile Setup"
            accessibilityHint="Proceeds to account setup flow"
          />

          {/* Auto-advance notice - Using PlayfairDisplay for body text */}
          <Text
            style={{
              color: "rgba(255, 255, 255, 0.6)",
              fontSize: 14,
              fontFamily: "PlayfairDisplay",
              fontWeight: "400",
              textAlign: "center",
            }}
          >
            Automatically continuing in 3 seconds...
          </Text>
        </View>
      </View>
    </View>
  );
}
