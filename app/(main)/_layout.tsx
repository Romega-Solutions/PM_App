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
          backgroundColor: "#340839", // Deep purple matching brand gradient
          borderTopWidth: 0,
          paddingBottom: Platform.OS === "ios" ? 28 : 12,
          paddingTop: Platform.OS === "ios" ? 12 : 8,
          height: Platform.OS === "ios" ? 88 : 68,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 16,
          position: "relative",
        },
        tabBarActiveTintColor: "#EF3E78", // Brand pink
        tabBarInactiveTintColor: "rgba(255, 255, 255, 0.5)",
        tabBarLabelStyle: {
          fontSize: Platform.OS === "ios" ? 11 : 10,
          fontFamily: "HelloParis",
          fontWeight: "600",
          marginTop: Platform.OS === "ios" ? 6 : 4,
          letterSpacing: 0.2,
        },
        tabBarItemStyle: {
          paddingVertical: Platform.OS === "ios" ? 6 : 4,
          gap: Platform.OS === "ios" ? 4 : 2,
        },
        tabBarHideOnKeyboard: Platform.OS === "android",
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
                  ? "rgba(239, 62, 120, 0.2)"
                  : "transparent",
                borderRadius: 16,
                width: Platform.OS === "ios" ? 56 : 52,
                height: Platform.OS === "ios" ? 36 : 34,
                borderWidth: focused ? 2 : 0,
                borderColor: focused ? "#EF3E78" : "transparent",
                shadowColor: focused ? "#EF3E78" : "transparent",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: focused ? 0.4 : 0,
                shadowRadius: 8,
                elevation: focused ? 4 : 0,
              }}
            >
              <Home
                size={Platform.OS === "ios" ? 24 : 22}
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
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
                  ? "rgba(239, 62, 120, 0.2)"
                  : "transparent",
                borderRadius: 16,
                width: Platform.OS === "ios" ? 56 : 52,
                height: Platform.OS === "ios" ? 36 : 34,
                borderWidth: focused ? 2 : 0,
                borderColor: focused ? "#EF3E78" : "transparent",
                shadowColor: focused ? "#EF3E78" : "transparent",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: focused ? 0.4 : 0,
                shadowRadius: 8,
                elevation: focused ? 4 : 0,
              }}
            >
              <Heart
                size={Platform.OS === "ios" ? 24 : 22}
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
                  ? "rgba(239, 62, 120, 0.2)"
                  : "transparent",
                borderRadius: 16,
                width: Platform.OS === "ios" ? 56 : 52,
                height: Platform.OS === "ios" ? 36 : 34,
                borderWidth: focused ? 2 : 0,
                borderColor: focused ? "#EF3E78" : "transparent",
                shadowColor: focused ? "#EF3E78" : "transparent",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: focused ? 0.4 : 0,
                shadowRadius: 8,
                elevation: focused ? 4 : 0,
                position: "relative",
              }}
            >
              <MessageCircle
                size={Platform.OS === "ios" ? 24 : 22}
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
              {/* Notification badge - uncomment when needed */}
              {/* 
              <View
                style={{
                  position: "absolute",
                  top: -4,
                  right: Platform.OS === "ios" ? 4 : 2,
                  backgroundColor: "#EF3E78",
                  borderRadius: 10,
                  minWidth: 18,
                  height: 18,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: "#340839",
                  shadowColor: "#EF3E78",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.6,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                <Text 
                  style={{ 
                    color: "#FFFFFF", 
                    fontSize: 10, 
                    fontWeight: "700",
                    fontFamily: "HelloParis",
                  }}
                >
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
                  ? "rgba(239, 62, 120, 0.2)"
                  : "transparent",
                borderRadius: 16,
                width: Platform.OS === "ios" ? 56 : 52,
                height: Platform.OS === "ios" ? 36 : 34,
                borderWidth: focused ? 2 : 0,
                borderColor: focused ? "#EF3E78" : "transparent",
                shadowColor: focused ? "#EF3E78" : "transparent",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: focused ? 0.4 : 0,
                shadowRadius: 8,
                elevation: focused ? 4 : 0,
              }}
            >
              <User
                size={Platform.OS === "ios" ? 24 : 22}
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
