import AccountProgress from "@/src/components/account/AccountProgress";
import PhotoPicker from "@/src/components/account/PhotoPicker";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import type { UserType } from "@/src/features/auth/api/authApi";
import { theme } from "@/src/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CheckCircle2, ShieldAlert } from "lucide-react-native";
import React, { useCallback, useEffect } from "react";
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
import { useProfilePhotos } from "../hooks/useProfilePhotos";

const photoGuidelines = [
  "Use a recent photo where your face is clearly visible.",
  "Avoid group photos, heavy filters, sunglasses, or covered faces.",
  "Do not upload IDs, documents, screenshots, or someone else's photos.",
  "Add more than one photo when possible to give future matches clearer context.",
];

export default function AccountProfilePhotosScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ userType?: string }>();

  // Get userType from params
  const userType = params.userType as UserType;

  const {
    photos,
    loading,
    loadingInitial,
    pickFromGallery,
    uploadPhoto,
    removePhoto,
  } = useProfilePhotos();

  // Redirect if no userType
  useEffect(() => {
    if (!userType || (userType !== "filipina" && userType !== "foreigner")) {
      router.replace("/(auth)/signin");
    }
  }, [userType, router]);

  const onAdd = useCallback(async () => {
    const uri = await pickFromGallery();
    if (uri) await uploadPhoto(uri);
  }, [pickFromGallery, uploadPhoto]);

  const onRemove = useCallback(
    async (uri: string) => {
      Alert.alert(
        "Remove this photo?",
        "This removes the photo from your profile setup. If it was already visible, it may no longer appear to future matches after the change is saved.",
        [
          { text: "Keep photo", style: "cancel" },
          {
            text: "Remove photo",
            style: "destructive",
            onPress: () => void removePhoto(uri),
          },
        ],
      );
    },
    [removePhoto],
  );

  const handleNext = async () => {
    if (photos.length === 0) return;
    router.push({
      pathname: "/(auth)/account-setup/location",
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
          <AccountProgress steps={5} activeIndex={1} />
          <Text style={styles.title}>Add your photos</Text>
          <Text style={styles.subtitle}>
            Upload at least one clear, recent photo of yourself. Good photos
            help future matches understand who they are viewing.
          </Text>
        </View>

        <View style={styles.guidelinesCard}>
          <View style={styles.guidelinesHeader}>
            <ShieldAlert size={20} color="#F59E0B" strokeWidth={2.4} />
            <Text style={styles.guidelinesTitle}>Photo safety checklist</Text>
          </View>
          {photoGuidelines.map((guideline) => (
            <View key={guideline} style={styles.guidelineRow}>
              <CheckCircle2 size={16} color="#22C55E" strokeWidth={2.4} />
              <Text style={styles.guidelineText}>{guideline}</Text>
            </View>
          ))}
        </View>

        <View
          style={styles.privacyCard}
          accessible
          accessibilityLabel="Profile photo privacy. Profile photos can become visible in discovery or to matches when launch settings allow it. Do not upload ID documents here."
        >
          <Text style={styles.privacyTitle}>Profile photo privacy</Text>
          <Text style={styles.privacyText}>
            These photos can become visible in discovery or to matches when
            privacy settings, review status, and launch availability allow it.
            Keep ID documents, screenshots, and private records out of this
            step.
          </Text>
        </View>

        <PhotoPicker
          photos={photos}
          onAdd={onAdd}
          onRemove={onRemove}
          canAdd={!loading && photos.length < 6}
        />

        <Text style={styles.helper}>
          Tap a photo to replace it, or use the Add button to upload more
        </Text>

        {photos.length > 0 ? (
          <View
            style={styles.reviewReminder}
            accessible
            accessibilityLabel="Photo review reminder. Confirm the uploaded photo is yours, recent, and appropriate before continuing."
          >
            <Text style={styles.reviewReminderTitle}>
              Quick check before continuing
            </Text>
            <Text style={styles.reviewReminderText}>
              Make sure every photo is yours and appropriate for future profile
              visibility. Reported fake, explicit, or misleading photos may be
              reviewed or removed.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom + 16, 32) },
        ]}
      >
        <PrimaryButton
          title={
            photos.length > 0 ? "Continue with these photos" : "Add a photo"
          }
          onPress={handleNext}
          disabled={photos.length === 0 || loading || loadingInitial}
          loading={loading || loadingInitial}
          loadingLabel="Checking photos..."
          accessibilityLabel={
            photos.length > 0
              ? "Continue with uploaded profile photos"
              : "Add at least one profile photo before continuing"
          }
          accessibilityHint={
            photos.length > 0
              ? "Continues to the location step after your profile photos are ready."
              : "Upload one clear recent photo before continuing."
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.dalisay[950] ?? "#0F0814" },
  content: {
    paddingHorizontal: theme.spacing.lg ?? 24,
    paddingTop:
      Platform.OS === "ios"
        ? (theme.spacing.xl ?? 32)
        : (theme.spacing.lg ?? 24),
  },
  header: { alignItems: "center", marginBottom: 24 },
  title: {
    fontSize: 28,
    color: theme.colors.neutral.white,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 8,
    fontFamily: theme.fontFamilies.header.semiBold,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  guidelinesCard: {
    gap: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.28)",
    marginBottom: 18,
  },
  guidelinesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  guidelinesTitle: {
    flex: 1,
    color: theme.colors.neutral.white,
    fontSize: 15,
    fontFamily: theme.fontFamilies.body?.semiBold ?? "System",
  },
  guidelineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  guidelineText: {
    flex: 1,
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
    lineHeight: 18,
  },
  privacyCard: {
    gap: 6,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(141,105,246,0.1)",
    borderWidth: 1,
    borderColor: "rgba(141,105,246,0.24)",
    marginBottom: 18,
  },
  privacyTitle: {
    color: theme.colors.neutral.white,
    fontSize: 14,
    fontFamily: theme.fontFamilies.body?.semiBold ?? "System",
  },
  privacyText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
    lineHeight: 19,
  },
  helper: {
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    fontSize: 13,
    marginTop: 16,
    paddingHorizontal: 20,
  },
  reviewReminder: {
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(239,62,120,0.12)",
    borderWidth: 1,
    borderColor: "rgba(239,62,120,0.26)",
  },
  reviewReminderTitle: {
    color: theme.colors.neutral.white,
    fontSize: 14,
    fontFamily: theme.fontFamilies.body?.semiBold ?? "System",
    marginBottom: 6,
  },
  reviewReminderText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
    lineHeight: 19,
  },
  footer: {
    paddingHorizontal: theme.spacing.lg ?? 24,
    paddingTop: theme.spacing.md ?? 16,
    backgroundColor: "rgba(15,8,20,0.95)",
  },
});
