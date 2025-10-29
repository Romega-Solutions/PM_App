import VerifyEmailActions from "@/src/components/auth/VerifyEmailActions";
import VerifyEmailHeader from "@/src/components/auth/VerifyEmailHeader";
import { supabase } from "@/src/config/supabase";
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

  const params = useLocalSearchParams<{
    email?: string;
    firstName?: string;
    userType?: string;
  }>();

  const { email, firstName, userType } = params;

  const [countdown, setCountdown] = useState(60); // Increased to 60 seconds
  const didNavigate = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Listen for authentication state changes
  useEffect(() => {
    console.log("👂 Setting up auth state listener...");

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔔 Auth event:", event);

        if (event === "SIGNED_IN" && session?.user) {
          console.log("✅ User signed in, email verified!");

          // Check if email is confirmed
          if (session.user.email_confirmed_at) {
            console.log("✅ Email confirmed, navigating to next screen");
            goNext();
          }
        }
      }
    );

    return () => {
      console.log("🧹 Cleaning up auth listener");
      authListener.subscription.unsubscribe();
    };
  }, [goNext]);

  // Countdown timer (as fallback)
  useEffect(() => {
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => clearTicker();
  }, [clearTicker]);

  // Auto-advance on countdown complete (fallback behavior)
  useEffect(() => {
    if (countdown === 0 && !didNavigate.current) {
      console.log("⏰ Countdown complete, checking auth status...");

      // Check auth status before advancing
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.email_confirmed_at) {
          console.log("✅ Email confirmed via countdown check");
          goNext();
        } else {
          console.log("⚠️ Email not confirmed yet, user should click verify");
          // Reset countdown to give more time
          setCountdown(30);
        }
      });
    }
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
    } catch (error) {
      console.error("Error opening email app:", error);
    } finally {
      // Restart countdown after opening email app
      if (!didNavigate.current && !intervalRef.current) {
        intervalRef.current = setInterval(() => {
          setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
        }, 1000);
      }
    }
  };

  const handleResend = async () => {
    if (!email) {
      console.error("❌ No email available for resend");
      return;
    }

    try {
      console.log("📧 Resending verification email to:", email);

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });

      if (error) {
        console.error("❌ Error resending email:", error);
        // You could show a toast/alert here
        return;
      }

      console.log("✅ Verification email resent successfully");

      // Reset countdown
      clearTicker();
      setCountdown(60);
      if (!intervalRef.current) {
        intervalRef.current = setInterval(() => {
          setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
        }, 1000);
      }
    } catch (error) {
      console.error("❌ Exception resending email:", error);
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
        <ActivityIndicator size="large" color="#fff" />
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
