import VerifyEmailActions from "@/src/components/auth/VerifyEmailActions";
import VerifyEmailHeader from "@/src/components/auth/VerifyEmailHeader";
import { supabase } from "@/src/config/supabase";
import { authApi } from "@/src/features/auth/api/authApi";
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
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [fontsLoaded] = useFonts({
    HelloParis: require("@/assets/fonts/hello-paris-sans/HelloParisSans-Bold.ttf"),
    Lora: require("@/assets/fonts/lora/Lora-SemiBold.ttf"),
    DMSans: require("@/assets/fonts/dm-sans/DMSans-Regular.ttf"),
  });

  // 📦 Load from Zustand if params missing
  useEffect(() => {
    if (!email || !firstName || !userType) {
      const storedData = getSignupData();

      if (storedData) {
        setEmail(storedData.email);
        setFirstName(storedData.firstName);
        setUserType(storedData.userType);
      } else {
        Alert.alert("Session Expired", "Please sign up again.", [
          {
            text: "OK",
            onPress: () => router.replace("/(auth)/user-type-selection"),
          },
        ]);
      }
    }
  }, [email, firstName, getSignupData, router, userType]);

  const goNext = useCallback(
    (metadata?: any) => {
      if (didNavigate.current) return;
      didNavigate.current = true;

      const finalFirstName = metadata?.first_name || firstName || "";
      const finalUserType = metadata?.user_type || userType || "";

      router.replace({
        pathname: "/(auth)/verification-success",
        params: {
          firstName: finalFirstName,
          userType: finalUserType,
        },
      });
    },
    [router, firstName, userType],
  );

  useEffect(() => {
    const checkExistingSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user?.email_confirmed_at) {
        setTimeout(() => {
          goNext(session.user.user_metadata);
        }, 1000);
      }
    };

    checkExistingSession();

    // 🔄 Start auto-polling every 5 seconds to check if email was verified
    pollingIntervalRef.current = setInterval(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user?.email_confirmed_at) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
        goNext(session.user.user_metadata);
      }
    }, 5000); // Check every 5 seconds

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [goNext]);

  const handleManualCheck = async () => {
    try {
      setIsCheckingManually(true);

      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      let verifiedSession = currentSession;

      if (currentSession) {
        const {
          data: { session: refreshedSession },
        } = await supabase.auth.refreshSession();

        verifiedSession = refreshedSession ?? currentSession;
      }

      if (verifiedSession?.user?.email_confirmed_at) {
        goNext(verifiedSession.user.user_metadata);
        return;
      }

      Alert.alert(
        "Verification still pending",
        "For security, continue from the newest PinayMate verification email on this device. If you already verified in another browser, go back to sign in with the same email.",
        [
          {
            text: "Open Email",
            onPress: openEmailApp,
          },
          {
            text: "Back to Sign In",
            onPress: handleBackToSignIn,
          },
          {
            text: "OK",
            style: "cancel",
          },
        ],
      );
    } catch {
      console.error("Manual email verification check failed.");
      Alert.alert(
        "Could not check verification",
        "Please try again, open your email app, or return to sign in if you already verified.",
      );
    } finally {
      setIsCheckingManually(false);
    }
  };

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
    } catch {
      console.error("Error opening email app.");
    }
  };

  const handleResend = async () => {
    if (!email) {
      Alert.alert("Error", "No email address found");
      return;
    }

    try {
      await authApi.resendVerificationEmail(email);

      Alert.alert(
        "Success",
        "New verification email sent! Check your inbox. Link expires in 1 hour.",
      );
    } catch {
      console.error("Verification email resend failed.");
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
          <View
            style={{
              padding: 20,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.2)",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "rgba(255,255,255,0.95)",
                textAlign: "center",
                fontSize: 16,
                fontFamily: "DMSans",
                lineHeight: 24,
                fontWeight: "600",
                marginBottom: 8,
              }}
            >
              Check your email inbox
            </Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.75)",
                textAlign: "center",
                fontSize: 14,
                fontFamily: "DMSans",
                paddingHorizontal: 16,
                lineHeight: 22,
              }}
            >
              Open the latest verification link from this device. PinayMate will
              return here automatically when the link is accepted.
            </Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.62)",
                textAlign: "center",
                fontSize: 13,
                fontFamily: "DMSans",
                paddingHorizontal: 12,
                lineHeight: 20,
                marginTop: 14,
              }}
            >
              Email verification confirms sign-in for launch preparation. It
              does not publish your profile, enable matching, approve identity
              verification, or open paid features.
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleManualCheck}
            disabled={isCheckingManually}
            activeOpacity={0.84}
            accessibilityRole="button"
            accessibilityLabel={
              isCheckingManually
                ? "Checking email verification"
                : "Check email verification again"
            }
            accessibilityHint="Checks whether the latest verification link has been accepted"
            accessibilityState={{ disabled: isCheckingManually }}
            style={{
              marginTop: 20,
              minHeight: 56,
              padding: 16,
              backgroundColor: isCheckingManually
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(255, 255, 255, 0.08)",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.2)",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isCheckingManually ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontFamily: "DMSans",
                  fontSize: 14,
                  fontWeight: "600",
                }}
              >
                I opened the link - Check again
              </Text>
            )}
          </TouchableOpacity>

          <Text
            style={{
              color: "rgba(255,255,255,0.6)",
              textAlign: "center",
              marginTop: 12,
              fontSize: 12,
              fontFamily: "DMSans",
              paddingHorizontal: 24,
              lineHeight: 18,
              fontStyle: "italic",
            }}
          >
            Already verified somewhere else? Go back to sign in with the same
            email.
          </Text>
        </View>
      </View>
    </View>
  );
}
