// app/(auth)/reset-password.tsx
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Eye, EyeOff, Lock } from "lucide-react-native";
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
import { authApi, authValidation } from "../../src/features/auth/api/authApi";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

function validatePassword(password: string, confirmPassword: string) {
  if (!password) {
    return "Password is required.";
  }

  const passwordCheck = authValidation.isValidPassword(password);
  if (!passwordCheck.valid) {
    return passwordCheck.error || "Password does not meet the requirements.";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }

  return "";
}

export default function ResetPassword() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const handleUpdatePassword = async () => {
    const validationError = validatePassword(password, confirmPassword);
    setFormError("");

    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      await authApi.updatePassword(password);

      try {
        await authApi.signOut();
      } catch {
        console.warn("Password updated but sign-out failed.");
      }

      Alert.alert(
        "Password updated",
        "Your password has been updated. Please sign in again.",
      );
      router.replace("/(auth)/signin");
    } catch {
      setFormError(
        "Could not update password. Open the latest reset email and try again because reset links can expire.",
      );
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

      <LinearGradient
        colors={["#340839", "rgba(141, 105, 246, 0.15)", "#340839"]}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <TouchableOpacity
        style={[
          styles.backBtn,
          {
            top: insets.top + 12,
            left: 16,
          },
        ]}
        onPress={() => router.replace("/(auth)/signin")}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Go back to sign in"
      >
        <Lock size={22} color="#FFFFFF" strokeWidth={2.5} />
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
                letterSpacing: 0,
                fontFamily: "Lora",
                fontWeight: "600",
              }}
            >
              Create New Password
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
              Use the latest recovery link from your email, then choose a new
              password for your account.
            </Text>
          </View>

          <View>
            <CustomTextInput
              label="New Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Create a strong password"
              LeftIcon={Lock}
              RightIcon={showPassword ? EyeOff : Eye}
              onRightIconPress={() => setShowPassword((value) => !value)}
              rightIconAccessibilityLabel={
                showPassword ? "Hide new password" : "Show new password"
              }
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password-new"
              accessibilityHint="Use at least 8 characters with uppercase, lowercase, number, and special character"
              error={formError && !password ? formError : undefined}
            />

            <View style={styles.passwordHelpCard}>
              <Text style={styles.passwordHelpTitle}>Password must include</Text>
              <Text style={styles.passwordHelp}>
                At least 8 characters, with uppercase, lowercase, a number, and
                a special character.
              </Text>
            </View>

            <CustomTextInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter your password"
              LeftIcon={Lock}
              RightIcon={showConfirmPassword ? EyeOff : Eye}
              onRightIconPress={() => setShowConfirmPassword((value) => !value)}
              rightIconAccessibilityLabel={
                showConfirmPassword
                  ? "Hide confirmed password"
                  : "Show confirmed password"
              }
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoComplete="password-new"
              error={formError && password ? formError : undefined}
            />

            <PrimaryButton
              title="Update Password"
              onPress={handleUpdatePassword}
              loading={submitting}
              accessibilityLabel="Update your password"
              accessibilityHint="Saves the new password for your PinayMate account"
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  passwordHelpCard: {
    marginTop: -10,
    marginBottom: 18,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    backgroundColor: "rgba(255, 255, 255, 0.07)",
  },
  passwordHelpTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
    fontFamily: "DMSans",
    fontWeight: "700",
  },
  passwordHelp: {
    color: "rgba(255, 255, 255, 0.74)",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "DMSans",
  },
});
