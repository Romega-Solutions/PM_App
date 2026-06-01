// app/(auth)/forgot-password.tsx
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, Mail } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomTextInput from "../../src/components/forms/CustomTextInput";
import PrimaryButton from "../../src/components/ui/PrimaryButton";
import SecondaryButton from "../../src/components/ui/SecondaryButton";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ForgotPassword() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert("Missing Email", "Please enter your email address.");
      return;
    }
    try {
      setSubmitting(true);
      // TODO: Call your reset API here (example for Supabase):
      // await supabase.auth.resetPasswordForEmail(email, { redirectTo: "<your-app-scheme>://reset" });

      Alert.alert(
        "Check your email",
        "If an account exists for this email, a reset link has been sent."
      );
      router.replace("/(auth)/signin");
    } catch {
      Alert.alert("Error", "Could not start password reset. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#340839" }}>
      <StatusBar
        translucent
        barStyle="light-content"
        backgroundColor="transparent"
      />

      {/* Full-screen brand gradient */}
      <LinearGradient
        colors={["#340839", "rgba(141, 105, 246, 0.15)", "#340839"]}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Back button overlay, padded by safe area */}
      <TouchableOpacity
        style={[
          styles.backBtn,
          {
            top: insets.top + 12,
            left: 16,
          },
        ]}
        onPress={() => router.back()}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <ArrowLeft size={24} color="#FFFFFF" strokeWidth={2.5} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            minHeight: SCREEN_HEIGHT + insets.top + insets.bottom,
            paddingTop: insets.top + 60,
            paddingBottom: insets.bottom + 32,
            flexGrow: 1,
            paddingHorizontal: 24,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={{ alignItems: "center", marginBottom: 28 }}>
            <Text
              style={{
                fontSize: 32,
                color: "#FFFFFF",
                textAlign: "center",
                marginBottom: 8,
                textShadowColor: "rgba(239, 62, 120, 0.6)",
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 8,
                letterSpacing: -0.5,
                fontFamily: "Lora",
                fontWeight: "600",
              }}
            >
              Reset Password
            </Text>

            <Text
              style={{
                fontSize: 16,
                color: "rgba(255, 255, 255, 0.9)",
                textAlign: "center",
                lineHeight: 24,
                fontFamily: "DMSans",
                fontWeight: "400",
              }}
            >
              Enter your email and we will send you a link to reset your
              password.
            </Text>
          </View>

          {/* Form */}
          <View>
            <CustomTextInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              LeftIcon={Mail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            {/* Actions */}
            <PrimaryButton
              title={submitting ? "Sending..." : "Send Reset Link"}
              onPress={handleReset}
              disabled={submitting}
              accessibilityLabel="Send password reset link to your email"
            />

            <View style={{ height: 16 }} />

            <SecondaryButton
              title="Back to Sign In"
              variant="white"
              onPress={() => router.replace("/(auth)/signin")}
              accessibilityLabel="Go back to sign in"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    position: "absolute",
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
});
