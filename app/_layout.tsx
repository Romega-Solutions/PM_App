import "@/src/config/consoleGuard";
import { setupDeepLinking } from "@/src/config/deepLinking";
import { useAuthPersistence } from "@/src/hooks/useAuthPersistence";
import { semanticColors, ThemeProvider } from "@/src/theme";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";


import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { width } = useWindowDimensions();
  const useDesktopFrame = Platform.OS === "web" && width >= 768;

  // Font loading
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

  // Hide splash screen when ready
  useEffect(() => {
    if ((fontsLoaded || fontError) && isAuthReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, isAuthReady]);

  // Setup deep linking for email verification
  useEffect(() => {
    const cleanup = setupDeepLinking();
    return cleanup;
  }, []);

  // Show loading state until everything is ready
  const content =
    (!fontsLoaded && !fontError) || !isAuthReady ? (
      <View
        style={styles.loading}
      >
        <ActivityIndicator size="large" color="#8D69F6" />
        <Text
          style={styles.loadingText}
        >
          {!isAuthReady ? "Restoring session..." : "Loading..."}
        </Text>
      </View>
    ) : (
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: semanticColors.background,
          },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
        <Stack.Screen name="(modals)" />
      </Stack>
    );

  return (
    <ThemeProvider>
      <GestureHandlerRootView
        style={[styles.stage, useDesktopFrame && styles.desktopStage]}
      >
        {useDesktopFrame ? (
          <>
            <Image
              source={require("../assets/images/brand/logo-no-bg.webp")}
              style={[styles.desktopMark, styles.desktopMarkLeft]}
              resizeMode="contain"
              accessible={false}
            />
            <Image
              source={require("../assets/images/brand/logo-no-bg.webp")}
              style={[styles.desktopMark, styles.desktopMarkRight]}
              resizeMode="contain"
              accessible={false}
            />
          </>
        ) : null}
        <View style={[styles.appFrame, useDesktopFrame && styles.desktopAppFrame]}>
          <StatusBar style="light" backgroundColor={semanticColors.background} />
          {content}
        </View>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    backgroundColor: semanticColors.background,
  },
  desktopStage: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 20,
    backgroundColor: "#08040D",
  },
  desktopMark: {
    position: "absolute",
    width: 460,
    height: 460,
    opacity: 0.08,
  },
  desktopMarkLeft: {
    left: 36,
    top: 72,
  },
  desktopMarkRight: {
    right: 32,
    bottom: 48,
    transform: [{ scale: 0.82 }],
  },
  appFrame: {
    flex: 1,
    width: "100%",
    backgroundColor: semanticColors.background,
    overflow: "hidden",
  },
  desktopAppFrame: {
    maxWidth: 520,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.35,
    shadowRadius: 48,
  },
  loading: {
    flex: 1,
    backgroundColor: semanticColors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "rgba(255,255,255,0.62)",
    marginTop: 16,
    fontFamily: "DMSans-Regular",
  },
});
