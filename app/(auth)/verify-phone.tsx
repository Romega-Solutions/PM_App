import AuthLayout from "@/src/components/auth/AuthLayout";
import AuthHeader from "@/src/components/auth/AuthHeader";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import SecondaryButton from "@/src/components/ui/SecondaryButton";
import { colors, theme, useTheme, withAlpha } from "@/src/theme";
import { useRouter } from "expo-router";
import { Smartphone, ShieldAlert } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function VerifyPhone() {
  const router = useRouter();
  const { colors: themeColors } = useTheme();

  return (
    <AuthLayout showBackButton onBackPress={() => router.back()}>
      <View style={styles.container}>
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: withAlpha(themeColors.primary, 0.16),
              borderColor: withAlpha(themeColors.primary, 0.28),
            },
          ]}
        >
          <Smartphone size={34} color={themeColors.primary} />
        </View>

        <AuthHeader
          title="Phone Verification"
          subtitle="Phone sign-in is not available in this build."
          showLogo={false}
        />

        <View
          style={[
            styles.notice,
            {
              backgroundColor: withAlpha(colors.neutral.white, 0.08),
              borderColor: withAlpha(colors.neutral.white, 0.18),
            },
          ]}
          accessible
          accessibilityRole="text"
          accessibilityLabel="Phone verification is unavailable. Use email verification to continue."
        >
          <ShieldAlert size={20} color={themeColors.warning} />
          <Text style={styles.noticeText}>
            We do not have a production phone OTP provider connected yet. Please
            continue with email verification or sign in to your account.
          </Text>
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            title="Use Email Verification"
            onPress={() => router.replace("/(auth)/verify-email")}
            accessibilityLabel="Use email verification instead"
          />
          <SecondaryButton
            title="Back to Sign In"
            variant="white"
            onPress={() => router.replace("/(auth)/signin")}
            accessibilityLabel="Back to sign in"
          />
        </View>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
  },
  iconWrap: {
    alignSelf: "center",
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.lg,
  },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  noticeText: {
    flex: 1,
    color: withAlpha(colors.neutral.white, 0.86),
    fontFamily: theme.fontFamilies.body.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  actions: {
    gap: theme.spacing.md,
  },
});
