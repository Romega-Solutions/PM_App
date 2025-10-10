import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ChevronRight, Shield, Camera, FileText, CheckCircle } from "lucide-react-native";
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

export default function VerificationUpload() {
  const router = useRouter();
  const [verificationPhoto, setVerificationPhoto] = useState<string>("");
  const [idDocument, setIdDocument] = useState<string>("");

  const takeVerificationPhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Permission to access camera is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.9,
    });

    if (!result.canceled) {
      setVerificationPhoto(result.assets[0].uri);
    }
  };

  const uploadIdDocument = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Permission to access gallery is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
    });

    if (!result.canceled) {
      setIdDocument(result.assets[0].uri);
    }
  };

  const isFormValid = () => {
    return verificationPhoto !== "" && idDocument !== "";
  };

  const handleNext = () => {
    if (isFormValid()) {
      router.push("/(auth)/account-setup/welcome-complete");
    }
  };

  const handleSkip = () => {
    Alert.alert(
      "Skip Verification?",
      "You can verify your account later in settings. Verified profiles get more matches.",
      [
        { text: "Skip for now", onPress: () => router.push("/(auth)/account-setup/welcome-complete") },
        { text: "Continue Setup", style: "cancel" }
      ]
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
                  width: index === 4 ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: index <= 4 ? "#EF3E78" : "rgba(255, 255, 255, 0.3)",
                }}
              />
            ))}
          </View>

          <View style={{
            backgroundColor: "rgba(239, 62, 120, 0.15)",
            borderRadius: 50,
            padding: 20,
            marginBottom: 24,
            borderWidth: 2,
            borderColor: "rgba(239, 62, 120, 0.3)",
          }}>
            <Shield size={40} color="#EF3E78" strokeWidth={2} />
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
            Verify your identity
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
            Help keep our community safe.{"\n"}Verified profiles get 3x more matches!
          </Text>
        </View>

        {/* Verification Steps */}
        <View style={{ gap: 24 }}>
          {/* Step 1: Verification Photo */}
          <TouchableOpacity
            onPress={takeVerificationPhoto}
            style={{
              backgroundColor: verificationPhoto ? "rgba(34, 197, 94, 0.1)" : "rgba(255, 255, 255, 0.1)",
              borderRadius: 16,
              borderWidth: 2,
              borderColor: verificationPhoto ? "#22c55e" : "rgba(255, 255, 255, 0.3)",
              padding: 20,
            }}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <View style={{
                backgroundColor: verificationPhoto ? "#22c55e" : "#EF3E78",
                borderRadius: 20,
                padding: 8,
                marginRight: 12,
              }}>
                {verificationPhoto ? (
                  <CheckCircle size={20} color="#FFFFFF" />
                ) : (
                  <Camera size={20} color="#FFFFFF" />
                )}
              </View>
              <Text style={{
                fontSize: 18,
                fontFamily: "PlayfairDisplay-SemiBold",
                color: "#FFFFFF",
                flex: 1,
              }}>
                Take a verification selfie
              </Text>
            </View>
            <Text style={{
              fontSize: 14,
              fontFamily: "PlayfairDisplay-Regular",
              color: "rgba(255, 255, 255, 0.8)",
              lineHeight: 20,
              marginLeft: 44,
            }}>
              Hold up a peace sign and look directly at the camera
            </Text>
            {verificationPhoto && (
              <Image
                source={{ uri: verificationPhoto }}
                style={{
                  width: 80,
                  height: 100,
                  borderRadius: 8,
                  marginTop: 12,
                  marginLeft: 44,
                }}
                resizeMode="cover"
              />
            )}
          </TouchableOpacity>

          {/* Step 2: ID Document */}
          <TouchableOpacity
            onPress={uploadIdDocument}
            style={{
              backgroundColor: idDocument ? "rgba(34, 197, 94, 0.1)" : "rgba(255, 255, 255, 0.1)",
              borderRadius: 16,
              borderWidth: 2,
              borderColor: idDocument ? "#22c55e" : "rgba(255, 255, 255, 0.3)",
              padding: 20,
            }}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <View style={{
                backgroundColor: idDocument ? "#22c55e" : "#EF3E78",
                borderRadius: 20,
                padding: 8,
                marginRight: 12,
              }}>
                {idDocument ? (
                  <CheckCircle size={20} color="#FFFFFF" />
                ) : (
                  <FileText size={20} color="#FFFFFF" />
                )}
              </View>
              <Text style={{
                fontSize: 18,
                fontFamily: "PlayfairDisplay-SemiBold",
                color: "#FFFFFF",
                flex: 1,
              }}>
                Upload ID document
              </Text>
            </View>
            <Text style={{
              fontSize: 14,
              fontFamily: "PlayfairDisplay-Regular",
              color: "rgba(255, 255, 255, 0.8)",
              lineHeight: 20,
              marginLeft: 44,
            }}>
              Driver's license, passport, or government ID
            </Text>
            {idDocument && (
              <Image
                source={{ uri: idDocument }}
                style={{
                  width: 120,
                  height: 80,
                  borderRadius: 8,
                  marginTop: 12,
                  marginLeft: 44,
                }}
                resizeMode="cover"
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Privacy Notice */}
        <View style={{
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          borderRadius: 12,
          padding: 16,
          marginTop: 32,
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.2)",
        }}>
          <Text style={{
            fontSize: 14,
            fontFamily: "PlayfairDisplay-Regular",
            color: "rgba(255, 255, 255, 0.8)",
            lineHeight: 20,
            textAlign: "center",
          }}>
            🔒 Your documents are encrypted and only used for verification. They will not be shared with other users.
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={{ paddingHorizontal: 32, paddingBottom: 40, gap: 12 }}>
        {/* Continue Button */}
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
            Complete Setup
          </Text>
          <ChevronRight size={24} color="#FFFFFF" strokeWidth={2.5} style={{ zIndex: 1 }} />
        </TouchableOpacity>

        {/* Skip Button */}
        <TouchableOpacity
          onPress={handleSkip}
          style={{
            paddingVertical: 16,
            justifyContent: "center",
            alignItems: "center",
          }}
          activeOpacity={0.7}
        >
          <Text style={{
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: 16,
            fontFamily: "PlayfairDisplay-Regular",
            textDecorationLine: "underline",
          }}>
            Skip for now
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}