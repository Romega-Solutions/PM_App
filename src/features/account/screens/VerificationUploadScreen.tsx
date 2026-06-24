import AccountProgress from "@/src/components/account/AccountProgress";
import VerificationProcessingCard from "@/src/components/account/VerificationProcessingCard";
import VerificationStep from "@/src/components/account/VerificationStep";
import GhostButton from "@/src/components/ui/GhostButton";
import { LaunchStateNotice } from "@/src/components/ui/LaunchStateNotice";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import type { UserType } from "@/src/features/auth/api/authApi";
import { theme } from "@/src/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AlertCircle,
  Camera,
  Clock,
  FileText,
  Shield,
} from "lucide-react-native";
import React, { useEffect } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useVerificationUpload } from "../hooks/useVerificationUpload";

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
    isSubmittedForReview,
  } = useVerificationUpload();

  const hasSelfie = Boolean(selfieUri);
  const hasDocument = Boolean(documentUri);
  const isProcessing =
    loading || selfieStatus === "processing" || documentStatus === "processing";
  const verificationStatus = (() => {
    if (isSubmittedForReview) {
      return {
        Icon: Clock,
        tone: "#F59E0B",
        title: "Review pending",
        body: "Your selfie and ID were submitted for review. Continue setup now; the verified badge appears only after approval.",
      };
    }

    if (isProcessing) {
      return {
        Icon: Clock,
        tone: "#F59E0B",
        title: "Review in progress",
        body: "Keep this screen open while your upload finishes. These files are not shown on your public profile.",
      };
    }

    if (!hasSelfie) {
      return {
        Icon: Camera,
        tone: "#8D69F6",
        title: "Selfie needed first",
        body: "Take a clear selfie first. Use good lighting and keep only your face in frame.",
      };
    }

    if (!hasDocument) {
      return {
        Icon: FileText,
        tone: "#8D69F6",
        title: "ID document needed",
        body: "Your selfie is saved. Upload a valid ID document to submit the private review request.",
      };
    }

    return {
      Icon: Clock,
      tone: "#F59E0B",
      title: "Submitted for review",
      body: "Your files were submitted for review. You can continue setup, and the verified badge appears only after approval.",
    };
  })();
  const { Icon: VerificationStatusIcon } = verificationStatus;

  // Redirect if no userType
  useEffect(() => {
    if (!userType || (userType !== "filipina" && userType !== "foreigner")) {
      router.replace("/(auth)/signin");
    }
  }, [userType, router]);

  const handleNext = () => {
    if (isSubmittedForReview) {
      router.push({
        pathname: "/(auth)/account-setup/welcome-complete",
        params: { userType },
      });
    }
  };

  const handleSkip = () => {
    Alert.alert(
      "Skip verification",
      "You can submit verification later in Settings. Skipping does not block account setup, and the verified badge appears only after an approved review.",
      [
        {
          text: "Skip for now",
          onPress: () =>
            router.push({
              pathname: "/(auth)/account-setup/welcome-complete",
              params: { userType },
            }),
        },
        { text: "Continue setup", style: "cancel" },
      ],
    );
  };

  // Don't render if userType is invalid
  if (!userType || (userType !== "filipina" && userType !== "foreigner")) {
    return null;
  }

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.dalisay[950] ?? "#0F0814"}
      />
      {Platform.OS === "ios" && (
        <View
          style={{
            height: insets.top,
            backgroundColor: theme.colors.dalisay[950] ?? "#0F0814",
          }}
        />
      )}

      <LinearGradient
        colors={[theme.colors.dalisay[950] ?? "#0F0814", "#1A0F1F"]}
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
          <Shield size={28} color="#EF3E78" style={{ marginTop: 12 }} />
          <Text style={styles.title}>Verify your identity</Text>
          <Text style={styles.subtitle}>
            Submit a clear selfie and ID for private review. Verification can
            add context after approval, but it does not replace your own
            judgment.
          </Text>
        </View>

        <LaunchStateNotice
          testID="verification-upload-launch-state-notice"
          title="Review-based verification"
          message="Private review, not instant approval. Selfie and ID uploads support a private review path. Approval is not automatic, and your verified badge appears only after approval. Verified status does not guarantee another member is safe."
          accessibilityLabel="Verification note. Review-based verification means selfie and ID uploads support private review, approval is not automatic, your verified badge appears only after approval, and verified status does not guarantee member safety."
        />

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
              description="Selfie captured. Submit your ID document next to request private review."
            />
          )}

          {!documentUri ? (
            <VerificationStep
              Icon={FileText}
              title="Upload an ID document"
              description="Use a valid government ID. Keep the image clear and do not upload payment cards or passwords."
              onPress={uploadDocument}
            />
          ) : (
            <VerificationProcessingCard
              type="document"
              status={documentStatus}
              title="ID document"
              description="Your document is attached for private review."
            />
          )}
        </View>

        {error ? (
          <View
            style={styles.errorBox}
            accessibilityRole="alert"
            accessibilityLabel={`Verification error. ${error}`}
          >
            <AlertCircle size={18} color="#FCA5A5" strokeWidth={2.4} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View
          style={[
            styles.statusPanel,
            { borderColor: `${verificationStatus.tone}66` },
          ]}
          accessible
          accessibilityLabel={`${verificationStatus.title}. ${verificationStatus.body}`}
        >
          <View
            style={[
              styles.statusIconBox,
              { backgroundColor: `${verificationStatus.tone}22` },
            ]}
          >
            <VerificationStatusIcon
              size={20}
              color={verificationStatus.tone}
              strokeWidth={2.4}
            />
          </View>
          <View style={styles.statusTextWrap}>
            <Text style={styles.statusTitle}>{verificationStatus.title}</Text>
            <Text style={styles.statusBody}>{verificationStatus.body}</Text>
          </View>
        </View>

        <View style={styles.helper}>
          <Shield size={16} color="rgba(255,255,255,0.85)" />
          <Text style={styles.helperText}>
            Your selfie and ID are used for private verification review. They
            are not shared with other users or displayed on your profile.
          </Text>
        </View>

        <View
          style={styles.limitsCard}
          accessible
          accessibilityLabel="Verification limits. Review is private, approval is not automatic, and support will not ask for passwords or payment in this flow."
        >
          <Text style={styles.limitsTitle}>Verification limits</Text>
          {[
            "Review is private and handled through the secure review process.",
            "Submitting files does not automatically approve a verified badge.",
            "Skipping verification does not block setup; the verified badge appears only after approved review.",
            "Do not upload payment cards, passwords, or unrelated documents.",
            "Support will not ask for passwords or payment in this flow.",
          ].map((item) => (
            <View key={item} style={styles.limitsRow}>
              <View style={styles.limitsDot} />
              <Text style={styles.limitsText}>{item}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom + 16, 32) },
        ]}
      >
        <PrimaryButton
          title={
            isSubmittedForReview
              ? "Continue with review pending"
              : "Submit ID first"
          }
          onPress={handleNext}
          disabled={!isSubmittedForReview || loading}
          loading={loading}
          accessibilityLabel={
            isSubmittedForReview
              ? "Continue setup with verification review pending"
              : "Submit your selfie and ID before continuing"
          }
          accessibilityHint={
            isSubmittedForReview
              ? "Opens the completed profile summary"
              : "Complete the selfie and ID submission before continuing"
          }
        />
        <View style={{ height: 10 }} />
        <GhostButton
          title="Skip for now"
          onPress={handleSkip}
          accessibilityLabel="Skip identity verification for now"
          accessibilityHint="Continues setup without a verified badge"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.dalisay[950] ?? "#0F0814" },
  content: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 32 : 24,
  },
  header: { alignItems: "center", marginBottom: 24 },
  title: {
    fontSize: 28,
    color: "#FFF",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 8,
    fontFamily: theme.fontFamilies?.header?.semiBold ?? "System",
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 16,
    padding: 12,
    backgroundColor: "rgba(239,68,68,0.12)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  errorText: { flex: 1, color: "#FCA5A5", fontSize: 13, lineHeight: 19 },
  statusPanel: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 16,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 16,
    borderWidth: 1.5,
  },
  statusIconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  statusTextWrap: { flex: 1 },
  statusTitle: {
    fontSize: 15,
    color: "#FFF",
    fontFamily: theme.fontFamilies?.body?.semiBold ?? "System",
    marginBottom: 4,
  },
  statusBody: {
    fontSize: 13,
    color: "rgba(255,255,255,0.82)",
    lineHeight: 19,
  },
  helper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  helperText: {
    flex: 1,
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 19,
  },
  limitsCard: {
    marginTop: 12,
    padding: 14,
    backgroundColor: "rgba(141,105,246,0.1)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(141,105,246,0.24)",
    gap: 10,
  },
  limitsTitle: {
    fontSize: 14,
    color: "#FFF",
    fontFamily: theme.fontFamilies?.body?.semiBold ?? "System",
  },
  limitsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  limitsDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#EF3E78",
    marginTop: 6,
  },
  limitsText: {
    flex: 1,
    fontSize: 13,
    color: "rgba(255,255,255,0.78)",
    lineHeight: 19,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: theme.spacing.md ?? 16,
    backgroundColor: "rgba(15,8,20,0.95)",
  },
});
