import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Camera,
  CheckCircle,
  Clock,
  FileText,
  Shield,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PrimaryButton from "../../../src/components/ui/PrimaryButton";
import SecondaryButton from "../../../src/components/ui/SecondaryButton";

const { width, height } = Dimensions.get("window");

// Placeholder component for verification processing
const VerificationProcessingCard = ({
  type,
  status,
  title,
  description,
}: {
  type: "selfie" | "document";
  status: "pending" | "processing" | "verified" | "rejected";
  title: string;
  description: string;
}) => {
  const getStatusColor = () => {
    switch (status) {
      case "verified":
        return "#22c55e";
      case "processing":
        return "#f59e0b";
      case "rejected":
        return "#ef4444";
      default:
        return "#EF3E78";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "verified":
        return <CheckCircle size={20} color="#FFFFFF" />;
      case "processing":
        return <Clock size={20} color="#FFFFFF" />;
      case "rejected":
        return <FileText size={20} color="#FFFFFF" />;
      default:
        return type === "selfie" ? (
          <Camera size={20} color="#FFFFFF" />
        ) : (
          <FileText size={20} color="#FFFFFF" />
        );
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "verified":
        return "Verified ✓";
      case "processing":
        return "Processing...";
      case "rejected":
        return "Needs review";
      default:
        return "Pending";
    }
  };

  return (
    <View
      style={{
        backgroundColor:
          status === "verified"
            ? "rgba(34, 197, 94, 0.1)"
            : "rgba(255, 255, 255, 0.1)",
        borderRadius: 16,
        borderWidth: 2,
        borderColor:
          status === "verified" ? "#22c55e" : "rgba(255, 255, 255, 0.3)",
        padding: Platform.select({ ios: 20, android: 18 }),
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: Platform.select({ ios: 12, android: 10 }),
        }}
      >
        <View
          style={{
            backgroundColor: getStatusColor(),
            borderRadius: Platform.select({ ios: 20, android: 18 }),
            padding: Platform.select({ ios: 8, android: 7 }),
            marginRight: 12,
          }}
        >
          {getStatusIcon()}
        </View>
        <View style={{ flex: 1 }}>
          {/* Card title - Using HelloParis for UI elements */}
          <Text
            style={{
              fontSize: Platform.select({ ios: 18, android: 17 }),
              fontFamily: "HelloParis",
              fontWeight: "600",
              color: "#FFFFFF",
              marginBottom: 4,
            }}
          >
            {title}
          </Text>
          {/* Status text - Using PlayfairDisplay for body text */}
          <Text
            style={{
              fontSize: Platform.select({ ios: 12, android: 11 }),
              fontFamily: "PlayfairDisplay",
              fontWeight: "400",
              color: getStatusColor(),
            }}
          >
            {getStatusText()}
          </Text>
        </View>
      </View>
      {/* Description - Using PlayfairDisplay for body text */}
      <Text
        style={{
          fontSize: Platform.select({ ios: 14, android: 13 }),
          fontFamily: "PlayfairDisplay",
          fontWeight: "400",
          color: "rgba(255, 255, 255, 0.8)",
          lineHeight: Platform.select({ ios: 20, android: 18 }),
          marginLeft: 44,
        }}
      >
        {description}
      </Text>
    </View>
  );
};

