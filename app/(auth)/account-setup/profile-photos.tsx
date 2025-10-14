// app/(auth)/account-setup/profile-photos.tsx
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Camera,
  CheckCircle2,
  Image as ImageIcon,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PrimaryButton from "../../../src/components/ui/PrimaryButton";

const { width, height } = Dimensions.get("window");

// Brand Colors
const BRAND_BG = "#0F0814";
const ACCENT_PURPLE = "#8D69F6";
const ACCENT_PINK = "#EF3E78";
const SUCCESS_GREEN = "#10B981";
const WHITE = "#FFFFFF";
const SURFACE = "rgba(255,255,255,0.08)";
const SURFACE_BORDER = "rgba(141,105,246,0.25)";

// Responsive Typography
const TITLE_SIZE = Math.min(width * 0.08, 32);
const SUBTITLE_SIZE = 15;

// Card dimensions
const CARD_WIDTH = width - 48;
const CARD_HEIGHT = Math.round(CARD_WIDTH * 1.25);

export default function ProfilePhotos() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [photo, setPhoto] = useState<string | null>(null);

  const requestGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Permission Required",
        "Allow photo library access to continue."
      );
      return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.85,
    });
    if (!result.canceled) return result.assets[0].uri;
    return null;
  };

  const requestCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission Required", "Allow camera access to continue.");
      return null;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.85,
    });
    if (!result.canceled) return result.assets[0].uri;
    return null;
  };

  const addOrReplacePhoto = () => {
    Alert.alert(
      photo ? "Replace Photo" : "Add Photo",
      "Choose how you would like to add a photo",
      [
        {
          text: "Camera",
          onPress: async () => {
            const uri = await requestCamera();
            if (uri) setPhoto(uri);
          },
        },
        {
          text: "Gallery",
          onPress: async () => {
            const uri = await requestGallery();
            if (uri) setPhoto(uri);
          },
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const removePhoto = () => setPhoto(null);

  const isFormValid = () => !!photo;

  const handleNext = () => {
    if (isFormValid()) {
      router.push("/(auth)/account-setup/location");
    }
  };

  return (
    <View style={styles.root}>
      {/* Status Bar Configuration */}
      <StatusBar
        barStyle="light-content"
        backgroundColor={BRAND_BG}
        translucent={false}
      />
      {Platform.OS === "ios" && (
        <View style={{ height: insets.top, backgroundColor: BRAND_BG }} />
      )}

      {/* Background Gradient */}
      <LinearGradient
        colors={[BRAND_BG, "#1A0F1F", "#2D1B35", BRAND_BG]}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 24, 40) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            {[1, 2, 3, 4, 5].map((step, idx) => (
              <View
                key={step}
                style={[
                  styles.progressDot,
                  idx <= 1 && styles.progressDotActive,
                  idx === 1 && styles.progressDotCurrent,
                ]}
              />
            ))}
          </View>

          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Add your photo</Text>
          </View>

          <Text style={styles.subtitle}>
            Upload at least one clear and recent photo of yourself
          </Text>
        </View>

        {/* Photo Card */}
        <TouchableOpacity
          onPress={addOrReplacePhoto}
          activeOpacity={0.9}
          style={[styles.photoCard, photo && styles.photoCardFilled]}
          accessibilityRole="button"
          accessibilityLabel={photo ? "Replace photo" : "Add photo"}
        >
          {photo ? (
            <>
              <Image
                source={{ uri: photo }}
                style={styles.photoImage}
                resizeMode="cover"
              />

              {/* Remove Button */}
              <TouchableOpacity
                onPress={removePhoto}
                accessibilityRole="button"
                accessibilityLabel="Remove photo"
                style={styles.removeBtn}
                activeOpacity={0.85}
              >
                <X size={16} color={WHITE} strokeWidth={2.5} />
              </TouchableOpacity>

              {/* Profile Photo Tag */}
              <View style={styles.profileTag}>
                <CheckCircle2 size={12} color={WHITE} strokeWidth={2.5} />
                <Text style={styles.profileTagText}>PROFILE PHOTO</Text>
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.iconContainer}>
                <Camera size={40} color={ACCENT_PINK} strokeWidth={2} />
              </View>
              <Text style={styles.emptyStateTitle}>Add Your Photo</Text>
              <Text style={styles.emptyStateSubtitle}>
                Tap to upload from gallery or camera
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Photo Counter */}
        <View style={styles.counterContainer}>
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>{photo ? "1" : "0"} / 1</Text>
          </View>
          <Text style={styles.counterLabel}>
            photo{photo ? " " : "s "}added
          </Text>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsContainer}>
          <View style={styles.tipsHeader}>
            <View style={styles.tipsIconBox}>
              <ImageIcon size={18} color={ACCENT_PINK} strokeWidth={2.5} />
            </View>
            <Text style={styles.tipsTitle}>Photo Tips</Text>
          </View>

          <View style={styles.tipsList}>
            <TipItem text="Use a clear, recent photo of yourself" />
            <TipItem text="Good lighting and a friendly smile help" />
            <TipItem text="Avoid heavy filters or sunglasses" />
          </View>
        </View>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Text style={styles.securityText}>
            Your photo will be reviewed to ensure it meets our community
            guidelines
          </Text>
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom + 16, 32) },
        ]}
      >
        <PrimaryButton
          title="Continue"
          onPress={handleNext}
          disabled={!isFormValid()}
          accessibilityLabel="Continue to location setup"
          accessibilityHint="Proceeds to location preferences"
        />
      </View>
    </View>
  );
}

