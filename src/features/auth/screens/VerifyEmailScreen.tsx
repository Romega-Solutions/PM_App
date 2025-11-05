import VerifyEmailActions from "@/src/components/auth/VerifyEmailActions";
import VerifyEmailHeader from "@/src/components/auth/VerifyEmailHeader";
import { supabase } from "@/src/config/supabase";
import { useSignupStore } from "@/src/stores/signupStore";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    email?: string;
    firstName?: string;
    userType?: string;
  }>();

  const getSignupData = useSignupStore((state) => state.getSignupData);

  const [email, setEmail] = useState(params.email);
  const [firstName, setFirstName] = useState(params.firstName);
  const [userType, setUserType] = useState(params.userType);

  const didNavigate = useRef(false);
  const [isCheckingManually, setIsCheckingManually] = useState(false);

  const [fontsLoaded] = useFonts({
    HelloParis: require("@/assets/fonts/hello-paris-sans/HelloParisSans-Bold.ttf"),
    Lora: require("@/assets/fonts/lora/Lora-SemiBold.ttf"),
    DMSans: require("@/assets/fonts/dm-sans/DMSans-Regular.ttf"),
  });

  // 📦 Load from Zustand if params missing
  useEffect(() => {
    if (!email || !firstName || !userType) {
      console.log("⚠️ Missing params, loading from Zustand...");
      const storedData = getSignupData();

      if (storedData) {
        console.log("✅ Loaded signup data from Zustand:", storedData);
        setEmail(storedData.email);
        setFirstName(storedData.firstName);
        setUserType(storedData.userType);
      } else {
        console.log("❌ No stored data, redirecting to signup...");
        Alert.alert("Session Expired", "Please sign up again.", [
          {
            text: "OK",
            onPress: () => router.replace("/(auth)/user-type-selection"),
          },
        ]);
      }
    }
  }, []);

  const goNext = useCallback(
    (metadata?: any) => {
      if (didNavigate.current) return;
      didNavigate.current = true;

      console.log("📧 Email verified! Navigating to verification success...");

      const finalFirstName = metadata?.first_name || firstName || "";
      const finalUserType = metadata?.user_type || userType || "";

      console.log("📦 Passing params:", {
        firstName: finalFirstName,
        userType: finalUserType,
      });

      router.replace({
        pathname: "/(auth)/verification-success",
        params: {
          firstName: finalFirstName,
          userType: finalUserType,
        },
      });
    },
    [router, firstName, userType]
  );

  useEffect(() => {
    const checkExistingSession = async () => {
      console.log("🔍 Checking for existing verified session...");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user?.email_confirmed_at) {
        console.log("✅ Found existing verified session!");
        console.log("👤 User metadata:", session.user.user_metadata);

        setTimeout(() => {
          goNext(session.user.user_metadata);
        }, 1000);
      } else {
        console.log("ℹ️ No verified session found yet");
      }
    };

    checkExistingSession();
  }, [goNext]);

  const handleManualCheck = async () => {
    try {
      setIsCheckingManually(true);
      console.log("🔍 Manually checking verification status...");

      const {
        data: { session },
        error,
      } = await supabase.auth.refreshSession();

      if (error) {
        console.error("❌ Error refreshing session:", error);
        Alert.alert(
          "Please Verify First",
          "Click the verification link in your email, wait a few seconds, then come back and tap this button.",
          [{ text: "OK" }]
        );
        setIsCheckingManually(false);
        return;
      }

      console.log("📧 Current session:", {
        hasSession: !!session,
        emailConfirmed: session?.user?.email_confirmed_at,
        userId: session?.user?.id,
        metadata: session?.user?.user_metadata,
      });

      if (session?.user?.email_confirmed_at) {
        console.log("✅ Email verified! Advancing...");
        goNext(session.user.user_metadata);
      } else {
        console.log("⚠️ Email not verified yet or no session");
        Alert.alert(
          "Not Yet Verified",
          "Please:\n\n1. Open your email\n2. Click the verification link\n3. Wait 5 seconds\n4. Come back and tap this button",
          [{ text: "OK" }]
        );
        setIsCheckingManually(false);
      }
    } catch (error) {
      console.error("❌ Manual check error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
      setIsCheckingManually(false);
    }
  };

  useEffect(() => {
    console.log("📧 VerifyEmail screen loaded with params:", {
      email,
      firstName,
      userType,
    });
  }, [email, firstName, userType]);

  const openEmailApp = async () => {
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
    }
  };

  const handleResend = async () => {
    if (!email) {
      console.error("❌ No email available for resend");
      Alert.alert("Error", "No email address found");
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
        Alert.alert("Error", "Failed to resend verification email");
        return;
      }

      console.log("✅ Verification email resent successfully");
      Alert.alert(
        "Success",
        "New verification email sent! Check your inbox. Link expires in 1 hour."
      );
    } catch (error) {
      console.error("❌ Exception resending email:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const handleBackToSignIn = () => {
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
          countdown={0}
          onOpenEmailApp={openEmailApp}
          onResend={handleResend}
          onBackToSignIn={handleBackToSignIn}
        />

        <View style={{ marginTop: 32, width: "100%", maxWidth: 400 }}>
          <TouchableOpacity
            onPress={handleManualCheck}
            disabled={isCheckingManually}
            style={{
              padding: 18,
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              borderRadius: 16,
              borderWidth: 2,
              borderColor: "rgba(255, 255, 255, 0.3)",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            {isCheckingManually ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text
                style={{
                  color: "#fff",
                  fontFamily: "DMSans",
                  fontSize: 16,
                  fontWeight: "700",
                  letterSpacing: 0.5,
                }}
              >
                ✓ I Verified My Email - Continue
              </Text>
            )}
          </TouchableOpacity>

          <Text
            style={{
              color: "rgba(255,255,255,0.7)",
              textAlign: "center",
              marginTop: 16,
              fontSize: 13,
              fontFamily: "DMSans",
              paddingHorizontal: 24,
              lineHeight: 20,
            }}
          >
            After clicking the link in your email and waiting, return here and
            tap the button above
          </Text>
        </View>
      </View>
    </View>
  );
}
