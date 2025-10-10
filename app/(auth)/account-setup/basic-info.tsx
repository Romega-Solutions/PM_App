import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ChevronRight, User, Calendar, Users } from "lucide-react-native";
import React, { useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
  const currentYear = new Date().getFullYear();
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
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
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
                    width: index === 0 ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: index === 0 ? "#EF3E78" : "rgba(255, 255, 255, 0.3)",
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
              Tell us about yourself
            </Text>

            <Text
              style={{
                fontSize: 16,
                fontFamily: "PlayfairDisplay-Regular",
                color: "rgba(255, 255, 255, 0.8)",
                textAlign: "center",
                lineHeight: 24,
              }}
            >
              Let's start with the basics
            </Text>
          </View>

          {/* Form Fields */}
          <View style={{ gap: 24 }}>
            {/* First Name */}
            <View>
              <Text style={{
                fontSize: 16,
                fontFamily: "PlayfairDisplay-SemiBold",
                color: "#FFFFFF",
                marginBottom: 8,
                textShadowColor: "rgba(0, 0, 0, 0.5)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}>
                First Name
              </Text>
              <View style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: 16,
                borderWidth: 1.5,
                borderColor: formData.firstName ? "#EF3E78" : "rgba(255, 255, 255, 0.3)",
                paddingHorizontal: 20,
                paddingVertical: 16,
                flexDirection: "row",
                alignItems: "center",
              }}>
                <User size={20} color="rgba(255, 255, 255, 0.7)" style={{ marginRight: 12 }} />
                <TextInput
                  value={formData.firstName}
                  onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                  placeholder="Enter your first name"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  style={{
                    flex: 1,
                    fontSize: 16,
                    fontFamily: "PlayfairDisplay-Regular",
                    color: "#FFFFFF",
                  }}
                  autoCapitalize="words"
                  maxLength={50}
                />
              </View>
            </View>

            {/* Last Name */}
            <View>
              <Text style={{
                fontSize: 16,
                fontFamily: "PlayfairDisplay-SemiBold",
                color: "#FFFFFF",
                marginBottom: 8,
                textShadowColor: "rgba(0, 0, 0, 0.5)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}>
                Last Name
              </Text>
              <View style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: 16,
                borderWidth: 1.5,
                borderColor: formData.lastName ? "#EF3E78" : "rgba(255, 255, 255, 0.3)",
                paddingHorizontal: 20,
                paddingVertical: 16,
                flexDirection: "row",
                alignItems: "center",
              }}>
                <User size={20} color="rgba(255, 255, 255, 0.7)" style={{ marginRight: 12 }} />
                <TextInput
                  value={formData.lastName}
                  onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                  placeholder="Enter your last name"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  style={{
                    flex: 1,
                    fontSize: 16,
                    fontFamily: "PlayfairDisplay-Regular",
                    color: "#FFFFFF",
                  }}
                  autoCapitalize="words"
                  maxLength={50}
                />
              </View>
            </View>

            {/* Age */}
            <View>
              <Text style={{
                fontSize: 16,
                fontFamily: "PlayfairDisplay-SemiBold",
                color: "#FFFFFF",
                marginBottom: 8,
                textShadowColor: "rgba(0, 0, 0, 0.5)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}>
                Age
              </Text>
              <View style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: 16,
                borderWidth: 1.5,
                borderColor: formData.age ? "#EF3E78" : "rgba(255, 255, 255, 0.3)",
                paddingHorizontal: 20,
                paddingVertical: 16,
                flexDirection: "row",
                alignItems: "center",
              }}>
                <Calendar size={20} color="rgba(255, 255, 255, 0.7)" style={{ marginRight: 12 }} />
                <TextInput
                  value={formData.age}
                  onChangeText={(text) => setFormData({ ...formData, age: text })}
                  placeholder={`${minAge} - ${maxAge} years old`}
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  style={{
                    flex: 1,
                    fontSize: 16,
                    fontFamily: "PlayfairDisplay-Regular",
                    color: "#FFFFFF",
                  }}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
            </View>

            {/* Gender */}
            <View>
              <Text style={{
                fontSize: 16,
                fontFamily: "PlayfairDisplay-SemiBold",
                color: "#FFFFFF",
                marginBottom: 12,
                textShadowColor: "rgba(0, 0, 0, 0.5)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}>
                Gender
              </Text>
              <View style={{ gap: 12 }}>
                {genderOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => setFormData({ ...formData, gender: option })}
                    style={{
                      backgroundColor: formData.gender === option 
                        ? "rgba(239, 62, 120, 0.2)" 
                        : "rgba(255, 255, 255, 0.1)",
                      borderRadius: 16,
                      borderWidth: 1.5,
                      borderColor: formData.gender === option 
                        ? "#EF3E78" 
                        : "rgba(255, 255, 255, 0.3)",
                      paddingHorizontal: 20,
                      paddingVertical: 16,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                    activeOpacity={0.8}
                  >
                    <Users size={20} color="rgba(255, 255, 255, 0.7)" style={{ marginRight: 12 }} />
                    <Text style={{
                      fontSize: 16,
                      fontFamily: "PlayfairDisplay-Regular",
                      color: "#FFFFFF",
                      flex: 1,
                    }}>
                      {option}
                    </Text>
                    {formData.gender === option && (
                      <View style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: "#EF3E78",
                        justifyContent: "center",
                        alignItems: "center",
                      }}>
                        <View style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: "#FFFFFF",
                        }} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
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
      </KeyboardAvoidingView>
    </View>
  );
}