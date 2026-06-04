import { useLocalSearchParams, useRouter } from "expo-router";
import { Eye, EyeOff, Heart, Lock, Mail, User, Users } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, Image, StyleSheet, Text, View } from "react-native";

import AuthLayout from "@/src/components/auth/AuthLayout";
import SignUpPrompt from "@/src/components/auth/SignUpPrompt";
import SocialSignInButton from "@/src/components/auth/SocialSignInButton";
import CustomTextInput from "@/src/components/forms/CustomTextInput";
import FormDivider from "@/src/components/forms/FormDivider";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import { useSignupStore } from "@/src/stores/signupStore";
import { theme, useTheme, withAlpha, type SemanticColors } from "@/src/theme";
import { authApi } from "../api/authApi";
import { useSignUp } from "../hooks/useSignUp";

type UserType = "filipina" | "foreigner";

type FormState = {
  firstName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

function SignUpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ userType?: string }>();
  const { signUp, loading } = useSignUp();
  const saveSignupData = useSignupStore((state) => state.saveSignupData);
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [form, setForm] = useState<FormState>({
    firstName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  const userType = params.userType as UserType;

  useEffect(() => {
    if (!userType || (userType !== "filipina" && userType !== "foreigner")) {
      console.warn("⚠️ No valid userType found, redirecting to selection");
      router.replace("/(auth)/user-type-selection");
    }
  }, [userType, router]);

  const userTypeLabel = userType === "filipina" ? "Filipina" : "Foreign Man";
  const BadgeIcon = userType === "filipina" ? Heart : Users;

  const validate = (): boolean => {
    const e: Partial<FormState> = {};

    if (!form.firstName.trim()) {
      e.firstName = "First name is required";
    } else if (form.firstName.trim().length < 2) {
      e.firstName = "First name must be at least 2 characters";
    }

    if (!form.email.trim()) {
      e.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Please enter a valid email";
    }

    if (!form.password) {
      e.password = "Password is required";
    } else if (form.password.length < 8) {
      e.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      e.password = "Password must include uppercase, lowercase, and number";
    }

    if (form.password !== form.confirmPassword) {
      e.confirmPassword = "Passwords do not match";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;

    if (!userType) {
      Alert.alert("Error", "Please select your account type first");
      router.replace("/(auth)/user-type-selection");
      return;
    }

    try {
      // ⚠️ Sign out any existing session first to avoid conflicts
      if (__DEV__) console.log("🚪 Signing out any existing session...");
      await authApi.signOut();

      const signupData = {
        email: form.email.toLowerCase().trim(),
        firstName: form.firstName.trim(),
        userType: userType,
      };

      if (__DEV__) console.log("🚀 Starting signup...");

      // 💾 SAVE TO ZUSTAND STORE FIRST
      saveSignupData(signupData);

      const result = await signUp(form.email, form.password, {
        firstName: form.firstName.trim(),
        userType: userType,
      });

      if (__DEV__) console.log("✅ Signup result received");

      // Always check if email verification is needed
      if (result?.needsVerification) {
        if (__DEV__) console.log("📧 Email not verified yet - navigating to verification screen");

        router.replace({
          pathname: "/(auth)/verify-email",
          params: signupData,
        });
        return;
      }

      // If email is already verified (shouldn't happen on first signup, but just in case)
      if (__DEV__) console.log("✅ Email already verified - proceeding to account setup");
      router.replace({
        pathname: "/(auth)/account-setup/basic-info",
        params: {
          userType: userType,
          firstName: form.firstName.trim(),
        },
      });
    } catch (err) {
      console.error("❌ Signup error:", err);
      Alert.alert(
        "Sign Up Failed",
        err instanceof Error ? err.message : "An error occurred"
      );
    }
  };

  if (!userType || (userType !== "filipina" && userType !== "foreigner")) {
    return null;
  }

  return (
    <AuthLayout>
      <View style={styles.logoWrap}>
        <Image
          source={require("@/assets/logo-no-bg.png")}
          style={styles.logo}
          resizeMode="contain"
          accessible
          accessibilityLabel="PinayMate logo"
        />
      </View>

      <View style={styles.userTypeBadge}>
        <BadgeIcon
          size={15}
          color={colors.secondary}
          strokeWidth={2.5}
          fill={userType === "filipina" ? colors.secondary : "transparent"}
        />
        <Text style={styles.userTypeBadgeText}>{userTypeLabel} Account</Text>
      </View>

      <View style={styles.formContainer}>
        <CustomTextInput
          label="First name"
          value={form.firstName}
          onChangeText={(t) => {
            setForm((s) => ({ ...s, firstName: t }));
            setErrors((s) => ({ ...s, firstName: undefined }));
          }}
          placeholder="Enter your first name"
          LeftIcon={User}
          autoCapitalize="words"
          autoComplete="given-name"
          error={errors.firstName}
          containerStyle={styles.field}
        />

        <CustomTextInput
          label="Email"
          value={form.email}
          onChangeText={(t) => {
            setForm((s) => ({ ...s, email: t }));
            setErrors((s) => ({ ...s, email: undefined }));
          }}
          placeholder="Enter your email"
          LeftIcon={Mail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={errors.email}
          containerStyle={styles.field}
        />

        <CustomTextInput
          label="Password"
          value={form.password}
          onChangeText={(t) => {
            setForm((s) => ({ ...s, password: t }));
            setErrors((s) => ({ ...s, password: undefined }));
          }}
          placeholder="Create a strong password"
          LeftIcon={Lock}
          RightIcon={showPassword ? EyeOff : Eye}
          onRightIconPress={() => setShowPassword((v) => !v)}
          secureTextEntry={!showPassword}
          autoComplete="password-new"
          error={errors.password}
          containerStyle={styles.field}
        />

        <CustomTextInput
          label="Confirm Password"
          value={form.confirmPassword}
          onChangeText={(t) => {
            setForm((s) => ({ ...s, confirmPassword: t }));
            setErrors((s) => ({ ...s, confirmPassword: undefined }));
          }}
          placeholder="Confirm your password"
          LeftIcon={Lock}
          RightIcon={showConfirm ? EyeOff : Eye}
          onRightIconPress={() => setShowConfirm((v) => !v)}
          secureTextEntry={!showConfirm}
          autoComplete="password-new"
          error={errors.confirmPassword}
          containerStyle={styles.field}
        />

        <PrimaryButton
          title="Create Account"
          onPress={handleSignUp}
          loading={loading}
          showChevron
        />

        <FormDivider text="Or continue with" />
        <SocialSignInButton
          provider="google"
          onPress={() =>
            Alert.alert(
              "Unavailable",
              "Google sign-up is not available in this build.",
            )
          }
          unavailable
        />

        <SignUpPrompt
          questionText="Already have an account?"
          actionText="Sign In"
          onPress={() => router.push("/(auth)/signin")}
        />
      </View>
    </AuthLayout>
  );
}

export default SignUpScreen;

const createStyles = (colors: SemanticColors) =>
  StyleSheet.create({
    logoWrap: {
      alignItems: "center",
      marginBottom: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    logo: {
      aspectRatio: 1.8,
      height: 78,
      width: 140,
    },
    userTypeBadge: {
      alignItems: "center",
      alignSelf: "center",
      backgroundColor: withAlpha(colors.secondary, 0.15),
      borderColor: withAlpha(colors.secondary, 0.3),
      borderRadius: theme.borderRadius.full,
      borderWidth: 1,
      flexDirection: "row",
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.md,
      marginHorizontal: theme.spacing.lg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    userTypeBadgeText: {
      color: colors.secondary,
      fontFamily: theme.fontFamilies.body.semiBold,
      fontSize: 13,
      textAlign: "center",
    },
    formContainer: {
      paddingBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
    },
    field: {
      marginBottom: theme.spacing.md,
    },
  });
