import { useAppTheme, makeStyles } from "@/src/theme";
import { LinearGradient } from "expo-linear-gradient";
import React, { ReactNode } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackButton from "../ui/BackButton";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface AuthLayoutProps {
  children: ReactNode;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export default function AuthLayout({
  children,
  showBackButton = false,
  onBackPress,
}: AuthLayoutProps) {
  const theme = useAppTheme();
  const styles = useStyles();

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        barStyle="light-content"
        backgroundColor="transparent"
      />

      {/* Gradient Background */}
      <LinearGradient
        colors={[
          theme.colors.dalisay[950],
          `${theme.colors.dalisay[500]}26`, // 15% opacity
          theme.colors.dalisay[950],
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
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{
            minHeight: SCREEN_HEIGHT + insets.top + insets.bottom,
            paddingTop: insets.top + 60,
            paddingBottom: insets.bottom + 32,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Back Button */}
      {showBackButton && <BackButton onPress={onBackPress} />}
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.dalisay[950],
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
}));