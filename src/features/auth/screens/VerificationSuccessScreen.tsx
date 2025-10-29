import VerificationSuccessActions from "@/src/components/auth/VerificationSuccessActions";
import VerificationSuccessHeader from "@/src/components/auth/VerificationSuccessHeader";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Platform,
  StatusBar,
  Text,
  View,
} from "react-native";
import { useVerificationAdvance } from "../hooks/useVerificationAdvance";

export default function VerificationSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    userType?: string;
    firstName?: string;
  }>();

  const userType = params.userType;
  const firstName = params.firstName;

  const { isChecking, startChecking, immediateAdvance, stop } =
    useVerificationAdvance();

  const [fontsLoaded] = useFonts({
    HelloParis: require("@/assets/fonts/hello-paris-sans/HelloParisSans-Bold.ttf"),
    Lora: require("@/assets/fonts/lora/Lora-SemiBold.ttf"),
    DMSans: require("@/assets/fonts/dm-sans/DMSans-Regular.ttf"),
  });

  const goNext = useCallback(() => {
    console.log("✅ User authenticated, navigating to basic info...");
    console.log("📦 Passing params:", { userType, firstName });

    router.replace({
      pathname: "/(auth)/account-setup/basic-info",
      params: {
        userType: userType || "",
        firstName: firstName || "",
      },
    });
  }, [router, userType, firstName]);

  useEffect(() => {
    console.log("🔍 Starting authentication verification...");
    startChecking(goNext);
    return () => {
      console.log("🧹 Cleaning up verification check");
      stop();
    };
  }, [startChecking, stop, goNext]);

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
        <VerificationSuccessHeader />

        {isChecking && (
          <View
            style={{
              marginVertical: 20,
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              paddingHorizontal: 24,
              paddingVertical: 16,
              borderRadius: 12,
            }}
          >
            <ActivityIndicator size="small" color="#fff" />
            <Text
              style={{
                color: "#fff",
                marginTop: 12,
                fontFamily: "DMSans",
                fontSize: 14,
                textAlign: "center",
              }}
            >
              Verifying your account...
            </Text>
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.7)",
                marginTop: 4,
                fontFamily: "DMSans",
                fontSize: 12,
                textAlign: "center",
              }}
            >
              Please wait while we confirm your email
            </Text>
          </View>
        )}

        <VerificationSuccessActions
          countdown={0}
          onContinue={() => immediateAdvance(goNext)}
          onCancel={() => {
            stop();
            router.replace("/(auth)/signin");
          }}
        />
      </View>
    </View>
  );
}
