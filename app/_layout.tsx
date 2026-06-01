import { setupDeepLinking } from "@/src/config/deepLinking";
import { queryClient } from "@/src/config/queryClient";
import { useAuthPersistence } from "@/src/hooks/useAuthPersistence";
import { useTheme } from "@/src/theme";
import { QueryClientProvider, focusManager } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, AppState, Platform, Text, View } from "react-native";
import type { AppStateStatus } from "react-native";
import "./global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Font loading
  const [fontsLoaded, fontError] = useFonts({
    // Lora (Headers + brand wordmark)
    "Lora-Regular": require("../assets/fonts/lora/Lora-Regular.ttf"),
    "Lora-Italic": require("../assets/fonts/lora/Lora-Italic.ttf"),
    "Lora-Medium": require("../assets/fonts/lora/Lora-Medium.ttf"),
    "Lora-MediumItalic": require("../assets/fonts/lora/Lora-MediumItalic.ttf"),
    "Lora-SemiBold": require("../assets/fonts/lora/Lora-SemiBold.ttf"),
    "Lora-SemiBoldItalic": require("../assets/fonts/lora/Lora-SemiBoldItalic.ttf"),
    "Lora-Bold": require("../assets/fonts/lora/Lora-Bold.ttf"),
    "Lora-BoldItalic": require("../assets/fonts/lora/Lora-BoldItalic.ttf"),

    // DM Sans (Body / UI)
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

  // Auth persistence (session restoration, auto-refresh)
  const { isReady: isAuthReady } = useAuthPersistence();

  // Scheme-aware theme (light/dark)
  const { colors, isDark } = useTheme();

  // Hide splash screen when ready
  useEffect(() => {
    if ((fontsLoaded || fontError) && isAuthReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, isAuthReady]);

  // Setup deep linking for email verification
  useEffect(() => {
    console.log("🚀 Initializing deep link handler...");
    const cleanup = setupDeepLinking();
    return cleanup;
  }, []);

  // Tell TanStack Query when the app returns to the foreground so cached
  // server data refetches (mirrors browser window-focus behaviour on native).
  useEffect(() => {
    const onAppStateChange = (status: AppStateStatus) => {
      if (Platform.OS !== "web") focusManager.setFocused(status === "active");
    };
    const subscription = AppState.addEventListener("change", onAppStateChange);
    return () => subscription.remove();
  }, []);

  // Show loading state until everything is ready
  if ((!fontsLoaded && !fontError) || !isAuthReady) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#8D69F6" />
        <Text
          style={{
            color: colors.textSecondary,
            marginTop: 16,
            fontFamily: "DMSans-Regular",
          }}
        >
          {!isAuthReady ? "Restoring session..." : "Loading..."}
        </Text>
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style={isDark ? "light" : "dark"} backgroundColor={colors.background} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: colors.background,
            },
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(main)" />
          <Stack.Screen name="(modals)" />
        </Stack>
      </View>
    </QueryClientProvider>
  );
}
