import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ChevronRight, Clock, Mail } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Linking,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function VerifyEmail() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(6);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Auto-advance after 6 seconds for demonstration
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Clear the timer before navigation
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          // Use setTimeout to navigate on next tick
          setTimeout(() => {
            router.push("/(auth)/verification-success");
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000) as any;

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [router]);

  const openEmailApp = async () => {
    try {
      // Try to open Gmail app first
      const gmailURL = Platform.select({
        ios: "googlegmail://",
        android: "com.google.android.gm",
      });

      if (gmailURL) {
        const canOpen = await Linking.canOpenURL(gmailURL);
        if (canOpen) {
          await Linking.openURL(gmailURL);
          return;
        }
      }

      // Fallback to web Gmail
      await Linking.openURL("https://mail.google.com");
    } catch (error) {
      // Final fallback to device's default email app
      const emailURL = Platform.select({
        ios: "message://",
        android: "mailto:",
      });
      if (emailURL) {
        await Linking.openURL(emailURL);
      }
    }
  };

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
            width: 120,
            height: 120,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 40,
            shadowColor: "#EF3E78",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 30,
            elevation: 15,
          }}
        >
          <Image
            source={require("../../assets/logo-no-bg.png")}
            style={{ width: 120, height: 120 }}
            resizeMode="contain"
          />
        </View>

        {/* Email Icon with Glow */}
        <View
          style={{
            backgroundColor: "rgba(239, 62, 120, 0.15)",
            borderRadius: 50,
            padding: 24,
            marginBottom: 32,
            borderWidth: 2,
            borderColor: "rgba(239, 62, 120, 0.3)",
            shadowColor: "#EF3E78",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 20,
            elevation: 12,
          }}
        >
          <Mail size={48} color="#EF3E78" strokeWidth={2} />
        </View>

        {/* Main Content */}
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
            Check Your Email
          </Text>

          <Text
            style={{
              fontSize: Math.min(width * 0.045, 18),
              fontFamily: "PlayfairDisplay-Regular",
              color: "rgba(255, 255, 255, 0.9)",
              textAlign: "center",
              lineHeight: 26,
              paddingHorizontal: 20,
              marginBottom: 32,
              textShadowColor: "rgba(0, 0, 0, 0.6)",
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 6,
            }}
          >
            We've sent a verification link to your email address.{"\n"}
            Click the link to verify your account.
          </Text>

          {/* Countdown Timer */}
          {countdown > 0 && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                marginBottom: 32,
              }}
            >
              <Clock size={16} color="rgba(255, 255, 255, 0.7)" />
              <Text
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  fontSize: 14,
                  fontFamily: "PlayfairDisplay-Regular",
                  marginLeft: 8,
                }}
              >
                Auto-advancing in {countdown}s
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={{ width: "100%", gap: 16 }}>
          {/* Open Email App Button */}
          <TouchableOpacity
            style={{
              borderRadius: 28,
              paddingVertical: 18,
              paddingHorizontal: 32,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#EF3E78",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.5,
              shadowRadius: 20,
              elevation: 12,
              width: "100%",
              minHeight: 56,
            }}
            onPress={openEmailApp}
            activeOpacity={0.85}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Open Email App"
            accessibilityHint="Opens your email application"
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
            <Mail
              size={20}
              color="#FFFFFF"
              strokeWidth={2.5}
              style={{ marginRight: 8, zIndex: 1 }}
            />
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 18,
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
              Open Email App
            </Text>
            <ChevronRight
              size={20}
              color="#FFFFFF"
              strokeWidth={2.5}
              style={{ zIndex: 1 }}
            />
          </TouchableOpacity>

          {/* Resend Email Button */}
          <TouchableOpacity
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: 28,
              paddingVertical: 18,
              paddingHorizontal: 32,
              borderWidth: 1.5,
              borderColor: "rgba(255, 255, 255, 0.3)",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              minHeight: 56,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 6,
            }}
            onPress={() => {
              // Handle resend email logic here
              console.log("Resend email");
            }}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Resend Verification Email"
            accessibilityHint="Sends another verification email"
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 18,
                fontFamily: "PlayfairDisplay-SemiBold",
                fontWeight: "600",
                letterSpacing: 0.5,
                textShadowColor: "rgba(0, 0, 0, 0.5)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}
            >
              Resend Email
            </Text>
          </TouchableOpacity>

          {/* Back to Sign In */}
          <TouchableOpacity
            style={{
              paddingVertical: 16,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => router.push("/(auth)/signin")}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Back to Sign In"
          >
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: 16,
                fontFamily: "PlayfairDisplay-Regular",
                textDecorationLine: "underline",
              }}
            >
              Back to Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
