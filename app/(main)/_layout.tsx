// app/(main)/_layout.tsx
import { useRequireAuth } from "@/src/hooks/useAuthPersistence";
import { Redirect, Tabs } from "expo-router";
import { Heart, Home, MessageCircle, User } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Brand Colors
const BRAND_BG = "#0F0814";
const TAB_BAR_BG = "#1A0F1F"; // Slightly lighter than brand bg
const ACCENT_PINK = "#EF3E78";
const INACTIVE_TINT = "rgba(255, 255, 255, 0.62)";
const TAB_BORDER = "rgba(255, 255, 255, 0.1)";
const ACTIVE_TAB_SURFACE = "rgba(239, 62, 120, 0.18)";

// Platform-specific constants
const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 86 : 72;
const TAB_PADDING_TOP = Platform.OS === "ios" ? 10 : 8;
const ICON_SIZE = 23;
const LABEL_FONT_SIZE = 11;
const FOCUSED_CONTAINER_WIDTH = 58;
const FOCUSED_CONTAINER_HEIGHT = 36;

interface TabIconProps {
  focused: boolean;
  children: React.ReactNode;
}

const TabIconContainer: React.FC<TabIconProps> = ({
  focused,
  children,
}) => (
  <View
    style={[
      styles.iconContainer,
      {
        backgroundColor: focused ? ACTIVE_TAB_SURFACE : "transparent",
        borderColor: focused ? "rgba(239, 62, 120, 0.64)" : "transparent",
      },
    ]}
  >
    {focused && (
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: 18,
            backgroundColor: "rgba(255, 255, 255, 0.05)",
          },
        ]}
      />
    )}
    {children}
  </View>
);

export default function MainLayout() {
  const { isAuthenticated, isDemoMode, isLoading } = useRequireAuth();
  const insets = useSafeAreaInsets();

  if (isLoading) {
    return (
      <View
        style={[styles.authGate, { backgroundColor: BRAND_BG }]}
        accessibilityLiveRegion="polite"
      >
        <View style={styles.authGateMark}>
          <Heart size={30} color={ACCENT_PINK} fill={ACCENT_PINK} />
        </View>
        <ActivityIndicator
          size="large"
          color={ACCENT_PINK}
          accessibilityLabel="Checking session"
        />
        <Text style={styles.authGateTitle}>
          {isDemoMode ? "Opening beta preview" : "Getting PinayMate ready"}
        </Text>
        <Text style={styles.authGateText}>
          {isDemoMode
            ? "Seeded demo data is used for preview surfaces. No real account writes happen here."
            : "Checking your secure session before opening the app."}
        </Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            height: TAB_BAR_HEIGHT + Math.max(insets.bottom, 10),
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ],
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
          tabBarAccessibilityLabel: "Discover tab. Browse suggested profiles.",
          tabBarIcon: ({ focused, color }) => (
            <TabIconContainer focused={focused}>
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
          title: "Liked You",
          tabBarAccessibilityLabel: "Liked You tab. See people who liked you.",
          tabBarIcon: ({ focused, color }) => (
            <TabIconContainer focused={focused}>
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
          tabBarAccessibilityLabel: "Messages tab. Open your conversations.",
          tabBarIcon: ({ focused, color }) => (
            <TabIconContainer focused={focused}>
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
          title: "You",
          tabBarAccessibilityLabel:
            "You tab. Open your profile and account settings.",
          tabBarIcon: ({ focused, color }) => (
            <TabIconContainer focused={focused}>
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
  authGate: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  authGateMark: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239, 62, 120, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(239, 62, 120, 0.34)",
    marginBottom: 22,
  },
  authGateTitle: {
    marginTop: 18,
    color: "#FFFFFF",
    fontFamily: "DMSans-Bold",
    fontSize: 18,
    textAlign: "center",
  },
  authGateText: {
    marginTop: 8,
    color: "rgba(255, 255, 255, 0.72)",
    fontFamily: "DMSans-Regular",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  tabBar: {
    backgroundColor: TAB_BAR_BG,
    paddingTop: TAB_PADDING_TOP,
    position: "relative",
    borderTopColor: TAB_BORDER,
    borderTopWidth: StyleSheet.hairlineWidth,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.34,
        shadowRadius: 18,
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
    marginTop: 5,
    letterSpacing: 0,
    textTransform: "capitalize",
  },
  tabBarItem: {
    minHeight: 56,
    paddingVertical: 4,
    gap: 3,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    borderWidth: 1,
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
