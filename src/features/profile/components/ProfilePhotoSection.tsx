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
import { makeStyles } from "../../../theme/makeStyles";
import { useAppTheme, AppTheme } from "../../../theme/ThemeContext";

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
  const styles = useStyles();
  const theme = useAppTheme();
  const remotePhotoUri = photoUri?.startsWith("http") ? photoUri : null;
  const uploadStatusLabel = `Uploading profile photo, ${uploadProgress}% complete`;

  return (
    <View style={styles.photoSection}>
      <View
        style={styles.photoWrap}
        accessible
        accessibilityRole="image"
        accessibilityLabel={
          remotePhotoUri ? "Current profile photo" : "Profile photo placeholder"
        }
      >
        {remotePhotoUri ? (
          <Image
            source={{ uri: remotePhotoUri }}
            style={styles.photo}
            accessible={false}
          />
        ) : (
          <View style={styles.photoPlaceholder}>
            <User size={32} color={theme.semanticColors.primary} />
          </View>
        )}
        {isUploading && (
          <View
            style={styles.uploadOverlay}
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={uploadStatusLabel}
            accessibilityLiveRegion="polite"
          >
            <ActivityIndicator size="large" color={theme.semanticColors.text} />
            <Text style={styles.uploadProgress}>{uploadProgress}%</Text>
          </View>
        )}
      </View>
      <TouchableOpacity
        style={styles.changePhotoBtn}
        onPress={onChangePhoto}
        disabled={isUploading}
        activeOpacity={0.84}
        accessibilityRole="button"
        accessibilityLabel={
          isUploading ? "Profile photo is uploading" : "Change profile photo"
        }
        accessibilityHint={
          isUploading
            ? "Wait for the upload to finish before choosing another photo"
            : "Opens your photo picker to choose a new profile photo"
        }
        accessibilityState={{ disabled: isUploading, busy: isUploading }}
      >
        <Camera size={16} color={theme.semanticColors.text} />
        <Text style={styles.changePhotoText}>
          {isUploading ? "Uploading..." : "Change Photo"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const useStyles = makeStyles((theme) => ({
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
    borderColor: theme.semanticColors.primary,
    marginBottom: 12,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  changePhotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: "rgba(141, 105, 246, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(141, 105, 246, 0.34)",
  },
  changePhotoText: {
    color: theme.semanticColors.secondary,
    fontSize: 14,
    fontFamily: "DMSans-SemiBold",
  },
  uploadOverlay: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  uploadProgress: {
    color: theme.semanticColors.text,
    fontSize: 16,
    fontFamily: "DMSans-Bold",
  },
}));
