import { supabase } from "@/src/config/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, Camera, Save } from "lucide-react-native";
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [occupation, setOccupation] = useState("");
  const [education, setEducation] = useState("");
  const [location, setLocation] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name, bio, occupation, education, location_name, photos")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setBio(data.bio || "");
        setOccupation(data.occupation || "");
        setEducation(data.education || "");
        setLocation(data.location_name || "");
        // Get first photo from array
        const photosArray = data.photos || [];
        setProfileImage(photosArray.length > 0 ? photosArray[0] : null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          bio: bio,
          occupation: occupation,
          education: education,
          location_name: location,
        })
        .eq("id", user.id);

      if (error) throw error;

      Alert.alert("Success", "Profile updated successfully!");
      router.back();
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setSaving(false);
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
        <TouchableOpacity onPress={() => router.push("/(main)/profile")} style={styles.backBtn}>
          <ArrowLeft size={24} color={WHITE} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
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
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Camera size={32} color={ACCENT_PINK} />
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.changePhotoBtn}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
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
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
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
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  changePhotoText: {
    color: ACCENT_PURPLE,
    fontSize: 14,
    fontFamily: "DMSans-SemiBold",
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
