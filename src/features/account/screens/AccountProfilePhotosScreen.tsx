import AccountProgress from "@/src/components/account/AccountProgress";
import PhotoPicker from "@/src/components/account/PhotoPicker";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import type { UserType } from "@/src/features/auth/api/authApi";
import { colors, theme, withAlpha } from "@/src/theme";
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

const BRAND_BG = theme.lightColors.brandBackground;
const BRAND_GRADIENT = [BRAND_BG, colors.dalisay[950]] as const;

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
          Remove a photo and use Add to upload a different one
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
  root: { flex: 1, backgroundColor: BRAND_BG },
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
    color: withAlpha(colors.neutral.white, 0.85),
    textAlign: "center",
    paddingHorizontal: 20,
  },
  helper: {
    color: withAlpha(colors.neutral.white, 0.6),
    textAlign: "center",
    fontSize: 13,
    marginTop: 16,
    paddingHorizontal: 20,
  },
  footer: {
    paddingHorizontal: theme.spacing.lg ?? 24,
    paddingTop: theme.spacing.md ?? 16,
    backgroundColor: withAlpha(BRAND_BG, 0.95),
  },
});
