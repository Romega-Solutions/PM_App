import AccountProgress from "@/src/components/account/AccountProgress";
import VerificationProcessingCard from "@/src/components/account/VerificationProcessingCard";
import VerificationStep from "@/src/components/account/VerificationStep";
import GhostButton from "@/src/components/ui/GhostButton";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import type { UserType } from "@/src/features/auth/api/authApi";
import { colors, theme, withAlpha } from "@/src/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Camera, FileText, Shield } from "lucide-react-native";
import React, { useEffect } from "react";
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useVerificationUpload } from "../hooks/useVerificationUpload";

const BRAND_BG = theme.lightColors.brandBackground;
const BRAND_GRADIENT = [BRAND_BG, colors.dalisay[950]] as const;

export default function VerificationUploadScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ userType?: string }>();

  // Get userType from params
  const userType = params.userType as UserType;

  const {
    selfieUri,
    documentUri,
    selfieStatus,
    documentStatus,
    loading,
    error,
    takeSelfie,
    uploadDocument,
    isVerified,
  } = useVerificationUpload();

  // Redirect if no userType
  useEffect(() => {
    if (!userType || (userType !== "filipina" && userType !== "foreigner")) {
      console.warn(
        "⚠️ No valid userType in verification, redirecting to signin"
      );
      router.replace("/(auth)/signin");
    }
  }, [userType, router]);

  const handleNext = () => {
    if (isVerified) {
      router.push({
        pathname: "/(auth)/account-setup/welcome-complete",
        params: { userType },
      });
    }
  };

  // Identity verification is optional for now (OCR is still mocked). Let the
  // user skip straight to the final step.
  const handleSkip = () => {
    router.push({
      pathname: "/(auth)/account-setup/welcome-complete",
      params: { userType },
    });
  };

  // Don't render if userType is invalid
  if (!userType || (userType !== "filipina" && userType !== "foreigner")) {
    return null;
  }

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={BRAND_BG}
      />
      {insets.top > 0 && (
        <View
          style={{
            height: insets.top,
            backgroundColor: BRAND_BG,
          }}
        />
      )}

      <LinearGradient
        colors={BRAND_GRADIENT}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom + 24, 40) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <AccountProgress steps={5} activeIndex={4} />
          <Shield size={28} color={theme.colors.amihan[500]} style={{ marginTop: 12 }} />
          <Text style={styles.title}>Verify your identity</Text>
          <Text style={styles.subtitle}>
            Help keep the community safe. Verified accounts gain more trust.
          </Text>
        </View>

        <View style={{ gap: 16 }}>
          {!selfieUri ? (
            <VerificationStep
              Icon={Camera}
              title="Take a verification selfie"
              description="Face the camera with good lighting. Keep your face centered."
              onPress={takeSelfie}
            />
          ) : (
            <VerificationProcessingCard
              type="selfie"
              status={selfieStatus}
              title="Verification selfie"
              description="We are checking the image quality and authenticity."
            />
          )}

          {!documentUri ? (
            <VerificationStep
              Icon={FileText}
              title="Upload an ID document"
              description="Driver's license, passport, or any valid government ID."
              onPress={uploadDocument}
            />
          ) : (
            <VerificationProcessingCard
              type="document"
              status={documentStatus}
              title="ID document"
              description="We are validating the document information."
            />
          )}
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.helper}>
          <Shield size={16} color={withAlpha(colors.neutral.white, 0.85)} />
          <Text style={styles.helperText}>
            Your files are encrypted and used only for verification. They are
            not shared with other users.
          </Text>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom + 16, 32) },
        ]}
      >
        <PrimaryButton
          title="Continue"
          onPress={handleNext}
          disabled={!isVerified || loading}
          loading={loading}
        />
        <GhostButton
          title="Skip for now"
          onPress={handleSkip}
          disabled={loading}
          accessibilityHint="Skip identity verification and finish setting up your account"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND_BG },
  content: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 32 : 24,
  },
  header: { alignItems: "center", marginBottom: 24 },
  title: {
    fontSize: 28,
    color: colors.neutral.white,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 8,
    fontFamily: theme.fontFamilies?.header?.semiBold ?? "System",
  },
  subtitle: {
    fontSize: 15,
    color: withAlpha(colors.neutral.white, 0.85),
    textAlign: "center",
    paddingHorizontal: 20,
  },
  errorBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: withAlpha(colors.error[600], 0.12),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error[600],
  },
  errorText: { color: colors.error[600], fontSize: 13 },
  helper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    padding: 12,
    backgroundColor: withAlpha(colors.neutral.white, 0.08),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: withAlpha(colors.neutral.white, 0.2),
  },
  helperText: {
    flex: 1,
    fontSize: 13,
    color: withAlpha(colors.neutral.white, 0.85),
    lineHeight: 19,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: theme.spacing.md ?? 16,
    backgroundColor: withAlpha(BRAND_BG, 0.95),
  },
});
