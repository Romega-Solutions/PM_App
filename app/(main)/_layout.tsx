// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Heart, Home, MessageCircle, User } from "lucide-react-native";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

// Brand Colors
const BRAND_BG = "#0F0814";
const TAB_BAR_BG = "#1A0F1F"; // Slightly lighter than brand bg
const ACCENT_PURPLE = "#8D69F6";
const ACCENT_PINK = "#EF3E78";
const INACTIVE_TINT = "rgba(255, 255, 255, 0.5)";

// Platform-specific constants
const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 88 : 68;
const TAB_PADDING_BOTTOM = Platform.OS === "ios" ? 28 : 12;
const TAB_PADDING_TOP = Platform.OS === "ios" ? 12 : 8;
const ICON_SIZE = Platform.OS === "ios" ? 24 : 22;
const LABEL_FONT_SIZE = Platform.OS === "ios" ? 11 : 10;
const FOCUSED_CONTAINER_WIDTH = Platform.OS === "ios" ? 56 : 52;
const FOCUSED_CONTAINER_HEIGHT = Platform.OS === "ios" ? 36 : 34;

interface TabIconProps {
  focused: boolean;
  color: string;
  children: React.ReactNode;
}

// Reusable Tab Icon Container Component
const TabIconContainer: React.FC<TabIconProps> = ({
  focused,
  color,
  children,
}) => (
  <View
    style={[
      styles.iconContainer,
      {
        backgroundColor: focused ? "rgba(239, 62, 120, 0.15)" : "transparent",
        borderWidth: focused ? 1.5 : 0,
        borderColor: focused ? ACCENT_PINK : "transparent",
      },
    ]}
  >
    {children}
    {focused && (
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: 16,
            backgroundColor: "rgba(141, 105, 246, 0.08)",
          },
        ]}
      />
    )}
  </View>
);

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: ACCENT_PINK,
        tabBarInactiveTintColor: INACTIVE_TINT,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarHideOnKeyboard: Platform.OS === "android",
        // Add smooth transition animation
        animation: "shift",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Discover",
          tabBarIcon: ({ focused, color }) => (
            <TabIconContainer focused={focused} color={color}>
              <Home
                size={ICON_SIZE}
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
            </TabIconContainer>
          ),
        }}
      />

      <Tabs.Screen
        name="likes"
        options={{
          title: "Likes",
          tabBarIcon: ({ focused, color }) => (
            <TabIconContainer focused={focused} color={color}>
              <Heart
                size={ICON_SIZE}
                color={color}
                strokeWidth={focused ? 2.5 : 2}
                fill={focused ? color : "transparent"}
              />
            </TabIconContainer>
          ),
        }}
      />

      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ focused, color }) => (
            <TabIconContainer focused={focused} color={color}>
              <MessageCircle
                size={ICON_SIZE}
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
              {/* Notification Badge - Uncomment when needed */}
              {/* 
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>3</Text>
              </View>
              */}
            </TabIconContainer>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, color }) => (
            <TabIconContainer focused={focused} color={color}>
              <User
                size={ICON_SIZE}
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
            </TabIconContainer>
          ),
        }}
      />

      {/* Chat Screen - Hidden from tabs, accessible only via navigation */}
      <Tabs.Screen
        name="chat"
        options={{
          href: null, // Hides from tab bar
          title: "Chat",
          tabBarStyle: { display: "none" }, // Hides the entire tab bar on this screen
        }}
      />

      {/* Voice Call Screen - Hidden from tabs, accessible from chat */}
      <Tabs.Screen
        name="voice-call"
        options={{
          href: null, // Hides from tab bar
          title: "Voice Call",
          tabBarStyle: { display: "none" }, // Hides the entire tab bar on this screen
        }}
      />

      {/* Video Call Screen - Hidden from tabs, accessible from chat */}
      <Tabs.Screen
        name="video-call"
        options={{
          href: null, // Hides from tab bar
          title: "Video Call",
          tabBarStyle: { display: "none" }, // Hides the entire tab bar on this screen
        }}
      />

      {/* Profile Settings - Hidden from tabs, accessible from profile screen */}
      <Tabs.Screen
        name="profile-settings"
        options={{
          href: null, // Hides from tab bar
          title: "Settings",
          tabBarStyle: { display: "none" }, // Hides the entire tab bar on this screen
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: TAB_BAR_BG,
    paddingBottom: TAB_PADDING_BOTTOM,
    paddingTop: TAB_PADDING_TOP,
    height: TAB_BAR_HEIGHT,
    position: "relative",
    // Gradient border effect
    borderTopColor: "rgba(141, 105, 246, 0.15)",
    borderTopWidth: StyleSheet.hairlineWidth,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  tabBarLabel: {
    fontSize: LABEL_FONT_SIZE,
    fontFamily: "DMSans-SemiBold",
    fontWeight: "600",
    marginTop: Platform.OS === "ios" ? 6 : 4,
    letterSpacing: 0.3,
    textTransform: "capitalize",
  },
  tabBarItem: {
    paddingVertical: Platform.OS === "ios" ? 6 : 4,
    gap: Platform.OS === "ios" ? 4 : 2,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    width: FOCUSED_CONTAINER_WIDTH,
    height: FOCUSED_CONTAINER_HEIGHT,
    ...Platform.select({
      ios: {
        shadowColor: ACCENT_PINK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0,
        shadowRadius: 8,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  // Notification Badge Styles (for future use)
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: Platform.OS === "ios" ? 4 : 2,
    backgroundColor: ACCENT_PINK,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: TAB_BAR_BG,
    ...Platform.select({
      ios: {
        shadowColor: ACCENT_PINK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.6,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  notificationText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    fontFamily: "DMSans-Bold",
    letterSpacing: 0.2,
  },
});
