import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Calendar, User, Users } from "lucide-react-native";
import React, { useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomTextInput from "../../../src/components/forms/CustomTextInput";
import PrimaryButton from "../../../src/components/ui/PrimaryButton";

const { width, height } = Dimensions.get("window");

export default function BasicInfo() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
  });

  const genderOptions = ["Woman", "Man", "Non-binary"];
  const minAge = 18;
  const maxAge = 70;

  const isFormValid = () => {
    const age = parseInt(formData.age);
    return (
      formData.firstName.length >= 2 &&
      formData.lastName.length >= 2 &&
      age >= minAge &&
      age <= maxAge &&
      formData.gender !== ""
    );
  };

  const handleNext = () => {
    if (isFormValid()) {
      router.push("/(auth)/account-setup/profile-photos");
    }
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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24, // Consistent with other screens
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
                    width: index === 0 ? 24 : 8,
                    height: Platform.select({ ios: 8, android: 6 }),
                    borderRadius: Platform.select({ ios: 4, android: 3 }),
                    backgroundColor:
                      index === 0 ? "#EF3E78" : "rgba(255, 255, 255, 0.3)",
                  }}
                />
              ))}
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
              Tell us about yourself
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
              }}
            >
              Let's start with the basics
            </Text>
          </View>

          {/* Form Fields */}
          <View style={{ gap: Platform.select({ ios: 20, android: 18 }) }}>
            {/* First Name - Using CustomTextInput */}
            <CustomTextInput
              label="First Name"
              value={formData.firstName}
              onChangeText={(text) =>
                setFormData({ ...formData, firstName: text })
              }
              placeholder="Enter your first name"
              LeftIcon={User}
              autoCapitalize="words"
              autoComplete="given-name"
            />

            {/* Last Name - Using CustomTextInput */}
            <CustomTextInput
              label="Last Name"
              value={formData.lastName}
              onChangeText={(text) =>
                setFormData({ ...formData, lastName: text })
              }
              placeholder="Enter your last name"
              LeftIcon={User}
              autoCapitalize="words"
              autoComplete="family-name"
            />

            {/* Age - Using CustomTextInput */}
            <CustomTextInput
              label="Age"
              value={formData.age}
              onChangeText={(text) => setFormData({ ...formData, age: text })}
              placeholder={`${minAge} - ${maxAge} years old`}
              LeftIcon={Calendar}
              keyboardType="numeric"
            />

            {/* Gender Selection */}
            <View>
              {/* Gender label - Using HelloParis for UI labels */}
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "HelloParis",
                  fontWeight: "500",
                  color: "#FFFFFF",
                  marginBottom: 10,
                  letterSpacing: 0.3,
                }}
              >
                Gender
              </Text>

              <View style={{ gap: Platform.select({ ios: 12, android: 10 }) }}>
                {genderOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => setFormData({ ...formData, gender: option })}
                    style={{
                      backgroundColor:
                        formData.gender === option
                          ? "rgba(239, 62, 120, 0.15)"
                          : "rgba(255, 255, 255, 0.08)",
                      borderRadius: 16,
                      borderWidth: 2,
                      borderColor:
                        formData.gender === option
                          ? "#EF3E78"
                          : "rgba(141, 105, 246, 0.25)",
                      paddingHorizontal: 18,
                      paddingVertical: Platform.select({
                        ios: 18,
                        android: 16,
                      }),
                      flexDirection: "row",
                      alignItems: "center",
                      minHeight: Platform.select({ ios: 56, android: 52 }),
                    }}
                    activeOpacity={0.8}
                    accessible={true}
                    accessibilityRole="radio"
                    accessibilityState={{
                      selected: formData.gender === option,
                    }}
                    accessibilityLabel={`Select ${option} as gender`}
                  >
                    <Users
                      size={20}
                      color="rgba(239, 62, 120, 0.7)"
                      style={{ marginRight: 12 }}
                    />
                    {/* Option text - Using PlayfairDisplay for body text */}
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: "PlayfairDisplay",
                        fontWeight: "400",
                        color: "#FFFFFF",
                        flex: 1,
                      }}
                    >
                      {option}
                    </Text>
                    {formData.gender === option && (
                      <View
                        style={{
                          width: Platform.select({ ios: 20, android: 18 }),
                          height: Platform.select({ ios: 20, android: 18 }),
                          borderRadius: Platform.select({
                            ios: 10,
                            android: 9,
                          }),
                          backgroundColor: "#EF3E78",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <View
                          style={{
                            width: Platform.select({ ios: 8, android: 7 }),
                            height: Platform.select({ ios: 8, android: 7 }),
                            borderRadius: Platform.select({
                              ios: 4,
                              android: 3.5,
                            }),
                            backgroundColor: "#FFFFFF",
                          }}
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Continue Button - Using PrimaryButton */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingBottom: Platform.select({ ios: 40, android: 32 }),
          }}
        >
          <PrimaryButton
            title="Continue"
            onPress={handleNext}
            disabled={!isFormValid()}
            accessibilityLabel="Continue to next step"
            accessibilityHint="Proceeds to profile photos setup"
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
