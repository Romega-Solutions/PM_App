// app/(auth)/account-setup/verification-upload.tsx
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Camera,
  CheckCircle,
  Clock,
  FileText,
  Shield,
} from "lucide-react-native";
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
import PrimaryButton from "../../../src/components/ui/PrimaryButton";
import SecondaryButton from "../../../src/components/ui/SecondaryButton";

const { width } = Dimensions.get("window");

// Brand system (match basic-info.tsx)
const BRAND_BG = "#0F0814";
const ACCENT_PURPLE = "#8D69F6";
const ACCENT_PINK = "#EF3E78";
const WHITE = "#FFFFFF";
const SURFACE = "rgba(255,255,255,0.08)";
const SURFACE_BORDER = "rgba(141,105,246,0.25)";
const ICON_BG = "rgba(141,105,246,0.12)";

// Responsive type
const TITLE_SIZE = Math.min(width * 0.08, 32);
const SUBTITLE_SIZE = 15;
const STEP_TITLE = Math.min(width * 0.045, 18);
const STEP_DESC = 14;

// Card chrome
const STEP_PAD_V = Platform.OS === "ios" ? 16 : 14;
const STEP_MIN_H = Platform.OS === "ios" ? 60 : 56;
const ICON_BOX = Math.min(Math.max(width * 0.11, 36), 42);

// Dynamic container style (must be outside StyleSheet.create)
const getStepContainerActive = (accent: string) => ({
  backgroundColor: "rgba(255,255,255,0.06)",
  borderRadius: 16,
  borderWidth: 1.5,
  borderColor: accent,
  paddingHorizontal: 16,
  paddingVertical: STEP_PAD_V,
  minHeight: STEP_MIN_H,
});

