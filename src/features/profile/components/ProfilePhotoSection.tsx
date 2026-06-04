/**
 * ProfilePhotoSection Component
 * 
 * Displays and allows editing of profile photo.
 * Shows upload progress when uploading a new photo.
 * 
 * Features:
 * - Current profile photo or placeholder
 * - Change photo button
 * - Upload progress overlay
 */

import { useTheme } from "@/src/theme";
import { Camera, User } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ProfilePhotoSectionProps {
  photoUri: string | null;
  isUploading: boolean;
  uploadProgress: number;
  onChangePhoto: () => void;
}

export const ProfilePhotoSection: React.FC<ProfilePhotoSectionProps> = ({
  photoUri,
  isUploading,
  uploadProgress,
  onChangePhoto,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.photoSection}>
      <View style={styles.photoWrap}>
        {photoUri && photoUri.startsWith("http") ? (
          <Image source={{ uri: photoUri }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <User size={32} color={colors.primary} />
          </View>
        )}
        {isUploading && (
          <View style={styles.uploadOverlay}>
            <ActivityIndicator size="large" color={colors.onPrimary} />
            <Text style={styles.uploadProgress}>{uploadProgress}%</Text>
          </View>
        )}
      </View>
      <TouchableOpacity
        style={styles.changePhotoBtn}
        onPress={onChangePhoto}
        disabled={isUploading}
        accessibilityRole="button"
        accessibilityLabel={isUploading ? "Uploading profile photo" : "Change profile photo"}
        accessibilityState={{ disabled: isUploading, busy: isUploading }}
      >
        <Camera size={16} color={colors.onPrimary} />
        <Text style={styles.changePhotoText}>
          {isUploading ? "Uploading..." : "Change Photo"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
  photoSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 32,
  },
  photoWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: colors.primary,
    marginBottom: 12,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.brandSurface,
    justifyContent: "center",
    alignItems: "center",
  },
  changePhotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  changePhotoText: {
    color: colors.secondary,
    fontSize: 14,
    fontFamily: "DMSans-SemiBold",
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.brandScrim,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  uploadProgress: {
    color: colors.onPrimary,
    fontSize: 16,
    fontFamily: "DMSans-Bold",
  },
});
