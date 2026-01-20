import { useProfile } from "@/src/features/profile/hooks/userProfile";
import { useUpdateProfile } from "@/src/features/profile/hooks/useUpdateProfile";
import { useUploadPhoto } from "@/src/features/profile/hooks/useUploadPhoto";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, Camera, Save, User } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const isSmallDevice = width < 375;

const BRAND_BG = "#0F0814";
const ACCENT_PURPLE = "#8D69F6";
const ACCENT_PINK = "#EF3E78";
const WHITE = "#FFFFFF";
const SURFACE_STRONG = "rgba(255, 255, 255, 0.08)";
const TILE_BORDER = "rgba(168, 85, 247, 0.13)";

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
      Alert.alert("Success", "Photo uploaded successfully!");
      // Refresh profile to get updated data
      refresh();
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
      Alert.alert("Success", "Profile updated successfully!");
      router.back();
    } else {
      Alert.alert("Error", "Failed to update profile");
    }
  };

  if (loading) {
    return (
      <View style={[styles.root, styles.centered]}>
        <StatusBar barStyle="light-content" backgroundColor={BRAND_BG} />
        <LinearGradient
          colors={[BRAND_BG, "#1A0F1F", "#2D1B35", BRAND_BG]}
          locations={[0, 0.3, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color={ACCENT_PINK} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_BG} />
      {Platform.OS === "ios" && (
        <View style={{ height: insets.top, backgroundColor: BRAND_BG }} />
      )}

      <LinearGradient
        colors={[BRAND_BG, "#1A0F1F", "#2D1B35", BRAND_BG]}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/(main)/profile")}
          style={styles.backBtn}
        >
          <ArrowLeft size={24} color={WHITE} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={updating || uploadingPhoto}
        >
          {updating ? (
            <ActivityIndicator size="small" color={ACCENT_PINK} />
          ) : (
            <Save size={24} color={ACCENT_PINK} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Photo */}
        <View style={styles.photoSection}>
          <View style={styles.photoWrap}>
            {profileImage && profileImage.startsWith("http") ? (
              <Image source={{ uri: profileImage }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <User size={32} color={ACCENT_PINK} />
              </View>
            )}
            {uploadingPhoto && (
              <View style={styles.uploadOverlay}>
                <ActivityIndicator size="large" color={WHITE} />
                <Text style={styles.uploadProgress}>{progress}%</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.changePhotoBtn}
            onPress={handleChangePhoto}
            disabled={uploadingPhoto}
          >
            <Camera size={16} color={WHITE} />
            <Text style={styles.changePhotoText}>
              {uploadingPhoto ? "Uploading..." : "Change Photo"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter first name"
              placeholderTextColor="rgba(255,255,255,0.4)"
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter last name"
              placeholderTextColor="rgba(255,255,255,0.4)"
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Occupation</Text>
            <TextInput
              style={styles.input}
              value={occupation}
              onChangeText={setOccupation}
              placeholder="Enter occupation"
              placeholderTextColor="rgba(255,255,255,0.4)"
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Education</Text>
            <TextInput
              style={styles.input}
              value={education}
              onChangeText={setEducation}
              placeholder="Enter education"
              placeholderTextColor="rgba(255,255,255,0.4)"
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Enter location"
              placeholderTextColor="rgba(255,255,255,0.4)"
            />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND_BG,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    color: WHITE,
    fontFamily: "DMSans-Bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
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
  form: {
    gap: 20,
  },
  fieldWrap: {
    gap: 8,
  },
  label: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontFamily: "DMSans-SemiBold",
  },
  input: {
    backgroundColor: SURFACE_STRONG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: TILE_BORDER,
    padding: 16,
    color: WHITE,
    fontSize: 16,
    fontFamily: "DMSans-Regular",
  },
  textArea: {
    height: 100,
    paddingTop: 16,
  },
});
