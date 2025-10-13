import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "./global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    // HelloParis (Logo / Display)
    "HelloParis-ExtraLight": require("../assets/fonts/hello-paris-sans/HelloParisSans-ExtraLight.ttf"),
    "HelloParis-Light": require("../assets/fonts/hello-paris-sans/HelloParisSans-Light.ttf"),
    "HelloParis-Regular": require("../assets/fonts/hello-paris-sans/HelloParisSans-Regular.ttf"),
    "HelloParis-Medium": require("../assets/fonts/hello-paris-sans/HelloParisSans-Medium.ttf"),
    "HelloParis-Bold": require("../assets/fonts/hello-paris-sans/HelloParisSans-Bold.ttf"),

    // Lora (Headers)
    "Lora-Regular": require("../assets/fonts/lora/Lora-Regular.ttf"),
    "Lora-Italic": require("../assets/fonts/lora/Lora-Italic.ttf"),
    "Lora-Medium": require("../assets/fonts/lora/Lora-Medium.ttf"),
    "Lora-MediumItalic": require("../assets/fonts/lora/Lora-MediumItalic.ttf"),
    "Lora-SemiBold": require("../assets/fonts/lora/Lora-SemiBold.ttf"),
    "Lora-SemiBoldItalic": require("../assets/fonts/lora/Lora-SemiBoldItalic.ttf"),
    "Lora-Bold": require("../assets/fonts/lora/Lora-Bold.ttf"),
    "Lora-BoldItalic": require("../assets/fonts/lora/Lora-BoldItalic.ttf"),

    // DM Sans (Body / UI) - all weights present
    "DMSans-Thin": require("../assets/fonts/dm-sans/DMSans-Thin.ttf"),
    "DMSans-ExtraLight": require("../assets/fonts/dm-sans/DMSans-ExtraLight.ttf"),
    "DMSans-Light": require("../assets/fonts/dm-sans/DMSans-Light.ttf"),
    "DMSans-Regular": require("../assets/fonts/dm-sans/DMSans-Regular.ttf"),
    "DMSans-Medium": require("../assets/fonts/dm-sans/DMSans-Medium.ttf"),
    "DMSans-SemiBold": require("../assets/fonts/dm-sans/DMSans-SemiBold.ttf"),
    "DMSans-Bold": require("../assets/fonts/dm-sans/DMSans-Bold.ttf"),
    "DMSans-ExtraBold": require("../assets/fonts/dm-sans/DMSans-ExtraBold.ttf"),
    "DMSans-Black": require("../assets/fonts/dm-sans/DMSans-Black.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // keep splash visible until fonts load (or an error occurs)
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/welcome" />
        <Stack.Screen name="(auth)/signin" />
        <Stack.Screen name="(auth)/signup" />
        <Stack.Screen name="(main)" />
      </Stack>
    </>
  );
}
