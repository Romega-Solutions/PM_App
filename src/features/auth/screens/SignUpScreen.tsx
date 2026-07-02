import { useLocalSearchParams, useRouter } from "expo-router";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react-native";
import React, { useEffect, useState, useMemo } from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AuthHeader from "@/src/components/auth/AuthHeader";
import AuthLayout from "@/src/components/auth/AuthLayout";
import SignUpPrompt from "@/src/components/auth/SignUpPrompt";
import CustomTextInput from "@/src/components/forms/CustomTextInput";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import { supabase } from "@/src/config/supabase";
import { useSignupStore } from "@/src/stores/signupStore";
import { theme } from "@/src/theme";
import { useResponsive } from "@/src/hooks/useResponsive";
import { authValidation } from "../api/authApi";
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
  const { moderateScale, screenWidth: width } = useResponsive();

  const styles = useMemo(() => StyleSheet.create({
    logoWrap: {
      alignItems: "center",
      marginTop: moderateScale(8),
      marginBottom: theme.spacing.sm,
    },
    logo: {
      width: Math.min(140, width * 0.4),
      height: undefined,
      aspectRatio: 1.8,
    },
    userTypeBadge: {
      backgroundColor: "rgba(141,105,246,0.15)",
      borderRadius: 12,
      paddingVertical: 8,
      paddingHorizontal: 16,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      alignSelf: "center",
      borderWidth: 1,
      borderColor: "rgba(141,105,246,0.3)",
    },
    userTypeBadgeText: {
      fontSize: 13,
      fontFamily: theme.fontFamilies.body.semiBold,
      color: theme.colors.dalisay[400],
      textAlign: "center",
    },
    formContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: moderateScale(12),
    },
    expectationCard: {
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.dalisay[400],
      backgroundColor: "rgba(141,105,246,0.08)",
      paddingLeft: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    expectationTitle: {
      color: theme.colors.neutral.white,
      fontFamily: theme.fontFamilies.body.semiBold,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: theme.spacing.xs,
    },
    expectationText: {
      color: "rgba(255,255,255,0.72)",
      fontFamily: theme.fontFamilies.body.regular,
      fontSize: 13,
      lineHeight: 20,
    },
    legalConsent: {
      alignItems: "center",
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
    },
    legalConsentText: {
      color: "rgba(255,255,255,0.68)",
      fontFamily: theme.fontFamilies.body.regular,
      fontSize: 12,
      lineHeight: 18,
      textAlign: "center",
    },
    legalConsentLinks: {
      alignItems: "center",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      justifyContent: "center",
    },
    legalConsentLink: {
      color: theme.colors.neutral.white,
      fontFamily: theme.fontFamilies.body.semiBold,
      fontSize: 12,
      lineHeight: 44,
      minHeight: 44,
      textAlign: "center",
      textDecorationLine: "underline",
    },
    emailOnlyNotice: {
      borderLeftWidth: 3,
      borderLeftColor: "rgba(255,255,255,0.34)",
      paddingLeft: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    emailOnlyTitle: {
      color: theme.colors.neutral.white,
      fontFamily: theme.fontFamilies.body.semiBold,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: theme.spacing.xs,
    },
    emailOnlyText: {
      color: "rgba(255,255,255,0.68)",
      fontFamily: theme.fontFamilies.body.regular,
      fontSize: 13,
      lineHeight: 19,
    },
  }), [moderateScale, width]);

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
    } else {
      const passwordCheck = authValidation.isValidPassword(form.password);
      if (!passwordCheck.valid) {
        e.password = passwordCheck.error;
      }
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
      await supabase.auth.signOut();

      const signupData = {
        email: form.email.toLowerCase().trim(),
        firstName: form.firstName.trim(),
        userType: userType,
      };

      // 💾 SAVE TO ZUSTAND STORE FIRST
      saveSignupData(signupData);

      const result = await signUp(form.email, form.password, {
        firstName: form.firstName.trim(),
        userType: userType,
      });

      // Always check if email verification is needed
      if (result?.needsVerification) {
        router.replace({
          pathname: "/(auth)/verify-email",
          params: signupData,
        });
        return;
      }

      // If email is already verified (shouldn't happen on first signup, but just in case)
      router.replace({
        pathname: "/(auth)/account-setup/basic-info",
        params: {
          userType: userType,
          firstName: form.firstName.trim(),
        },
      });
    } catch (err) {
      console.error("Signup failed during account creation.");
      Alert.alert(
        "Sign Up Failed",
        err instanceof Error
          ? err.message
          : "We could not create your account. Check your connection and try again.",
      );
    }
  };

  if (!userType || (userType !== "filipina" && userType !== "foreigner")) {
    return null;
  }

  return (
    <AuthLayout showBackButton>
      <View style={styles.logoWrap}>
        <Image
          source={require("@/assets/images/brand/logo-no-bg.webp")}
          style={styles.logo}
          resizeMode="contain"
          accessible
          accessibilityLabel="PinayMate logo"
        />
      </View>

      <AuthHeader
        title={`Create your ${userTypeLabel} profile`}
        subtitle="Start with email signup, then add the details that help PinayMate understand your profile, intent, and safety preferences."
        showLogo={false}
      />

      <View style={styles.userTypeBadge}>
        <Text style={styles.userTypeBadgeText}>
          Account Type: {userTypeLabel}
        </Text>
      </View>

      <View style={styles.formContainer}>
        <View
          style={styles.expectationCard}
          accessible
          accessibilityLabel="Account setup note. This creates your account and starts profile setup."
        >
          <Text style={styles.expectationTitle}>What this unlocks now</Text>
          <Text style={styles.expectationText}>
            Create your account, verify your email, and continue into profile
            setup. You can adjust privacy, verification, and discovery settings
            before deciding how to connect.
          </Text>
        </View>

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
          rightIconAccessibilityLabel={
            showPassword ? "Hide password" : "Show password"
          }
          secureTextEntry={!showPassword}
          autoComplete="password-new"
          error={errors.password}
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
          rightIconAccessibilityLabel={
            showConfirm ? "Hide confirm password" : "Show confirm password"
          }
          secureTextEntry={!showConfirm}
          autoComplete="password-new"
          error={errors.confirmPassword}
        />

        <View style={styles.legalConsent}>
          <Text style={styles.legalConsentText}>
            By creating a profile, you agree to PinayMate's
          </Text>
          <View style={styles.legalConsentLinks}>
            <Pressable
              onPress={() => router.push("/(auth)/terms")}
              accessibilityRole="button"
              accessibilityLabel="Read PinayMate terms of service"
              accessibilityHint="Opens the PinayMate terms overview before signup"
              hitSlop={10}
            >
              <Text style={styles.legalConsentLink}>Terms of Service</Text>
            </Pressable>
            <Text style={styles.legalConsentText}>and</Text>
            <Pressable
              onPress={() => router.push("/(auth)/privacy")}
              accessibilityRole="button"
              accessibilityLabel="Read PinayMate privacy policy"
              accessibilityHint="Opens the PinayMate privacy overview before signup"
              hitSlop={10}
            >
              <Text style={styles.legalConsentLink}>Privacy Policy</Text>
            </Pressable>
          </View>
        </View>

        <PrimaryButton
          title="Create profile"
          onPress={handleSignUp}
          loading={loading}
          showChevron
        />

        <View style={styles.emailOnlyNotice}>
          <Text style={styles.emailOnlyTitle}>
            Email signup is the active path
          </Text>
          <Text style={styles.emailOnlyText}>
            Social login and phone OTP will appear only when those sign-in
            options are ready for members.
          </Text>
        </View>

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

