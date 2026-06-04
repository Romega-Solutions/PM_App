import VerificationSuccessActions from "@/src/components/auth/VerificationSuccessActions";
import VerificationSuccessHeader from "@/src/components/auth/VerificationSuccessHeader";
import { authApi } from "@/src/features/auth/api/authApi";
import { useSignupStore } from "@/src/stores/signupStore";
import { colors, useTheme, withAlpha } from "@/src/theme";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform, StatusBar, View } from "react-native";

type NextRoute = {
  pathname: string;
  params?: Record<string, string>;
};

export default function VerificationSuccessScreen() {
  const router = useRouter();
  const { colors: themeColors } = useTheme();
  const params = useLocalSearchParams<{
    userType?: string;
    firstName?: string;
  }>();

  const getSignupData = useSignupStore((state) => state.getSignupData);

  const [, setUserType] = useState(params.userType);
  const [, setFirstName] = useState(params.firstName);
  const [isChecking, setIsChecking] = useState(true);
  const [nextRoute, setNextRoute] = useState<NextRoute | null>(null);
  const [countdown, setCountdown] = useState(0);
  const didNavigate = useRef(false);

  const queueNextRoute = useCallback((route: NextRoute) => {
    setNextRoute(route);
    setCountdown(2);
    setIsChecking(false);
  }, []);

  const [fontsLoaded] = useFonts({
    Lora: require("@/assets/fonts/lora/Lora-SemiBold.ttf"),
    DMSans: require("@/assets/fonts/dm-sans/DMSans-Regular.ttf"),
  });

  // 📦 Load from Zustand and ensure profile exists
  useEffect(() => {
    const loadDataAndEnsureProfile = async () => {
      if (__DEV__) console.log("📦 Loading data and ensuring profile...");

      // Try to get from params first
      let finalUserType = params.userType;
      let finalFirstName = params.firstName;

      // If missing, try Zustand
      if (!finalUserType || !finalFirstName) {
        if (__DEV__) console.log("⚠️ Missing params, loading from Zustand...");
        const storedData = getSignupData();

        if (storedData) {
          if (__DEV__) console.log("✅ Loaded from Zustand");
          finalUserType = storedData.userType;
          finalFirstName = storedData.firstName;
          setUserType(finalUserType);
          setFirstName(finalFirstName);
        }
      }

      // Get session and ensure profile exists
      const session = await authApi.getSession();

      if (!session?.user) {
        if (__DEV__) console.log("⚠️ No session found");
        queueNextRoute({ pathname: "/(auth)/signin" });
        return;
      }

      const { id: userId, email: sessionEmail, user_metadata: metadata } =
        session.user;

      // Use metadata as fallback
      if (!finalUserType && metadata.user_type) {
        finalUserType = metadata.user_type as string;
        setUserType(finalUserType);
      }
      if (!finalFirstName && metadata.first_name) {
        finalFirstName = metadata.first_name as string;
        setFirstName(finalFirstName);
      }

      try {
        const { profile, created, error } = await authApi.ensureProfile(
          userId,
          sessionEmail,
          metadata,
          finalUserType,
          finalFirstName
        );

        if (error && !profile) {
          if (__DEV__) console.error("❌ Profile error:", error);
          if (__DEV__) console.log("⚠️ Profile error, redirecting anyway...");
          queueNextRoute({
            pathname: "/(auth)/account-setup/basic-info",
            params: {
              userType: finalUserType || (metadata.user_type as string) || "foreigner",
              firstName: finalFirstName || (metadata.first_name as string) || "",
            },
          });
          return;
        }

        if (profile) {
          if (__DEV__)
            console.log(created ? "✅ Profile created" : "✅ Profile exists");
          setUserType(profile.user_type);
          setFirstName(profile.first_name);
          // Check which step to redirect to
          redirectToIncompleteStep(profile, finalUserType, finalFirstName);
        }
      } catch (error) {
        if (__DEV__) console.error("❌ Exception ensuring profile:", error);

        // On any exception, redirect to basic-info
        queueNextRoute({
          pathname: "/(auth)/account-setup/basic-info",
          params: {
            userType: finalUserType || (metadata.user_type as string) || "foreigner",
            firstName: finalFirstName || (metadata.first_name as string) || "",
          },
        });
      }
    };

    const redirectToIncompleteStep = (
      profile: any,
      userType?: string,
      firstName?: string
    ) => {
      if (__DEV__)
        console.log("🔍 Checking profile completion status:", {
          basic_info_completed: profile.basic_info_completed,
          photos_completed: profile.photos_completed,
          location_completed: profile.location_completed,
          preferences_completed: profile.preferences_completed,
        });

      const finalUserType = userType || profile.user_type || "foreigner";
      const finalFirstName = firstName || profile.first_name || "";

      let route: NextRoute;

      if (!profile.basic_info_completed) {
        if (__DEV__) console.log("📍 Redirecting to: basic-info (not completed)");
        route = {
          pathname: "/(auth)/account-setup/basic-info",
          params: { userType: finalUserType, firstName: finalFirstName },
        };
      } else if (!profile.photos_completed) {
        if (__DEV__) console.log("📍 Redirecting to: profile-photos (not completed)");
        route = {
          pathname: "/(auth)/account-setup/profile-photos",
          params: { userType: finalUserType },
        };
      } else if (!profile.location_completed) {
        if (__DEV__) console.log("📍 Redirecting to: location (not completed)");
        route = {
          pathname: "/(auth)/account-setup/location",
          params: { userType: finalUserType },
        };
      } else if (!profile.preferences_completed) {
        if (__DEV__) console.log("📍 Redirecting to: preferences (not completed)");
        route = {
          pathname: "/(auth)/account-setup/preferences",
          params: { userType: finalUserType },
        };
      } else {
        if (__DEV__) console.log("✅ All steps completed! Redirecting to welcome-complete");
        route = {
          pathname: "/(auth)/account-setup/welcome-complete",
          params: { userType: finalUserType },
        };
      }

      queueNextRoute(route);
    };

    loadDataAndEnsureProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  const goNext = useCallback(() => {
    if (didNavigate.current || !nextRoute) return;
    didNavigate.current = true;
    router.replace(nextRoute as never);
  }, [nextRoute, router]);

  useEffect(() => {
    if (!nextRoute || countdown <= 0) return;

    const timer = setTimeout(() => {
      if (countdown === 1) {
        goNext();
        return;
      }
      setCountdown((current) => current - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, goNext, nextRoute]);

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
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
        <VerificationSuccessHeader />

        {isChecking && (
          <View
            style={{
              marginVertical: 20,
              alignItems: "center",
              backgroundColor: withAlpha(colors.neutral.white, 0.1),
              paddingHorizontal: 24,
              paddingVertical: 16,
              borderRadius: 12,
            }}
          >
            <ActivityIndicator size="small" color={colors.neutral.white} />
          </View>
        )}

        <VerificationSuccessActions
          countdown={countdown}
          onContinue={goNext}
          onCancel={() => {
            router.replace("/(auth)/signin");
          }}
        />
      </View>
    </View>
  );
}
