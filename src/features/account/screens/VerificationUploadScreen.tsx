import VerificationProcessingCard from "@/src/components/account/VerificationProcessingCard";
import VerificationStep from "@/src/components/account/VerificationStep";
import GhostButton from "@/src/components/ui/GhostButton";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import { theme } from "@/src/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Camera, FileText, Shield } from "lucide-react-native";
import React from "react";
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

  const handleNext = () => {
    if (isVerified) {
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
      >
        <View style={styles.header}>
          <Shield size={28} color="#EF3E78" />
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
          <Shield size={16} color="rgba(255,255,255,0.85)" />
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
        <View style={{ height: 10 }} />
        <GhostButton title="Skip for now" onPress={handleSkip} />
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
  },
  errorBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "rgba(239,68,68,0.12)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  errorText: { color: "#EF4444", fontSize: 13 },
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
  footer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    backgroundColor: "rgba(15,8,20,0.95)",
  },
});
