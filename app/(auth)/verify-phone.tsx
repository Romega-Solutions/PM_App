// Create: app/(auth)/verify-phone.tsx
import { useRouter } from "expo-router";
import { Smartphone, RefreshCw } from "lucide-react-native";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";

export default function VerifyPhone() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      // Focus next input logic here
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length === 6) {
      // TODO: Verify with Supabase
      router.push("/(auth)/verification-success");
    } else {
      Alert.alert("Invalid OTP", "Please enter the complete 6-digit code");
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    // TODO: Resend OTP via Supabase
    setCountdown(60);
    setIsResending(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "rgba(66, 32, 87, 1)" }}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={{ paddingTop: 60, paddingHorizontal: 24, alignItems: "center" }}>
        <View style={{
          backgroundColor: "rgba(244, 55, 109, 0.2)",
          borderRadius: 25,
          padding: 16,
          marginBottom: 24,
          borderWidth: 2,
          borderColor: "rgba(168, 85, 247, 0.4)",
        }}>
          <Smartphone size={32} color="#F4376D" />
        </View>
        
        <Text style={{
          fontSize: 28,
          fontWeight: "700",
          color: "#FFFFFF",
          textAlign: "center",
          marginBottom: 12,
        }}>
          Verify Your Phone
        </Text>
        
        <Text style={{
          fontSize: 16,
          color: "rgba(255, 255, 255, 0.8)",
          textAlign: "center",
          lineHeight: 24,
        }}>
          We&apos;ve sent a 6-digit code to{"\n"}+63 *** *** **89
        </Text>
      </View>

      {/* OTP Input */}
      <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 24 }}>
        <View style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 40,
        }}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              style={{
                width: 50,
                height: 60,
                borderRadius: 12,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderWidth: 2,
                borderColor: digit ? "#F4376D" : "rgba(168, 85, 247, 0.3)",
                color: "#FFFFFF",
                fontSize: 24,
                fontWeight: "700",
                textAlign: "center",
              }}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              keyboardType="numeric"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={{
            backgroundColor: "#F4376D",
            borderRadius: 28,
            paddingVertical: 18,
            marginBottom: 20,
            shadowColor: "#A855F7",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
          }}
          onPress={handleVerifyOtp}
        >
          <Text style={{
            color: "#FFFFFF",
            fontSize: 18,
            fontWeight: "700",
            textAlign: "center",
          }}>
            Verify Code
          </Text>
        </TouchableOpacity>

        {/* Resend Section */}
        <View style={{ alignItems: "center" }}>
          {countdown > 0 ? (
            <Text style={{
              color: "rgba(255, 255, 255, 0.6)",
              fontSize: 16,
            }}>
              Resend code in {countdown}s
            </Text>
          ) : (
            <TouchableOpacity 
              onPress={handleResendOtp}
              disabled={isResending}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              {isResending && <RefreshCw size={16} color="#F4376D" />}
              <Text style={{
                color: "#F4376D",
                fontSize: 16,
                fontWeight: "600",
                marginLeft: isResending ? 8 : 0,
              }}>
                {isResending ? "Sending..." : "Resend Code"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}