import { MainTabIcon } from "@/src/components/navigation/MainTabIcon";
import { useTheme } from "@/src/theme";
import { Tabs } from "expo-router";
import { Heart, Home, MessageCircle, User } from "lucide-react-native";
import React from "react";
import { Platform, StyleSheet } from "react-native";

const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 88 : 68;
const TAB_PADDING_BOTTOM = Platform.OS === "ios" ? 28 : 12;
const TAB_PADDING_TOP = Platform.OS === "ios" ? 12 : 8;
const LABEL_FONT_SIZE = Platform.OS === "ios" ? 11 : 10;

export default function MainLayout() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarHideOnKeyboard: Platform.OS === "android",
        animation: "shift",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Discover",
          tabBarAccessibilityLabel: "Discover tab",
          tabBarIcon: ({ focused, color }) => (
            <MainTabIcon icon={Home} focused={focused} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="likes"
        options={{
          title: "Likes",
          tabBarAccessibilityLabel: "Likes tab",
          tabBarIcon: ({ focused, color }) => (
            <MainTabIcon
              icon={Heart}
              focused={focused}
              color={color}
              fillOnFocus
            />
          ),
        }}
      />

      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarAccessibilityLabel: "Messages tab",
          tabBarIcon: ({ focused, color }) => (
            <MainTabIcon icon={MessageCircle} focused={focused} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarAccessibilityLabel: "Profile tab",
          tabBarIcon: ({ focused, color }) => (
            <MainTabIcon icon={User} focused={focused} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          href: null,
          title: "Chat",
          tabBarStyle: { display: "none" },
        }}
      />

      <Tabs.Screen
        name="voice-call"
        options={{
          href: null,
          title: "Voice Call",
          tabBarStyle: { display: "none" },
        }}
      />

      <Tabs.Screen
        name="video-call"
        options={{
          href: null,
          title: "Video Call",
          tabBarStyle: { display: "none" },
        }}
      />

      <Tabs.Screen
        name="profile-settings"
        options={{
          href: null,
          title: "Settings",
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    tabBar: {
      backgroundColor: colors.tabBar,
      borderTopColor: colors.tabBarBorder,
      borderTopWidth: StyleSheet.hairlineWidth,
      height: TAB_BAR_HEIGHT,
      paddingBottom: TAB_PADDING_BOTTOM,
      paddingTop: TAB_PADDING_TOP,
      position: "relative",
      ...Platform.select({
        ios: {
          shadowColor: colors.brandScrim,
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
      fontFamily: "DMSans-SemiBold",
      fontSize: LABEL_FONT_SIZE,
      fontWeight: "600",
      letterSpacing: 0,
      marginTop: Platform.OS === "ios" ? 6 : 4,
      textTransform: "capitalize",
    },
    tabBarItem: {
      gap: Platform.OS === "ios" ? 4 : 2,
      paddingVertical: Platform.OS === "ios" ? 6 : 4,
    },
  });
