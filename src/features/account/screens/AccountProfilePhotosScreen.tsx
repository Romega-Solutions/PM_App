import PhotoPicker from "@/src/components/account/PhotoPicker";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import { theme } from "@/src/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
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
  const {
    photos,
    loading,
    loadingInitial,
    pickFromGallery,
    takePhoto,
    uploadPhoto,
    removePhoto,
  } = useProfilePhotos();

  const onAdd = useCallback(async () => {
    // show gallery first; you can prompt user to choose camera/gallery UI in future
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
    // continue to next setup step
    router.push("/(auth)/account-setup/location");
  };

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.dalisay[950]}
      />
      <LinearGradient
        colors={[theme.colors.dalisay[950], "#1A0F1F"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom + 20, 32) },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Add your photo</Text>
        <Text style={styles.subtitle}>
          Upload at least one clear and recent photo
        </Text>

        <View style={{ height: 12 }} />

        <PhotoPicker
          photos={photos}
          onAdd={onAdd}
          onRemove={onRemove}
          canAdd={!loading && photos.length < 6}
        />

        <View style={{ height: 10 }} />
        <Text style={styles.helper}>
          Tap a photo to replace or use the Add button
        </Text>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom + 12, 20) },
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
  root: { flex: 1, backgroundColor: theme.colors.dalisay[950] },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === "ios" ? theme.spacing.xl : theme.spacing.lg,
  },
  title: {
    fontSize: 22,
    color: theme.colors.neutral.white,
    fontFamily: theme.fontFamilies.header.semiBold,
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginBottom: 10,
  },
  helper: { color: "rgba(255,255,255,0.6)", textAlign: "center", fontSize: 13 },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    backgroundColor: "rgba(15,8,20,0.95)",
  },
});
