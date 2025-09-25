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

export default function SignIn() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
              Welcome Back
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#fff",
                opacity: 0.8,
              }}
            >
              Sign in to your Pinaymate account
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
                Sign in to your account
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
                Sign in to your account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={{ paddingBottom: 32 }}>
            <TouchableOpacity onPress={() => router.push("/signup")}>
              <Text
                style={{
                  color: "#F4376D",
                  textAlign: "center",
                  fontSize: 16,
                }}
              >
                Don't have an account? Sign Up
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
        <View style={{ marginBottom: 40 }}>
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
              ? "Welcome Back, Beautiful!"
              : "Welcome Back!"}
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#fff",
              opacity: 0.8,
            }}
          >
            {userType === "filipina"
              ? "Sign in to find your foreign prince"
              : "Sign in to connect with amazing Filipinas"}
          </Text>
        </View>

        {/* Form Fields */}
        <View style={{ flex: 1, justifyContent: "center" }}>
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

          <View style={{ marginBottom: 30 }}>
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
              placeholder="Enter your password"
              placeholderTextColor="rgba(255,255,255,0.5)"
              secureTextEntry
            />
          </View>

          {/* Forgot Password */}
          <TouchableOpacity style={{ alignSelf: "flex-end", marginBottom: 30 }}>
            <Text style={{ color: "#F4376D", fontSize: 14 }}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          {/* Sign In Button */}
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
              // Navigate to main app
              router.push("/(main)");
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
              Sign In
            </Text>
          </TouchableOpacity>

          {/* Social Login Options */}
          <View style={{ marginBottom: 30 }}>
            <Text
              style={{
                color: "#fff",
                opacity: 0.6,
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              Or continue with
            </Text>

            <TouchableOpacity
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: 15,
                paddingVertical: 16,
                marginBottom: 15,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                📱 Continue with Phone
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: 15,
                paddingVertical: 16,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                🌐 Continue with Google
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <TouchableOpacity
            onPress={() => router.push("/signup")}
            style={{ paddingBottom: 32 }}
          >
            <Text
              style={{
                color: "#F4376D",
                textAlign: "center",
                fontSize: 16,
              }}
            >
              Don't have an account? Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
