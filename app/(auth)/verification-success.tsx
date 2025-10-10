import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { CheckCircle, ChevronRight } from "lucide-react-native";
import React, { useEffect } from "react";
import {
  Dimensions,
  Image,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function VerificationSuccess() {
  const router = useRouter();

  useEffect(() => {
    // Auto-advance after 3 seconds
    const timer = setTimeout(() => {
      router.push("/(auth)/account-setup/basic-info");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

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
            width: 100,
            height: 100,
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
            style={{ width: 100, height: 100 }}
            resizeMode="contain"
          />
        </View>

        {/* Success Animation */}
        <View
          style={{
            backgroundColor: "rgba(34, 197, 94, 0.15)",
            borderRadius: 50,
            padding: 24,
            marginBottom: 40,
            borderWidth: 3,
            borderColor: "rgba(34, 197, 94, 0.4)",
            shadowColor: "#22c55e",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 25,
            elevation: 15,
          }}
        >
          <CheckCircle size={56} color="#22c55e" fill="#22c55e" />
        </View>

        {/* Success Message */}
        <View style={{ alignItems: "center", marginBottom: 50 }}>
          <Text
            style={{
              fontSize: Math.min(width * 0.08, 32),
              fontFamily: "PlayfairDisplay-Bold",
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

          <Text
            style={{
              fontSize: Math.min(width * 0.045, 18),
              fontFamily: "PlayfairDisplay-Regular",
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

        {/* Continue Button */}
        <View style={{ width: "100%" }}>
          <TouchableOpacity
            style={{
              borderRadius: 28,
              paddingVertical: 20,
              paddingHorizontal: 32,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#EF3E78",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.5,
              shadowRadius: 25,
              elevation: 15,
              width: "100%",
              minHeight: 60,
            }}
            onPress={() => router.push("/(auth)/account-setup/basic-info")}
            activeOpacity={0.85}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Continue to Profile Setup"
            accessibilityHint="Proceeds to account setup flow"
          >
            <LinearGradient
              colors={["#EF3E78", "#8D69F6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                borderRadius: 28,
              }}
            />
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 19,
                fontFamily: "PlayfairDisplay-SemiBold",
                fontWeight: "600",
                marginRight: 8,
                letterSpacing: 0.5,
                textShadowColor: "rgba(0, 0, 0, 0.3)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
                zIndex: 1,
              }}
            >
              Continue Setup
            </Text>
            <ChevronRight
              size={24}
              color="#FFFFFF"
              strokeWidth={2.5}
              style={{ zIndex: 1 }}
            />
          </TouchableOpacity>

          {/* Auto-advance notice */}
          <Text
            style={{
              color: "rgba(255, 255, 255, 0.6)",
              fontSize: 14,
              fontFamily: "PlayfairDisplay-Regular",
              textAlign: "center",
              marginTop: 16,
            }}
          >
            Automatically continuing in 3 seconds...
          </Text>
        </View>
      </View>
    </View>
  );
}