interface TipItemProps {
  text: string;
}

const TipItem: React.FC<TipItemProps> = ({ text }) => (
  <View style={styles.tipItem}>
    <View style={styles.tipDot} />
    <Text style={styles.tipText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND_BG,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 32 : 24,
  },

  // Progress Section
  progressSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  progressBar: {
    flexDirection: "row",
    marginBottom: 28,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  progressDotActive: {
    backgroundColor: ACCENT_PINK,
  },
  progressDotCurrent: {
    width: 28,
  },

  // Header
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  title: {
    fontSize: TITLE_SIZE,
    fontFamily: "Lora-Bold",
    color: WHITE,
    textAlign: "center",
    letterSpacing: 0.4,
    ...Platform.select({
      ios: {
        textShadowColor: "rgba(0, 0, 0, 0.6)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
      },
    }),
  },
  subtitle: {
    fontSize: SUBTITLE_SIZE,
    fontFamily: "DMSans-Regular",
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
    letterSpacing: 0.2,
  },

  // Photo Card
  photoCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignSelf: "center",
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: SURFACE_BORDER,
    backgroundColor: SURFACE,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  photoCardFilled: {
    borderStyle: "solid",
    borderColor: ACCENT_PINK,
    ...Platform.select({
      ios: {
        shadowColor: ACCENT_PINK,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  photoImage: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(239, 62, 120, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "rgba(239, 62, 120, 0.3)",
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: "Lora-Bold",
    color: WHITE,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: 20,
    letterSpacing: 0.2,
  },

  // Buttons on Photo
  removeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 12,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  profileTag: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: SUCCESS_GREEN,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    ...Platform.select({
      ios: {
        shadowColor: SUCCESS_GREEN,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  profileTagText: {
    color: WHITE,
    fontSize: 10,
    fontFamily: "DMSans-Bold",
    letterSpacing: 0.5,
  },

  // Counter
  counterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    gap: 8,
  },
  counterBadge: {
    backgroundColor: ACCENT_PINK,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  counterText: {
    fontSize: 14,
    fontFamily: "DMSans-Bold",
    color: WHITE,
    letterSpacing: 0.3,
  },
  counterLabel: {
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    color: "rgba(255, 255, 255, 0.7)",
    letterSpacing: 0.2,
  },

  // Tips
  tipsContainer: {
    backgroundColor: "rgba(141, 105, 246, 0.12)",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(141, 105, 246, 0.25)",
    marginBottom: 20,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  tipsIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(239, 62, 120, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  tipsTitle: {
    fontSize: 16,
    fontFamily: "Lora-Bold",
    color: WHITE,
    letterSpacing: 0.3,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ACCENT_PINK,
    marginTop: 7,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
    letterSpacing: 0.2,
  },

  // Security Note
  securityNote: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  securityText: {
    fontSize: 13,
    fontFamily: "DMSans-Regular",
    color: "rgba(255, 255, 255, 0.65)",
    textAlign: "center",
    lineHeight: 19,
    letterSpacing: 0.2,
  },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    backgroundColor: "rgba(15, 8, 20, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(141, 105, 246, 0.15)",
  },
});
