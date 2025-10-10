// Create: app/(auth)/forgot-password.tsx
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function ForgotPassword() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-900 justify-center items-center px-6">
      <Text className="text-white text-2xl font-bold mb-4">Reset Password</Text>
      <Text className="text-gray-400 text-center mb-6">
        Password reset functionality coming soon.
      </Text>
      <TouchableOpacity
        onPress={() => router.push("/(auth)/signin")}
        className="bg-pink-500 px-6 py-3 rounded-lg"
      >
        <Text className="text-white font-medium">Back to Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}
