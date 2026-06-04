import { colors, useTheme, withAlpha } from "@/src/theme";
import { LinearGradient } from "expo-linear-gradient";
import React, { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackButton from "../ui/BackButton";

interface AuthLayoutProps {
  children: ReactNode;
  showBackButton?: boolean;
  onBackPress?: () => void;
  /** When false, content is laid out in a fixed, centered view that fits on one
   *  screen (no scrolling). Defaults to true (scrollable) for longer forms. */
  scrollable?: boolean;
}

export default function AuthLayout({
  children,
  showBackButton = false,
  onBackPress,
  scrollable = true,
}: AuthLayoutProps) {
  const insets = useSafeAreaInsets();
  const { colors: themeColors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: themeColors.brandBackground }]}>
      <StatusBar
        translucent
        barStyle="light-content"
        backgroundColor="transparent"
      />

      {/* Gradient Background */}
      <LinearGradient
        colors={[
          themeColors.brandBackground,
          withAlpha(colors.dalisay[500], 0.15),
          themeColors.brandBackground,
        ]}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {scrollable ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={{
              paddingTop: insets.top + 24,
              paddingBottom: insets.bottom + 24,
              flexGrow: 1,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        ) : (
          <View
            style={[
              styles.staticView,
              {
                paddingTop: insets.top + 24,
                paddingBottom: insets.bottom + 24,
              },
            ]}
          >
            {children}
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Back Button */}
      {showBackButton && <BackButton onPress={onBackPress} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  staticView: {
    flex: 1,
    justifyContent: "center",
  },
});
