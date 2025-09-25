import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const isSmallDevice = width < 375;

type UserType = "filipina" | "foreigner" | null;

export default function SignUp() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>(null);
  const [formData, setFormData] = useState({
    // Common fields
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",

    // Filipina specific
    province: "",
    city: "",
    dialect: "",

    // Foreigner specific
    country: "",
    visaStatus: "",
    occupation: "",
  });

  const updateFormData = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  if (userType === null) {
    return (
      <View style={{ flex: 1, backgroundColor: "#1a202c" }}>
        <StatusBar barStyle="light-content" backgroundColor="#1a202c" />

        <View
          style={{
            paddingTop: (StatusBar.currentHeight || 44) + 20,
            flex: 1,
            paddingHorizontal: 24,
          }}
        >
          {/* Header */}
          <View style={{ marginBottom: 40 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginBottom: 20 }}
            >
              <Text style={{ color: "#fff", fontSize: 16 }}>← Back</Text>
            </TouchableOpacity>

            <Text
              style={{
                fontSize: isSmallDevice ? 28 : 32,
                fontWeight: "bold",
                color: "#fff",
                marginBottom: 8,
              }}
            >
              Join Pinaymate
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#fff",
                opacity: 0.8,
              }}
            >
              Choose your account type to get started
            </Text>
          </View>

          {/* User Type Selection */}
          <View style={{ flex: 1, justifyContent: "center" }}>
            <TouchableOpacity
              onPress={() => setUserType("filipina")}
              style={{
                backgroundColor: "#F4376D",
                borderRadius: 20,
                padding: 24,
                marginBottom: 20,
                shadowColor: "#F4376D",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "#fff",
                  textAlign: "center",
                  marginBottom: 8,
                }}
              >
                I'm a Filipina 🇵🇭
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#fff",
                  opacity: 0.9,
                  textAlign: "center",
                }}
              >
                Looking for love with foreign partners
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setUserType("foreigner")}
              style={{
                borderWidth: 2,
                borderColor: "#F4376D",
                borderRadius: 20,
                padding: 24,
                backgroundColor: "rgba(255,255,255,0.05)",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "#F4376D",
                  textAlign: "center",
                  marginBottom: 8,
                }}
              >
                I'm a Foreign Man 🌍
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#fff",
                  opacity: 0.8,
                  textAlign: "center",
                }}
              >
                Interested in meeting beautiful Filipinas
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={{ paddingBottom: 32 }}>
            <TouchableOpacity onPress={() => router.push("/signin")}>
              <Text
                style={{
                  color: "#F4376D",
                  textAlign: "center",
                  fontSize: 16,
                }}
              >
                Already have an account? Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#1a202c" }}>
      <StatusBar barStyle="light-content" backgroundColor="#1a202c" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: (StatusBar.currentHeight || 44) + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 30 }}>
          <TouchableOpacity
            onPress={() => setUserType(null)}
            style={{ marginBottom: 20 }}
          >
            <Text style={{ color: "#fff", fontSize: 16 }}>← Back</Text>
          </TouchableOpacity>

          <Text
            style={{
              fontSize: isSmallDevice ? 24 : 28,
              fontWeight: "bold",
              color: "#fff",
              marginBottom: 8,
            }}
          >
            {userType === "filipina"
              ? "Create Filipina Account"
              : "Create Foreign Account"}
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#fff",
              opacity: 0.8,
            }}
          >
            {userType === "filipina"
              ? "Tell us about yourself, beautiful!"
              : "Share your details to find your Filipina match"}
          </Text>
        </View>

        {/* Form Fields */}
        <View style={{ flex: 1 }}>
          {/* Common Fields */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: "#fff", marginBottom: 8, fontSize: 16 }}>
              First Name
            </Text>
            <TextInput
              value={formData.firstName}
              onChangeText={(text) => updateFormData("firstName", text)}
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: 12,
                padding: 16,
                color: "#fff",
                fontSize: 16,
              }}
              placeholder="Enter your first name"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: "#fff", marginBottom: 8, fontSize: 16 }}>
              Last Name
            </Text>
            <TextInput
              value={formData.lastName}
              onChangeText={(text) => updateFormData("lastName", text)}
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: 12,
                padding: 16,
                color: "#fff",
                fontSize: 16,
              }}
              placeholder="Enter your last name"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: "#fff", marginBottom: 8, fontSize: 16 }}>
              Email
            </Text>
            <TextInput
              value={formData.email}
              onChangeText={(text) => updateFormData("email", text)}
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: 12,
                padding: 16,
                color: "#fff",
                fontSize: 16,
              }}
              placeholder="Enter your email"
              placeholderTextColor="rgba(255,255,255,0.5)"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: "#fff", marginBottom: 8, fontSize: 16 }}>
              Date of Birth
            </Text>
            <TextInput
              value={formData.dateOfBirth}
              onChangeText={(text) => updateFormData("dateOfBirth", text)}
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: 12,
                padding: 16,
                color: "#fff",
                fontSize: 16,
              }}
              placeholder="MM/DD/YYYY"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          </View>

          {/* Filipina Specific Fields */}
          {userType === "filipina" && (
            <>
              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: "#fff", marginBottom: 8, fontSize: 16 }}>
                  Province
                </Text>
                <TextInput
                  value={formData.province}
                  onChangeText={(text) => updateFormData("province", text)}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    padding: 16,
                    color: "#fff",
                    fontSize: 16,
                  }}
                  placeholder="e.g., Metro Manila, Cebu, Davao"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                />
              </View>

              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: "#fff", marginBottom: 8, fontSize: 16 }}>
                  City
                </Text>
                <TextInput
                  value={formData.city}
                  onChangeText={(text) => updateFormData("city", text)}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    padding: 16,
                    color: "#fff",
                    fontSize: 16,
                  }}
                  placeholder="Your city"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                />
              </View>

              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: "#fff", marginBottom: 8, fontSize: 16 }}>
                  Dialect/Language
                </Text>
                <TextInput
                  value={formData.dialect}
                  onChangeText={(text) => updateFormData("dialect", text)}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    padding: 16,
                    color: "#fff",
                    fontSize: 16,
                  }}
                  placeholder="e.g., Tagalog, Cebuano, Ilocano"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                />
              </View>
            </>
          )}

          {/* Foreigner Specific Fields */}
          {userType === "foreigner" && (
            <>
              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: "#fff", marginBottom: 8, fontSize: 16 }}>
                  Country
                </Text>
                <TextInput
                  value={formData.country}
                  onChangeText={(text) => updateFormData("country", text)}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    padding: 16,
                    color: "#fff",
                    fontSize: 16,
                  }}
                  placeholder="Your country"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                />
              </View>

              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: "#fff", marginBottom: 8, fontSize: 16 }}>
                  Occupation
                </Text>
                <TextInput
                  value={formData.occupation}
                  onChangeText={(text) => updateFormData("occupation", text)}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    padding: 16,
                    color: "#fff",
                    fontSize: 16,
                  }}
                  placeholder="Your profession"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                />
              </View>

              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: "#fff", marginBottom: 8, fontSize: 16 }}>
                  Philippines Visa Status
                </Text>
                <TextInput
                  value={formData.visaStatus}
                  onChangeText={(text) => updateFormData("visaStatus", text)}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    padding: 16,
                    color: "#fff",
                    fontSize: 16,
                  }}
                  placeholder="e.g., Tourist, Working, Planning to visit"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                />
              </View>
            </>
          )}

          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: "#fff", marginBottom: 8, fontSize: 16 }}>
              Password
            </Text>
            <TextInput
              value={formData.password}
              onChangeText={(text) => updateFormData("password", text)}
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: 12,
                padding: 16,
                color: "#fff",
                fontSize: 16,
              }}
              placeholder="Create a strong password"
              placeholderTextColor="rgba(255,255,255,0.5)"
              secureTextEntry
            />
          </View>

          <View style={{ marginBottom: 30 }}>
            <Text style={{ color: "#fff", marginBottom: 8, fontSize: 16 }}>
              Confirm Password
            </Text>
            <TextInput
              value={formData.confirmPassword}
              onChangeText={(text) => updateFormData("confirmPassword", text)}
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: 12,
                padding: 16,
                color: "#fff",
                fontSize: 16,
              }}
              placeholder="Confirm your password"
              placeholderTextColor="rgba(255,255,255,0.5)"
              secureTextEntry
            />
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={{
              backgroundColor: "#F4376D",
              borderRadius: 15,
              paddingVertical: 18,
              shadowColor: "#F4376D",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
              marginBottom: 20,
            }}
            onPress={() => {
              // Handle sign up logic here
              console.log("Sign up with:", formData, "User type:", userType);
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Create Account
            </Text>
          </TouchableOpacity>

          {/* Sign In Link */}
          <TouchableOpacity
            onPress={() => router.push("/signin")}
            style={{ paddingBottom: 32 }}
          >
            <Text
              style={{
                color: "#F4376D",
                textAlign: "center",
                fontSize: 16,
              }}
            >
              Already have an account? Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
