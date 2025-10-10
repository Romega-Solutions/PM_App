import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ChevronRight, Camera, Plus, X, Image as ImageIcon } from "lucide-react-native";
import React, { useState } from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

const { width, height } = Dimensions.get("window");

export default function ProfilePhotos() {
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>([]);
  const maxPhotos = 6;

  const pickImage = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert("Maximum Photos", `You can only upload up to ${maxPhotos} photos.`);
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const takePhoto = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert("Maximum Photos", `You can only upload up to ${maxPhotos} photos.`);
      return;
    }

    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Permission to access camera is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };

  const isFormValid = () => {
    return photos.length >= 2; // Minimum 2 photos required
  };

  const handleNext = () => {
    if (isFormValid()) {
      router.push("/(auth)/account-setup/location");
    }
  };

  const renderPhotoSlot = (index: number) => {
    const hasPhoto = photos[index];
    
    return (
      <TouchableOpacity
        key={index}
        onPress={hasPhoto ? undefined : () => {
          Alert.alert(
            "Add Photo",
            "Choose how you'd like to add a photo",
            [
              { text: "Camera", onPress: takePhoto },
              { text: "Gallery", onPress: pickImage },
              { text: "Cancel", style: "cancel" }
            ]
          );
        }}
        style={{
          width: (width - 80) / 2,
          height: (width - 80) / 2 * 1.25,
          backgroundColor: hasPhoto ? "transparent" : "rgba(255, 255, 255, 0.1)",
          borderRadius: 16,
          borderWidth: 2,
          borderColor: hasPhoto ? "#EF3E78" : "rgba(255, 255, 255, 0.3)",
          borderStyle: hasPhoto ? "solid" : "dashed",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          position: "relative",
        }}
        activeOpacity={0.8}
      >
        {hasPhoto ? (
          <>
            <Image
              source={{ uri: photos[index] }}
              style={{ width: "100%", height: "100%", borderRadius: 14 }}
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={() => removePhoto(index)}
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                borderRadius: 12,
                width: 24,
                height: 24,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <X size={16} color="#FFFFFF" />
            </TouchableOpacity>
            {index === 0 && (
              <View style={{
                position: "absolute",
                bottom: 8,
                left: 8,
                backgroundColor: "#EF3E78",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
              }}>
                <Text style={{
                  color: "#FFFFFF",
                  fontSize: 10,
                  fontFamily: "PlayfairDisplay-SemiBold",
                }}>
                  MAIN
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={{ alignItems: "center" }}>
            <Plus size={32} color="rgba(255, 255, 255, 0.6)" strokeWidth={1.5} />
            <Text style={{
              color: "rgba(255, 255, 255, 0.6)",
              fontSize: 12,
              fontFamily: "PlayfairDisplay-Regular",
              marginTop: 8,
              textAlign: "center",
            }}>
              {index === 0 ? "Main Photo" : `Photo ${index + 1}`}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Brand Gradient Background */}
      <LinearGradient
        colors={["#340839", "#8D69F6", "#EF3E78", "#340839"]}
        locations={[0, 0.4, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 32,
          paddingTop: Platform.select({ ios: height * 0.08, android: height * 0.06 }),
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          {/* Progress Indicator */}
          <View style={{ flexDirection: "row", marginBottom: 32, gap: 8 }}>
            {[1, 2, 3, 4, 5].map((step, index) => (
              <View
                key={step}
                style={{
                  width: index === 1 ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: index <= 1 ? "#EF3E78" : "rgba(255, 255, 255, 0.3)",
                }}
              />
            ))}
          </View>

          <Text
            style={{
              fontSize: Math.min(width * 0.08, 32),
              fontFamily: "PlayfairDisplay-Bold",
              color: "#FFFFFF",
              textAlign: "center",
              marginBottom: 12,
              textShadowColor: "rgba(0, 0, 0, 0.8)",
              textShadowOffset: { width: 0, height: 3 },
              textShadowRadius: 10,
            }}
          >
            Add your photos
          </Text>

          <Text
            style={{
              fontSize: 16,
              fontFamily: "PlayfairDisplay-Regular",
              color: "rgba(255, 255, 255, 0.8)",
              textAlign: "center",
              lineHeight: 24,
              paddingHorizontal: 20,
            }}
          >
            Upload at least 2 photos to continue.{"\n"}Your first photo will be your main photo.
          </Text>
        </View>

        {/* Photo Grid */}
        <View style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 32,
        }}>
          {Array.from({ length: maxPhotos }, (_, index) => renderPhotoSlot(index))}
        </View>

        {/* Photo Tips */}
        <View style={{
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderRadius: 16,
          padding: 20,
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.2)",
          marginBottom: 32,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <ImageIcon size={20} color="#EF3E78" style={{ marginRight: 8 }} />
            <Text style={{
              fontSize: 16,
              fontFamily: "PlayfairDisplay-SemiBold",
              color: "#FFFFFF",
            }}>
              Photo Tips
            </Text>
          </View>
          <Text style={{
            fontSize: 14,
            fontFamily: "PlayfairDisplay-Regular",
            color: "rgba(255, 255, 255, 0.8)",
            lineHeight: 20,
          }}>
            • Use clear, recent photos of yourself{"\n"}
            • Smile and make eye contact with the camera{"\n"}
            • Include variety: close-ups and full body shots{"\n"}
            • Avoid group photos or heavy filters
          </Text>
        </View>

        {/* Photo Count */}
        <Text style={{
          fontSize: 14,
          fontFamily: "PlayfairDisplay-Regular",
          color: "rgba(255, 255, 255, 0.7)",
          textAlign: "center",
          marginBottom: 20,
        }}>
          {photos.length} of {maxPhotos} photos added
          {photos.length < 2 && ` • ${2 - photos.length} more required`}
        </Text>
      </ScrollView>

      {/* Continue Button */}
      <View style={{ paddingHorizontal: 32, paddingBottom: 40 }}>
        <TouchableOpacity
          style={{
            borderRadius: 28,
            paddingVertical: 18,
            paddingHorizontal: 32,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#EF3E78",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isFormValid() ? 0.5 : 0.2,
            shadowRadius: 20,
            elevation: 12,
            width: "100%",
            minHeight: 56,
            opacity: isFormValid() ? 1 : 0.6,
          }}
          onPress={handleNext}
          disabled={!isFormValid()}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={isFormValid() ? ["#EF3E78", "#8D69F6"] : ["#666", "#999"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              borderRadius: 28,
            }}
          />
          <Text style={{
            color: "#FFFFFF",
            fontSize: 18,
            fontFamily: "PlayfairDisplay-SemiBold",
            fontWeight: "600",
            marginRight: 8,
            letterSpacing: 0.5,
            zIndex: 1,
          }}>
            Continue
          </Text>
          <ChevronRight size={24} color="#FFFFFF" strokeWidth={2.5} style={{ zIndex: 1 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}