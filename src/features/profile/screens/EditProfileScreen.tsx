/**
 * EditProfileScreen
 * 
 * Main screen for editing user profile information and photos.
 * Uses feature hooks for data fetching and updates.
 * 
 * Features:
 * - Edit profile photo
 * - Update personal information (name, occupation, education, location)
 * - Real-time upload progress
 * - Form validation
 * - Auto-save on back navigation
 * 
 * Architecture:
 * - Uses ProfilePhotoSection, ProfileEditForm components
 * - Integrates with profile hooks (useProfile, useUpdateProfile, useUploadPhoto)
 * - Clean separation of concerns
 */

import { useProfile } from "@/src/features/profile/hooks/userProfile";
import { useUpdateProfile } from "@/src/features/profile/hooks/useUpdateProfile";
import { useUploadPhoto } from "@/src/features/profile/hooks/useUploadPhoto";
import { useIsDemoSession } from "@/src/features/auth/demoMode";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { makeStyles } from "../../../theme/makeStyles";
import { useAppTheme } from "../../../theme/ThemeContext";
import { EditProfileHeader } from "../components/EditProfileHeader";
import { ProfileEditForm } from "../components/ProfileEditForm";
import { ProfilePhotoSection } from "../components/ProfilePhotoSection";

const BRAND_BG = "#0F0814";

export default function EditProfileScreen() {
  const styles = useStyles();
  const theme = useAppTheme();
  const router = useRouter();
  const isDemoMode = useIsDemoSession();

  // Use custom hooks
  const { profile, loading, refresh } = useProfile();
  const { updateProfile, updating } = useUpdateProfile();
  const {
    pickAndUploadPhoto,
    uploading: uploadingPhoto,
    progress,
  } = useUploadPhoto();

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [occupation, setOccupation] = useState("");
  const [education, setEducation] = useState("");
  const [location, setLocation] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [allPhotos, setAllPhotos] = useState<string[]>([]);

  // Load profile data into form
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setOccupation(profile.occupation || "");
      setEducation(profile.education || "");
      setLocation(profile.location_name || "");

      const photosArray = profile.photos || [];
      setAllPhotos(photosArray);
      setProfileImage(photosArray.length > 0 ? photosArray[0] : null);
    }
  }, [profile]);

  const handleChangePhoto = async () => {
    const result = await pickAndUploadPhoto(allPhotos);

    if (result.success && result.url) {
      setProfileImage(result.url);
      setAllPhotos([result.url, ...allPhotos]);
      Alert.alert(
        "Success",
        isDemoMode
          ? "Demo photo added locally. Live uploads still save to storage when demo mode is off."
          : "Photo uploaded successfully!",
      );

      if (!isDemoMode) {
        // Refresh profile to get updated data
        refresh();
      }
    }
  };

  const handleSave = async () => {
    const success = await updateProfile({
      first_name: firstName,
      last_name: lastName,
      occupation: occupation,
      education: education,
      location_name: location,
    });

    if (success) {
      Alert.alert(
        "Success",
        isDemoMode
          ? "Demo profile changes saved locally for this preview."
          : "Profile updated successfully!",
      );
      router.replace("/profile");
    } else {
      Alert.alert("Error", "Failed to update profile");
    }
  };

  const handleBack = () => {
    router.replace("/profile");
  };

  if (loading) {
    return (
      <View style={[styles.root, styles.centered]}>
        <StatusBar barStyle="light-content" backgroundColor={BRAND_BG} />
        <LinearGradient
          colors={[
          theme.semanticColors.background,
          theme.colors.dalisay[900],
          theme.colors.dalisay[900],
          theme.semanticColors.background,
        ]}
          locations={[0, 0.3, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color={theme.semanticColors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_BG} />

      <LinearGradient
        colors={[
          theme.semanticColors.background,
          theme.colors.dalisay[900],
          theme.colors.dalisay[900],
          theme.semanticColors.background,
        ]}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      <EditProfileHeader
        onBack={handleBack}
        onSave={handleSave}
        isSaving={updating || uploadingPhoto}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ProfilePhotoSection
          photoUri={profileImage}
          isUploading={uploadingPhoto}
          uploadProgress={progress}
          onChangePhoto={handleChangePhoto}
        />

        <ProfileEditForm
          firstName={firstName}
          lastName={lastName}
          occupation={occupation}
          education={education}
          location={location}
          onFirstNameChange={setFirstName}
          onLastNameChange={setLastName}
          onOccupationChange={setOccupation}
          onEducationChange={setEducation}
          onLocationChange={setLocation}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.semanticColors.background,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
}));
