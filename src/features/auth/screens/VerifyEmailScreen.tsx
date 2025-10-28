import VerifyEmailActions from "@/src/components/auth/VerifyEmailActions";
import VerifyEmailHeader from "@/src/components/auth/VerifyEmailHeader";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  StatusBar,
  View,
} from "react-native";

export default function VerifyEmailScreen() {
  const router = useRouter();

  // ✅ Receive ALL params from signup
  const params = useLocalSearchParams<{
    email?: string;
    firstName?: string;
    userType?: string;
  }>();

  const { email, firstName, userType } = params;

  const [countdown, setCountdown] = useState(6);
  const didNavigate = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // load brand fonts (safe to call here)
  const [fontsLoaded] = useFonts({
    HelloParis: require("@/assets/fonts/hello-paris-sans/HelloParisSans-Bold.ttf"),
    Lora: require("@/assets/fonts/lora/Lora-SemiBold.ttf"),
    DMSans: require("@/assets/fonts/dm-sans/DMSans-Regular.ttf"),
  });

  const clearTicker = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const goNext = useCallback(() => {
    if (didNavigate.current) return;
    didNavigate.current = true;
    clearTicker();

    // ✅ Pass firstName and userType to verification success
    console.log("📧 Navigating to verification success with params:", {
      firstName,
      userType,
    });

    router.replace({
      pathname: "/(auth)/verification-success",
      params: {
        firstName: firstName || "",
        userType: userType || "",
      },
    });
  }, [clearTicker, router, firstName, userType]);

  useEffect(() => {
    // start countdown
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => clearTicker();
  }, [clearTicker]);

  useEffect(() => {
    if (countdown === 0) goNext();
  }, [countdown, goNext]);

  const openEmailApp = async () => {
    clearTicker();
    try {
      const gmailScheme = "googlegmail://";
      const mailto = "mailto:";
      if (await Linking.canOpenURL(gmailScheme)) {
        await Linking.openURL(gmailScheme);
        return;
      }
      if (await Linking.canOpenURL(mailto)) {
        await Linking.openURL(mailto);
        return;
      }
      await Linking.openURL("https://mail.google.com");
    } catch {
      // ignore errors
    } finally {
      if (!didNavigate.current && !intervalRef.current) {
        intervalRef.current = setInterval(() => {
          setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
        }, 1000);
      }
    }
  };

  const handleResend = () => {
    // TODO: call API to resend verification email
    clearTicker();
    setCountdown(6);
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
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
          justifyContent: "center",
          alignItems: "center",
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
        translucent
        backgroundColor="transparent"
      />

      <LinearGradient
        colors={["#340839", "#8D69F6", "#EF3E78", "#340839"]}
        locations={[0, 0.4, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 32,
          paddingTop: Platform.select({ ios: 72, android: 56 }),
        }}
      >
        <VerifyEmailHeader email={email ?? null} />

        <VerifyEmailActions
          countdown={countdown}
          onOpenEmailApp={openEmailApp}
          onResend={handleResend}
          onBackToSignIn={handleBackToSignIn}
        />
      </View>
    </View>
  );
}
