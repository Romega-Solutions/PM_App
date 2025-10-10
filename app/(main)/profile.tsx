import { useRouter } from "expo-router";
import {
  Bell,
  Edit,
  Heart,
  HelpCircle,
  Info,
  Lock,
  LogOut,
  Settings,
  SlidersHorizontal,
} from "lucide-react-native";
import React from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const isSmallDevice = width < 375;

export default function Profile() {
  const router = useRouter();

  const profileOptions = [
    { title: "Edit Profile", icon: <Edit size={22} color="#A855F7" /> },
    {
      title: "Preferences",
      icon: <SlidersHorizontal size={22} color="#A855F7" />,
    },
    { title: "Privacy", icon: <Lock size={22} color="#A855F7" /> },
    { title: "Notifications", icon: <Bell size={22} color="#A855F7" /> },
    { title: "Help & Support", icon: <HelpCircle size={22} color="#A855F7" /> },
    { title: "About", icon: <Info size={22} color="#A855F7" /> },
  ];

  const handleLogout = () => {
    // TODO: Add logout logic (clear session, etc.)
    router.replace("/(auth)/welcome");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#422057" }}>
      <StatusBar barStyle="light-content" backgroundColor="#422057" />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View
          style={{
            paddingTop: (StatusBar.currentHeight || 44) + 10,
            paddingHorizontal: 24,
            paddingBottom: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: isSmallDevice ? 28 : 32,
                fontWeight: "800",
                color: "#F4376D",
                letterSpacing: 1,
                textShadowColor: "rgba(168, 85, 247, 0.7)",
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
              }}
            >
              Profile
            </Text>
            <TouchableOpacity>
              <Settings size={28} color="#A855F7" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Image and Info */}
        <View style={{ alignItems: "center", marginBottom: 30 }}>
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              overflow: "hidden",
              borderWidth: 4,
              borderColor: "#F4376D",
              marginBottom: 20,
              backgroundColor: "#fff",
            }}
          >
            <Image
              source={require("../../assets/couple1.png")}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          </View>
          <Text
            style={{
              color: "#fff",
              fontSize: 24,
              fontWeight: "bold",
              marginBottom: 5,
              textShadowColor: "rgba(168, 85, 247, 0.7)",
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 4,
            }}
          >
            John Doe
          </Text>
          <Text
            style={{
              color: "#A855F7",
              fontSize: 16,
              fontWeight: "600",
              marginBottom: 2,
            }}
          >
            📍 New York, USA
          </Text>
          <View
            style={{
              marginTop: 10,
              backgroundColor: "rgba(244, 55, 109, 0.13)",
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 6,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Heart size={16} color="#F4376D" fill="#F4376D" />
            <Text style={{ color: "#F4376D", fontWeight: "700", fontSize: 14 }}>
              Verified
            </Text>
          </View>
        </View>

        {/* Profile Options */}
        <View style={{ paddingHorizontal: 24 }}>
          {profileOptions.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={{
                backgroundColor: "rgba(255,255,255,0.07)",
                borderRadius: 18,
                padding: 20,
                marginBottom: 15,
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 2,
                borderColor: "rgba(168, 85, 247, 0.13)",
              }}
            >
              <View style={{ marginRight: 18 }}>{item.icon}</View>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "600",
                  flex: 1,
                  letterSpacing: 0.2,
                }}
              >
                {item.title}
              </Text>
              <Text
                style={{ color: "#A855F7", fontSize: 18, fontWeight: "bold" }}
              >
                ›
              </Text>
            </TouchableOpacity>
          ))}

          {/* Logout Button */}
          <TouchableOpacity
            style={{
              backgroundColor: "rgba(244, 55, 109, 0.13)",
              borderColor: "#F4376D",
              borderWidth: 1.5,
              borderRadius: 18,
              padding: 20,
              marginTop: 20,
              marginBottom: 40,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
            onPress={handleLogout}
          >
            <LogOut size={20} color="#F4376D" />
            <Text
              style={{
                color: "#F4376D",
                fontSize: 16,
                fontWeight: "bold",
                textAlign: "center",
                marginLeft: 8,
              }}
            >
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
