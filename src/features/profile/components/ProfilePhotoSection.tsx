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

const ACCENT_PINK = "#EF3E78";
const ACCENT_PURPLE = "#8D69F6";
const WHITE = "#FFFFFF";
const SURFACE_STRONG = "rgba(255, 255, 255, 0.08)";

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
  return (
    <View style={styles.photoSection}>
      <View style={styles.photoWrap}>
        {photoUri && photoUri.startsWith("http") ? (
          <Image source={{ uri: photoUri }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <User size={32} color={ACCENT_PINK} />
          </View>
        )}
        {isUploading && (
          <View style={styles.uploadOverlay}>
            <ActivityIndicator size="large" color={WHITE} />
            <Text style={styles.uploadProgress}>{uploadProgress}%</Text>
          </View>
        )}
      </View>
      <TouchableOpacity
        style={styles.changePhotoBtn}
        onPress={onChangePhoto}
        disabled={isUploading}
      >
        <Camera size={16} color={WHITE} />
        <Text style={styles.changePhotoText}>
          {isUploading ? "Uploading..." : "Change Photo"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
    borderColor: ACCENT_PINK,
    marginBottom: 12,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: SURFACE_STRONG,
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
    color: ACCENT_PURPLE,
    fontSize: 14,
    fontFamily: "DMSans-SemiBold",
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  uploadProgress: {
    color: WHITE,
    fontSize: 16,
    fontFamily: "DMSans-Bold",
  },
});
