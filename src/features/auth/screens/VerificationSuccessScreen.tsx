import VerificationSuccessActions from "@/src/components/auth/VerificationSuccessActions";
import VerificationSuccessHeader from "@/src/components/auth/VerificationSuccessHeader";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect } from "react";
import { ActivityIndicator, Platform, StatusBar, View } from "react-native";
import { useVerificationAdvance } from "../hooks/useVerificationAdvance";

export default function VerificationSuccessScreen() {
  const router = useRouter();
  const { countdown, start, immediateAdvance, stop } =
    useVerificationAdvance(3000);

  const [fontsLoaded] = useFonts({
    HelloParis: require("@/assets/fonts/hello-paris-sans/HelloParisSans-Bold.ttf"),
    Lora: require("@/assets/fonts/lora/Lora-SemiBold.ttf"),
    DMSans: require("@/assets/fonts/dm-sans/DMSans-Regular.ttf"),
  });

  const goNext = useCallback(() => {
    router.replace("/(auth)/account-setup/basic-info");
  }, [router]);

  useEffect(() => {
    start(goNext);
    return () => stop();
  }, [start, stop, goNext]);

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
        <VerificationSuccessActions
          countdown={countdown}
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