export default function VerificationUpload() {
  const router = useRouter();
  const [verificationPhoto, setVerificationPhoto] = useState<string>("");
  const [idDocument, setIdDocument] = useState<string>("");
  const [selfieStatus, setSelfieStatus] = useState<
    "pending" | "processing" | "verified" | "rejected"
  >("pending");
  const [documentStatus, setDocumentStatus] = useState<
    "pending" | "processing" | "verified" | "rejected"
  >("pending");

  const takeVerificationPhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "Permission to access camera is required!"
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.9,
    });

    if (!result.canceled) {
      setVerificationPhoto(result.assets[0].uri);
      setSelfieStatus("processing");

      // Simulate processing time
      setTimeout(() => {
        setSelfieStatus("verified");
      }, 2000);
    }
  };

  const uploadIdDocument = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "Permission to access gallery is required!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
    });

    if (!result.canceled) {
      setIdDocument(result.assets[0].uri);
      setDocumentStatus("processing");

      // Simulate processing time
      setTimeout(() => {
        setDocumentStatus("verified");
      }, 3000);
    }
  };

  const isFormValid = () => {
    return selfieStatus === "verified" && documentStatus === "verified";
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
        {
          text: "Skip for now",
          onPress: () => router.push("/(auth)/account-setup/welcome-complete"),
        },
        { text: "Continue Setup", style: "cancel" },
      ]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

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
          paddingTop: Platform.select({
            ios: height * 0.08,
            android: height * 0.06,
          }),
          paddingBottom: Platform.select({ ios: 40, android: 32 }),
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          {/* Progress Indicator */}
          <View
            style={{
              flexDirection: "row",
              marginBottom: 32,
              gap: Platform.select({ ios: 8, android: 6 }),
            }}
          >
            {[1, 2, 3, 4, 5].map((step, index) => (
              <View
                key={step}
                style={{
                  width: index === 4 ? 24 : 8,
                  height: Platform.select({ ios: 8, android: 6 }),
                  borderRadius: Platform.select({ ios: 4, android: 3 }),
                  backgroundColor:
                    index <= 4 ? "#EF3E78" : "rgba(255, 255, 255, 0.3)",
                }}
              />
            ))}
          </View>

          {/* Shield Icon with Glow */}
          <View
            style={{
              backgroundColor: "rgba(239, 62, 120, 0.15)",
              borderRadius: 50,
              padding: 24,
              marginBottom: 32,
              borderWidth: 2,
              borderColor: "rgba(239, 62, 120, 0.3)",
              shadowColor: "#EF3E78",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 20,
              elevation: 12,
            }}
          >
            <Shield size={48} color="#EF3E78" strokeWidth={2} />
          </View>

          {/* Main heading - Using HelloParis for UI elements */}
          <Text
            style={{
              fontSize: Math.min(
                width * 0.08,
                Platform.select({ ios: 32, android: 30 })
              ),
              fontFamily: "HelloParis",
              fontWeight: "700",
              color: "#FFFFFF",
              textAlign: "center",
              marginBottom: 12,
              textShadowColor: "rgba(0, 0, 0, 0.8)",
              textShadowOffset: { width: 0, height: 3 },
              textShadowRadius: 10,
              letterSpacing: Platform.select({ ios: -0.5, android: -0.3 }),
            }}
          >
            Verify your identity
          </Text>

          {/* Subtitle - Using PlayfairDisplay for body text */}
          <Text
            style={{
              fontSize: Platform.select({ ios: 16, android: 15 }),
              fontFamily: "PlayfairDisplay",
              fontWeight: "400",
              color: "rgba(255, 255, 255, 0.8)",
              textAlign: "center",
              lineHeight: Platform.select({ ios: 24, android: 22 }),
              paddingHorizontal: 20,
            }}
          >
            Help keep our community safe.{"\n"}Verified profiles get 3x more
            matches!
          </Text>
        </View>

        {/* Verification Steps */}
        <View style={{ gap: Platform.select({ ios: 24, android: 20 }) }}>
          {/* Step 1: Verification Photo */}
          {!verificationPhoto ? (
            <TouchableOpacity
              onPress={takeVerificationPhoto}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: 16,
                borderWidth: 2,
                borderColor: "rgba(255, 255, 255, 0.3)",
                padding: Platform.select({ ios: 20, android: 18 }),
              }}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Take verification selfie"
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: Platform.select({ ios: 12, android: 10 }),
                }}
              >
                <View
                  style={{
                    backgroundColor: "#EF3E78",
                    borderRadius: Platform.select({ ios: 20, android: 18 }),
                    padding: Platform.select({ ios: 8, android: 7 }),
                    marginRight: 12,
                  }}
                >
                  <Camera size={20} color="#FFFFFF" />
                </View>
                {/* Step title - Using HelloParis for UI elements */}
                <Text
                  style={{
                    fontSize: Platform.select({ ios: 18, android: 17 }),
                    fontFamily: "HelloParis",
                    fontWeight: "600",
                    color: "#FFFFFF",
                    flex: 1,
                  }}
                >
                  Take a verification selfie
                </Text>
              </View>
              {/* Step description - Using PlayfairDisplay for body text */}
              <Text
                style={{
                  fontSize: Platform.select({ ios: 14, android: 13 }),
                  fontFamily: "PlayfairDisplay",
                  fontWeight: "400",
                  color: "rgba(255, 255, 255, 0.8)",
                  lineHeight: Platform.select({ ios: 20, android: 18 }),
                  marginLeft: 44,
                }}
              >
                Hold up a peace sign and look directly at the camera
              </Text>
            </TouchableOpacity>
          ) : (
            <VerificationProcessingCard
              type="selfie"
              status={selfieStatus}
              title="Verification Selfie"
              description="Hold up a peace sign and look directly at the camera"
            />
          )}

          {/* Step 2: ID Document */}
          {!idDocument ? (
            <TouchableOpacity
              onPress={uploadIdDocument}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: 16,
                borderWidth: 2,
                borderColor: "rgba(255, 255, 255, 0.3)",
                padding: Platform.select({ ios: 20, android: 18 }),
              }}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Upload ID document"
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: Platform.select({ ios: 12, android: 10 }),
                }}
              >
                <View
                  style={{
                    backgroundColor: "#EF3E78",
                    borderRadius: Platform.select({ ios: 20, android: 18 }),
                    padding: Platform.select({ ios: 8, android: 7 }),
                    marginRight: 12,
                  }}
                >
                  <FileText size={20} color="#FFFFFF" />
                </View>
                {/* Step title - Using HelloParis for UI elements */}
                <Text
                  style={{
                    fontSize: Platform.select({ ios: 18, android: 17 }),
                    fontFamily: "HelloParis",
                    fontWeight: "600",
                    color: "#FFFFFF",
                    flex: 1,
                  }}
                >
                  Upload ID document
                </Text>
              </View>
              {/* Step description - Using PlayfairDisplay for body text */}
              <Text
                style={{
                  fontSize: Platform.select({ ios: 14, android: 13 }),
                  fontFamily: "PlayfairDisplay",
                  fontWeight: "400",
                  color: "rgba(255, 255, 255, 0.8)",
                  lineHeight: Platform.select({ ios: 20, android: 18 }),
                  marginLeft: 44,
                }}
              >
                Driver's license, passport, or government ID
              </Text>
            </TouchableOpacity>
          ) : (
            <VerificationProcessingCard
              type="document"
              status={documentStatus}
              title="ID Document"
              description="Driver's license, passport, or government ID"
            />
          )}
        </View>

        {/* Privacy Notice */}
        <View
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            borderRadius: 12,
            padding: Platform.select({ ios: 16, android: 14 }),
            marginTop: Platform.select({ ios: 32, android: 28 }),
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.2)",
          }}
        >
          {/* Privacy notice - Using PlayfairDisplay for body text */}
          <Text
            style={{
              fontSize: Platform.select({ ios: 14, android: 13 }),
              fontFamily: "PlayfairDisplay",
              fontWeight: "400",
              color: "rgba(255, 255, 255, 0.8)",
              lineHeight: Platform.select({ ios: 20, android: 18 }),
              textAlign: "center",
            }}
          >
            🔒 Your documents are encrypted and only used for verification. They
            will not be shared with other users.
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons - Using Custom Components */}
      <View
        style={{
          paddingHorizontal: 32,
          paddingBottom: Platform.select({ ios: 40, android: 32 }),
          gap: Platform.select({ ios: 12, android: 10 }),
        }}
      >
        {/* Continue Button - Using PrimaryButton */}
        <PrimaryButton
          title="Complete Setup"
          onPress={handleNext}
          disabled={!isFormValid()}
          accessibilityLabel="Complete account setup"
          accessibilityHint="Finishes the verification process"
        />

        {/* Skip Button - Using SecondaryButton */}
        <SecondaryButton
          title="Skip for now"
          variant="ghost"
          onPress={handleSkip}
          accessibilityLabel="Skip verification"
          accessibilityHint="Continues without verification"
        />
      </View>
    </View>
  );
}
