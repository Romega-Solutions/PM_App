import AccountProgress from "@/src/components/account/AccountProgress";
import PhotoPicker from "@/src/components/account/PhotoPicker";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import type { UserType } from "@/src/features/auth/api/authApi";
import { theme } from "@/src/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect } from "react";
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useProfilePhotos } from "../hooks/useProfilePhotos";

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
    takePhoto,
    uploadPhoto,
    removePhoto,
  } = useProfilePhotos();

  // Redirect if no userType
  useEffect(() => {
    if (!userType || (userType !== "filipina" && userType !== "foreigner")) {
      console.warn(
        "⚠️ No valid userType in profile photos, redirecting to signin"
      );
      router.replace("/(auth)/signin");
    }
  }, [userType, router]);

  const onAdd = useCallback(async () => {
    const uri = await pickFromGallery();
    if (uri) await uploadPhoto(uri);
  }, [pickFromGallery, uploadPhoto]);

  const onRemove = useCallback(
    async (uri: string) => {
      await removePhoto(uri);
    },
    [removePhoto]
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
            Upload at least one clear and recent photo of yourself
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
          disabled={photos.length === 0 || loading || loadingInitial}
          loading={loading || loadingInitial}
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
  },
  helper: {
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    fontSize: 13,
    marginTop: 16,
    paddingHorizontal: 20,
  },
  footer: {
    paddingHorizontal: theme.spacing.lg ?? 24,
    paddingTop: theme.spacing.md ?? 16,
    backgroundColor: "rgba(15,8,20,0.95)",
  },
});
