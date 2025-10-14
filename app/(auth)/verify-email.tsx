// app/(auth)/verify-email.tsx
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Clock, Mail } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Linking,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SecondaryButton from "../../src/components/ui/SecondaryButton";

const { width, height } = Dimensions.get("window");

export default function VerifyEmail() {
  const router = useRouter();

  // brand fonts
  const [fontsLoaded] = useFonts({
    HelloParis: require("../../assets/fonts/hello-paris-sans/HelloParisSans-Bold.ttf"),
    Lora: require("../../assets/fonts/lora/Lora-SemiBold.ttf"),
    DMSans: require("../../assets/fonts/dm-sans/DMSans-Regular.ttf"),
  });

  const [countdown, setCountdown] = useState(6);

  // guards and timers
  const didNavigate = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTicker = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const goNext = useCallback(() => {
    if (didNavigate.current) return;
    didNavigate.current = true;
    clearTicker();
    router.replace("/(auth)/verification-success");
  }, [router]);

  // start ticker
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return 0; // do not navigate here
        return prev - 1;
      });
    }, 1000);

    return clearTicker; // cleanup on unmount or remount
  }, []);

  // navigate once when countdown hits 0
  useEffect(() => {
    if (countdown === 0) {
      goNext();
    }
  }, [countdown, goNext]);

  const openEmailApp = async () => {
    // pause while switching apps
    clearTicker();

    try {
      const gmailScheme = "googlegmail://";
      if (await Linking.canOpenURL(gmailScheme)) {
        await Linking.openURL(gmailScheme);
        return;
      }
      const mailto = "mailto:";
      if (await Linking.canOpenURL(mailto)) {
        await Linking.openURL(mailto);
        return;
      }
      await Linking.openURL("https://mail.google.com");
    } catch {
      // ignore
    } finally {
      // resume ticker if we have not navigated
      if (!didNavigate.current && !intervalRef.current) {
        intervalRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) return 0;
            return prev - 1;
          });
        }, 1000);
      }
    }
  };

  const handleBackToSignIn = () => {
    clearTicker();
    router.replace("/(auth)/signin");
  };

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#340839",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Brand Gradient Background */}
      <LinearGradient
        colors={["#340839", "#8D69F6", "#EF3E78", "#340839"]}
        locations={[0, 0.4, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
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
          {/* Heading - Lora */}
          <Text
            style={{
              fontSize: Math.min(width * 0.08, 32),
              fontFamily: "Lora",
              fontWeight: "600",
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

          {/* Body - DMSans */}
          <Text
            style={{
              fontSize: Math.min(width * 0.045, 18),
              fontFamily: "DMSans",
              fontWeight: "400",
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
            We sent a verification link to your email address.
            {"\n"}Tap the link to verify your account.
          </Text>

          {/* Countdown chip */}
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
                  fontFamily: "DMSans",
                  fontWeight: "400",
                  marginLeft: 8,
                }}
              >
                Auto advancing in {countdown}s
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={{ width: "100%", gap: 16 }}>
          {/* Open Email App */}
          <TouchableOpacity
            style={{
              borderRadius: Platform.select({ ios: 28, android: 26 }),
              height: Platform.select({ ios: 56, android: 52 }),
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#EF3E78",
              shadowOffset: { width: 0, height: 8 }, // fixed syntax here
              shadowOpacity: Platform.select({ ios: 0.5, android: 0.4 }),
              shadowRadius: 20,
              elevation: 12,
              width: "100%",
              overflow: "hidden",
            }}
            onPress={openEmailApp}
            activeOpacity={0.85}
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
              }}
            />
            <Mail
              size={20}
              color="#FFFFFF"
              strokeWidth={2.5}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: Platform.select({ ios: 18, android: 17 }),
                fontFamily: "DMSans",
                fontWeight: "700",
                letterSpacing: Platform.select({ ios: 0.5, android: 0.3 }),
                textShadowColor: "rgba(0, 0, 0, 0.3)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}
            >
              Open Email App
            </Text>
          </TouchableOpacity>

          {/* Resend Email */}
          <SecondaryButton
            title="Resend Email"
            variant="white"
            onPress={() => {
              // TODO: call resend API here
              clearTicker();
              setCountdown(6);
              if (!didNavigate.current && !intervalRef.current) {
                intervalRef.current = setInterval(() => {
                  setCountdown((prev) => {
                    if (prev <= 1) return 0;
                    return prev - 1;
                  });
                }, 1000);
              }
            }}
            accessibilityLabel="Resend Verification Email"
            accessibilityHint="Sends another verification email"
          />

          {/* Back to Sign In */}
          <TouchableOpacity
            style={{
              paddingVertical: 16,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={handleBackToSignIn}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Back to Sign In"
          >
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: 16,
                fontFamily: "DMSans",
                fontWeight: "400",
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
