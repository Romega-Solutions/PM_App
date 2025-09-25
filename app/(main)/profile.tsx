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
  return (
    <View style={{ flex: 1, backgroundColor: "#1a202c" }}>
      <StatusBar barStyle="light-content" backgroundColor="#1a202c" />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View
          style={{
            paddingTop: (StatusBar.currentHeight || 44) + 10,
            paddingHorizontal: 20,
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
                fontWeight: "bold",
                color: "#fff",
              }}
            >
              Profile
            </Text>
            <TouchableOpacity>
              <Text style={{ fontSize: 24, color: "#fff" }}>⚙️</Text>
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
            }}
          >
            John Doe
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: 16,
            }}
          >
            📍 New York, USA
          </Text>
        </View>

        {/* Profile Options */}
        <View style={{ paddingHorizontal: 20 }}>
          {[
            { title: "Edit Profile", icon: "✏️" },
            { title: "Preferences", icon: "🎯" },
            { title: "Privacy", icon: "🔒" },
            { title: "Notifications", icon: "🔔" },
            { title: "Help & Support", icon: "❓" },
            { title: "About", icon: "ℹ️" },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: 15,
                padding: 20,
                marginBottom: 15,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 20, marginRight: 15 }}>{item.icon}</Text>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "500",
                  flex: 1,
                }}
              >
                {item.title}
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 16 }}>
                ›
              </Text>
            </TouchableOpacity>
          ))}

          {/* Logout Button */}
          <TouchableOpacity
            style={{
              backgroundColor: "rgba(244, 55, 109, 0.1)",
              borderColor: "#F4376D",
              borderWidth: 1,
              borderRadius: 15,
              padding: 20,
              marginTop: 20,
              marginBottom: 40,
            }}
          >
            <Text
              style={{
                color: "#F4376D",
                fontSize: 16,
                fontWeight: "bold",
                textAlign: "center",
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
