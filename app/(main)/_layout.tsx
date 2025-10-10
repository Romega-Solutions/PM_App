import { Tabs } from "expo-router";
import { Heart, Home, MessageCircle, User } from "lucide-react-native";
import React from "react";
import { Platform, View } from "react-native";

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#422057", // Deep purple like welcome.tsx
          borderTopWidth: 1.5,
          borderTopColor: "rgba(168, 85, 247, 0.18)", // Soft purple border
          paddingBottom: Platform.OS === "ios" ? 22 : 14,
          paddingTop: 12,
          height: Platform.OS === "ios" ? 92 : 76,
          shadowColor: "#A855F7",
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.18,
          shadowRadius: 12,
          elevation: 10,
        },
        tabBarActiveTintColor: "#F4376D", // Pink
        tabBarInactiveTintColor: "rgba(255, 255, 255, 0.7)",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
          marginTop: 4,
          letterSpacing: 0.3,
          color: "#FFFFFF",
          textShadowColor: "rgba(168, 85, 247, 0.7)",
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Discover",
          tabBarIcon: ({ focused, color }) => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: focused
                  ? "rgba(244, 55, 109, 0.13)"
                  : "rgba(168, 85, 247, 0.08)",
                borderRadius: 14,
                width: 50,
                height: 34,
                marginTop: 2,
                borderWidth: focused ? 2 : 0,
                borderColor: focused ? "#F4376D" : "transparent",
                shadowColor: focused ? "#F4376D" : "#A855F7",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: focused ? 0.18 : 0.1,
                shadowRadius: 4,
                elevation: focused ? 6 : 2,
              }}
            >
              <Home size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="likes"
        options={{
          title: "Likes",
          tabBarIcon: ({ focused, color }) => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: focused
                  ? "rgba(244, 55, 109, 0.13)"
                  : "rgba(168, 85, 247, 0.08)",
                borderRadius: 14,
                width: 50,
                height: 34,
                marginTop: 2,
                borderWidth: focused ? 2 : 0,
                borderColor: focused ? "#F4376D" : "transparent",
                shadowColor: focused ? "#F4376D" : "#A855F7",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: focused ? 0.18 : 0.1,
                shadowRadius: 4,
                elevation: focused ? 6 : 2,
              }}
            >
              <Heart
                size={24}
                color={color}
                strokeWidth={focused ? 2.5 : 2}
                fill={focused ? color : "transparent"}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ focused, color }) => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: focused
                  ? "rgba(244, 55, 109, 0.13)"
                  : "rgba(168, 85, 247, 0.08)",
                borderRadius: 14,
                width: 50,
                height: 34,
                marginTop: 2,
                borderWidth: focused ? 2 : 0,
                borderColor: focused ? "#F4376D" : "transparent",
                shadowColor: focused ? "#F4376D" : "#A855F7",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: focused ? 0.18 : 0.1,
                shadowRadius: 4,
                elevation: focused ? 6 : 2,
                position: "relative",
              }}
            >
              <MessageCircle
                size={24}
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
              {/* Notification badge example */}
              {/* 
              <View
                style={{
                  position: "absolute",
                  top: -2,
                  right: 8,
                  backgroundColor: "#F4376D",
                  borderRadius: 8,
                  minWidth: 16,
                  height: 16,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: "#422057",
                }}
              >
                <Text style={{ color: "white", fontSize: 10, fontWeight: "bold" }}>
                  3
                </Text>
              </View>
              */}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, color }) => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: focused
                  ? "rgba(244, 55, 109, 0.13)"
                  : "rgba(168, 85, 247, 0.08)",
                borderRadius: 14,
                width: 50,
                height: 34,
                marginTop: 2,
                borderWidth: focused ? 2 : 0,
                borderColor: focused ? "#F4376D" : "transparent",
                shadowColor: focused ? "#F4376D" : "#A855F7",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: focused ? 0.18 : 0.1,
                shadowRadius: 4,
                elevation: focused ? 6 : 2,
              }}
            >
              <User size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
