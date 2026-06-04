import VerifyEmailActions from "@/src/components/auth/VerifyEmailActions";
import VerifyEmailHeader from "@/src/components/auth/VerifyEmailHeader";
import { authApi } from "@/src/features/auth/api/authApi";
import { useSignupStore } from "@/src/stores/signupStore";
import { colors, useTheme, withAlpha } from "@/src/theme";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MailCheck, ShieldCheck } from "lucide-react-native";
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
  const { colors: themeColors } = useTheme();
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
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [fontsLoaded] = useFonts({
    Lora: require("@/assets/fonts/lora/Lora-SemiBold.ttf"),
    DMSans: require("@/assets/fonts/dm-sans/DMSans-Regular.ttf"),
  });

  // 📦 Load from Zustand if params missing
  useEffect(() => {
    if (!email || !firstName || !userType) {
      if (__DEV__) console.log("⚠️ Missing params, loading from Zustand...");
      const storedData = getSignupData();

      if (storedData) {
        if (__DEV__) console.log("✅ Loaded signup data from Zustand");
        setEmail(storedData.email);
        setFirstName(storedData.firstName);
        setUserType(storedData.userType);
      } else {
        if (__DEV__) console.log("❌ No stored data, redirecting to signup...");
        Alert.alert("Session Expired", "Please sign up again.", [
          {
            text: "OK",
            onPress: () => router.replace("/(auth)/user-type-selection"),
          },
        ]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  const goNext = useCallback(
    (metadata?: any) => {
      if (didNavigate.current) return;
      didNavigate.current = true;

      if (__DEV__) console.log("📧 Email verified! Navigating to verification success...");

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
    [router, firstName, userType]
  );

  useEffect(() => {
    const checkExistingSession = async () => {
      if (__DEV__) console.log("🔍 Checking for existing verified session...");

      const session = await authApi.getVerifiedSession();

      if (session) {
        if (__DEV__) console.log("✅ Found existing verified session!");

        setTimeout(() => {
          goNext(session.user.user_metadata);
        }, 1000);
      } else {
        if (__DEV__) console.log("ℹ️ No verified session found yet");
      }
    };

    checkExistingSession();

    // 🔄 Start auto-polling every 5 seconds to check if email was verified
    if (__DEV__) console.log("🔄 Starting auto-verification polling...");
    pollingIntervalRef.current = setInterval(async () => {
      if (__DEV__) console.log("🔄 Auto-checking verification status...");

      const session = await authApi.getVerifiedSession();

      if (session) {
        if (__DEV__) console.log("✅ Email verified detected by polling!");
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
      if (__DEV__) console.log("🔍 Manually checking verification status...");

      if (!email) {
        Alert.alert("Error", "No email found");
        setIsCheckingManually(false);
        return;
      }

      // First, try to refresh the current session
      if (__DEV__) console.log("🔄 Refreshing session to check verification...");
      const refreshedSession = await authApi.refreshVerifiedSession();

      if (refreshedSession) {
        if (__DEV__) console.log("✅ Email verified! Session is active!");
        goNext(refreshedSession.user.user_metadata);
        return;
      }

      // If no session or not verified, prompt for password to sign in
      if (__DEV__) console.log("⚠️ No active session, prompting for password...");

      Alert.prompt(
        "Enter Password",
        "To continue, please enter your password:",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => setIsCheckingManually(false),
          },
          {
            text: "Sign In",
            onPress: async (password?: string) => {
              if (!password) {
                Alert.alert("Error", "Password is required");
                setIsCheckingManually(false);
                return;
              }

              try {
                if (__DEV__) console.log("🔐 Signing in with password...");
                const verifiedSession =
                  await authApi.signInWithPasswordForVerification(
                    email,
                    password
                  );

                if (verifiedSession) {
                  if (__DEV__)
                    console.log("✅ Signed in successfully with verified email!");
                  goNext(verifiedSession.user.user_metadata);
                } else {
                  Alert.alert(
                    "Not Verified Yet",
                    "Your email has not been verified yet. Please tap the verification link in your inbox, then try again."
                  );
                  setIsCheckingManually(false);
                }
              } catch (err) {
                const errMsg =
                  err instanceof Error ? err.message : "Unknown error";
                if (__DEV__) console.error("❌ Sign in error:", errMsg);
                const displayMsg =
                  errMsg === "Invalid login credentials"
                    ? "Wrong password. Please try again."
                    : errMsg === "Email not confirmed"
                      ? "Your email has not been verified yet. Please tap the verification link in your inbox, then try again."
                      : "Sign in failed: " + errMsg;
                Alert.alert("Sign In Failed", displayMsg);
                setIsCheckingManually(false);
              }
            },
          },
        ],
        "secure-text"
      );
    } catch (error) {
      if (__DEV__) console.error("❌ Manual check error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
      setIsCheckingManually(false);
    }
  };

  useEffect(() => {
    if (__DEV__) console.log("📧 VerifyEmail screen loaded");
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
      if (__DEV__) console.error("Error opening email app:", error);
    }
  };

  const handleResend = async () => {
    if (!email) {
      if (__DEV__) console.error("❌ No email available for resend");
      Alert.alert("Error", "No email address found");
      return;
    }

    try {
      await authApi.resendVerificationEmail(email);
      if (__DEV__) console.log("✅ Verification email resent successfully");
      Alert.alert(
        "Success",
        "New verification email sent! Check your inbox. Link expires in 1 hour."
      );
    } catch (error) {
      if (__DEV__) console.error("❌ Exception resending email:", error);
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
          backgroundColor: themeColors.brandBackground,
        }}
      >
        <ActivityIndicator size="large" color={colors.neutral.white} />
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
        colors={[
          themeColors.brandBackground,
          themeColors.secondary,
          themeColors.primary,
          themeColors.brandBackground,
        ]}
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
              backgroundColor: withAlpha(colors.neutral.white, 0.1),
              borderRadius: 16,
              borderWidth: 1,
              borderColor: withAlpha(colors.neutral.white, 0.2),
              alignItems: "center",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 8,
              }}
            >
              <MailCheck
                size={18}
                color={themeColors.onPrimary}
                style={{ marginRight: 6 }}
              />
              <Text
                style={{
                  color: withAlpha(colors.neutral.white, 0.95),
                  textAlign: "center",
                  fontSize: 16,
                  fontFamily: "DMSans",
                  lineHeight: 24,
                  fontWeight: "600",
                }}
              >
                Check your email inbox
              </Text>
            </View>
            <Text
              style={{
                color: withAlpha(colors.neutral.white, 0.75),
                textAlign: "center",
                fontSize: 14,
                fontFamily: "DMSans",
                paddingHorizontal: 16,
                lineHeight: 22,
              }}
            >
              Click the verification link in your email and you&apos;ll be
              automatically redirected back to this app to continue
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleManualCheck}
            disabled={isCheckingManually}
            style={{
              marginTop: 20,
              padding: 16,
              backgroundColor: withAlpha(colors.neutral.white, 0.08),
              borderRadius: 12,
              borderWidth: 1,
              borderColor: withAlpha(colors.neutral.white, 0.2),
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isCheckingManually ? (
              <ActivityIndicator size="small" color={colors.neutral.white} />
            ) : (
              <>
                <ShieldCheck
                  size={16}
                  color={withAlpha(colors.neutral.white, 0.8)}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={{
                    color: withAlpha(colors.neutral.white, 0.8),
                    fontFamily: "DMSans",
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  I&apos;ve verified my email
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