// ────────────────────────────────────────────────────────────────────────────
// Processing Card (restyled to match basic-info containers)
// ────────────────────────────────────────────────────────────────────────────
const VerificationProcessingCard = ({
  type,
  status,
  title,
  description,
}: {
  type: "selfie" | "document";
  status: "pending" | "processing" | "verified" | "rejected";
  title: string;
  description: string;
}) => {
  const statusMeta = (() => {
    switch (status) {
      case "verified":
        return { color: "#22C55E", text: "Verified" };
      case "processing":
        return { color: "#F59E0B", text: "Processing" };
      case "rejected":
        return { color: "#EF4444", text: "Needs review" };
      default:
        return { color: ACCENT_PINK, text: "Pending" };
    }
  })();

  const Icon =
    status === "verified"
      ? CheckCircle
      : status === "processing"
        ? Clock
        : type === "selfie"
          ? Camera
          : FileText;

  return (
    <View style={getStepContainerActive(statusMeta.color)}>
      <View style={styles.stepHeader}>
        <View style={[styles.iconBox, { backgroundColor: ICON_BG }]}>
          <Icon size={20} color={statusMeta.color} />
        </View>
        <Text style={styles.stepTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={[styles.statusPill, { borderColor: statusMeta.color }]}>
          <View
            style={[styles.statusDot, { backgroundColor: statusMeta.color }]}
          />
          <Text style={[styles.statusText, { color: statusMeta.color }]}>
            {statusMeta.text}
          </Text>
        </View>
      </View>

      <Text style={styles.stepDesc}>{description}</Text>
    </View>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// Screen
// ────────────────────────────────────────────────────────────────────────────
export default function VerificationUpload() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [verificationPhoto, setVerificationPhoto] = useState<string>("");
  const [idDocument, setIdDocument] = useState<string>("");
  const [selfieStatus, setSelfieStatus] = useState<
    "pending" | "processing" | "verified" | "rejected"
  >("pending");
  const [documentStatus, setDocumentStatus] = useState<
    "pending" | "processing" | "verified" | "rejected"
  >("pending");

  const takeVerificationPhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission required", "Camera access is required.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.9,
    });
    if (!result.canceled) {
      setVerificationPhoto(result.assets[0].uri);
      setSelfieStatus("processing");
      setTimeout(() => setSelfieStatus("verified"), 2000);
    }
  };

  const uploadIdDocument = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission required", "Gallery access is required.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
    });
    if (!result.canceled) {
      setIdDocument(result.assets[0].uri);
      setDocumentStatus("processing");
      setTimeout(() => setDocumentStatus("verified"), 3000);
    }
  };

  const isFormValid = () =>
    selfieStatus === "verified" && documentStatus === "verified";

  const handleNext = () => {
    if (isFormValid()) {
      router.push("/(auth)/account-setup/welcome-complete");
    }
  };

  const handleSkip = () => {
    Alert.alert(
      "Skip verification",
      "You can verify later in Settings. Verified profiles receive more visibility.",
      [
        {
          text: "Skip for now",
          onPress: () => router.push("/(auth)/account-setup/welcome-complete"),
        },
        { text: "Continue setup", style: "cancel" },
      ]
    );
  };

  return (
    <View style={styles.root}>
      {/* Status Bar to brand color (same as basic-info) */}
      <StatusBar
        barStyle="light-content"
        backgroundColor={BRAND_BG}
        translucent={false}
      />
      {Platform.OS === "ios" && (
        <View style={{ height: insets.top, backgroundColor: BRAND_BG }} />
      )}

      {/* Background gradient (same recipe as basic-info) */}
      <LinearGradient
        colors={[BRAND_BG, "#1A0F1F", "#2D1B35", BRAND_BG]}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom + 24, 40) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Progress and header */}
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              {[1, 2, 3, 4, 5].map((step, idx) => (
                <View
                  key={step}
                  style={[
                    styles.progressDot,
                    idx === 4 && styles.progressDotActive,
                  ]} // step 5 active
                />
              ))}
            </View>

            <View style={styles.headerContainer}>
              <Shield size={28} color={ACCENT_PINK} />
              <Text style={styles.title}>Verify your identity</Text>
            </View>

            <Text style={styles.subtitle}>
              Help keep the community safe. Verified accounts gain more trust.
            </Text>
          </View>

          {/* Steps */}
          <View style={{ gap: 16 }}>
            {/* Step 1: Selfie */}
            {!verificationPhoto ? (
              <TouchableOpacity
                onPress={takeVerificationPhoto}
                activeOpacity={0.9}
                accessibilityRole="button"
                accessibilityLabel="Take verification selfie"
                style={styles.stepContainer}
              >
                <View style={styles.stepHeader}>
                  <View style={[styles.iconBox, { backgroundColor: ICON_BG }]}>
                    <Camera size={20} color={ACCENT_PURPLE} />
                  </View>
                  <Text style={styles.stepTitle} numberOfLines={1}>
                    Take a verification selfie
                  </Text>
                </View>
                <Text style={styles.stepDesc}>
                  Face the camera with good lighting. Keep your face centered.
                </Text>
              </TouchableOpacity>
            ) : (
              <VerificationProcessingCard
                type="selfie"
                status={selfieStatus}
                title="Verification selfie"
                description="We are checking the image quality and authenticity."
              />
            )}

            {/* Step 2: Document */}
            {!idDocument ? (
              <TouchableOpacity
                onPress={uploadIdDocument}
                activeOpacity={0.9}
                accessibilityRole="button"
                accessibilityLabel="Upload ID document"
                style={styles.stepContainer}
              >
                <View style={styles.stepHeader}>
                  <View style={[styles.iconBox, { backgroundColor: ICON_BG }]}>
                    <FileText size={20} color={ACCENT_PURPLE} />
                  </View>
                  <Text style={styles.stepTitle} numberOfLines={1}>
                    Upload an ID document
                  </Text>
                </View>
                <Text style={styles.stepDesc}>
                  Driver’s license, passport, or any valid government ID.
                </Text>
              </TouchableOpacity>
            ) : (
              <VerificationProcessingCard
                type="document"
                status={documentStatus}
                title="ID document"
                description="We are validating the document information."
              />
            )}
          </View>

          {/* Privacy note */}
          <View style={styles.helperContainer}>
            <View style={styles.helperRow}>
              <Shield size={16} color={"rgba(255,255,255,0.85)"} />
              <Text style={styles.helperText}>
                Your files are encrypted and used only for verification. They
                are not shared with other users.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer CTAs (match basic-info footer) */}
        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom + 16, 32) },
          ]}
        >
          <PrimaryButton
            title="Complete Setup"
            onPress={handleNext}
            disabled={!isFormValid()}
            accessibilityLabel="Complete account setup"
            accessibilityHint="Finishes the verification process"
          />
          <View style={{ height: 10 }} />
          <SecondaryButton
            title="Skip for now"
            variant="ghost"
            onPress={handleSkip}
            accessibilityLabel="Skip verification"
            accessibilityHint="Continues without verification"
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND_BG },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 32 : 24,
  },

  // Progress
  progressSection: {
    alignItems: "center",
    marginBottom: 28,
  },
  progressBar: {
    flexDirection: "row",
    marginBottom: 24,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  progressDotActive: {
    width: 28,
    backgroundColor: ACCENT_PINK,
  },

  // Header
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  title: {
    fontSize: TITLE_SIZE,
    fontFamily: "Lora-Bold",
    color: WHITE,
    letterSpacing: 0.4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: SUBTITLE_SIZE,
    fontFamily: "DMSans-Regular",
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
    letterSpacing: 0.2,
  },

  // Step containers
  stepContainer: {
    backgroundColor: SURFACE,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: SURFACE_BORDER,
    paddingHorizontal: 16,
    paddingVertical: STEP_PAD_V,
    minHeight: STEP_MIN_H,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconBox: {
    width: ICON_BOX,
    height: ICON_BOX,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: ICON_BG,
  },
  stepTitle: {
    flex: 1,
    fontSize: STEP_TITLE,
    fontFamily: "DMSans-SemiBold",
    color: WHITE,
    letterSpacing: 0.2,
  },
  stepDesc: {
    marginLeft: ICON_BOX + 12,
    fontSize: STEP_DESC,
    fontFamily: "DMSans-Regular",
    color: "rgba(255,255,255,0.85)",
    lineHeight: 20,
  },

  // Status pill
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginLeft: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontFamily: "DMSans-SemiBold",
    fontSize: 12,
  },

  // Helper
  helperContainer: {
    marginTop: 20,
    paddingHorizontal: 8,
  },
  helperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  helperText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "DMSans-Regular",
    color: "rgba(255,255,255,0.85)",
    lineHeight: 19,
    letterSpacing: 0.2,
  },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    backgroundColor: "rgba(15, 8, 20, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(141, 105, 246, 0.15)",
  },
});
