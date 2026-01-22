import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    ArrowLeft,
    Bell,
    Heart,
    Mail,
    MessageCircle,
    Users,
} from "lucide-react-native";
import React, { useState } from "react";
import {
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BRAND_BG = "#0F0814";
const ACCENT_PURPLE = "#8D69F6";
const WHITE = "#FFFFFF";
const SURFACE_STRONG = "rgba(255, 255, 255, 0.08)";
const TILE_BORDER = "rgba(168, 85, 247, 0.13)";

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [newMatches, setNewMatches] = useState(true);
  const [newMessages, setNewMessages] = useState(true);
  const [newLikes, setNewLikes] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_BG} />
      {Platform.OS === "ios" && (
        <View style={{ height: insets.top, backgroundColor: BRAND_BG }} />
      )}

      <LinearGradient
        colors={[BRAND_BG, "#1A0F1F", "#2D1B35", BRAND_BG]}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/(main)/profile")}
          style={styles.backBtn}
        >
          <ArrowLeft size={24} color={WHITE} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Push Notifications</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Bell size={22} color={ACCENT_PURPLE} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Enable Push Notifications</Text>
              <Text style={styles.settingDesc}>
                Receive notifications on your device
              </Text>
            </View>
          </View>
          <Switch
            value={pushEnabled}
            onValueChange={setPushEnabled}
            trackColor={{ false: "#3e3e3e", true: ACCENT_PURPLE }}
            thumbColor={WHITE}
          />
        </View>

        <Text style={styles.sectionTitle}>Notification Types</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Users size={22} color={ACCENT_PURPLE} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>New Matches</Text>
              <Text style={styles.settingDesc}>When you get a new match</Text>
            </View>
          </View>
          <Switch
            value={newMatches}
            onValueChange={setNewMatches}
            trackColor={{ false: "#3e3e3e", true: ACCENT_PURPLE }}
            thumbColor={WHITE}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MessageCircle size={22} color={ACCENT_PURPLE} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>New Messages</Text>
              <Text style={styles.settingDesc}>
                When someone sends you a message
              </Text>
            </View>
          </View>
          <Switch
            value={newMessages}
            onValueChange={setNewMessages}
            trackColor={{ false: "#3e3e3e", true: ACCENT_PURPLE }}
            thumbColor={WHITE}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Heart size={22} color={ACCENT_PURPLE} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>New Likes</Text>
              <Text style={styles.settingDesc}>
                When someone likes your profile
              </Text>
            </View>
          </View>
          <Switch
            value={newLikes}
            onValueChange={setNewLikes}
            trackColor={{ false: "#3e3e3e", true: ACCENT_PURPLE }}
            thumbColor={WHITE}
          />
        </View>

        <Text style={styles.sectionTitle}>Email Notifications</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Mail size={22} color={ACCENT_PURPLE} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Email Updates</Text>
              <Text style={styles.settingDesc}>Receive updates via email</Text>
            </View>
          </View>
          <Switch
            value={emailNotifications}
            onValueChange={setEmailNotifications}
            trackColor={{ false: "#3e3e3e", true: ACCENT_PURPLE }}
            thumbColor={WHITE}
          />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            You can customize which notifications you receive to stay updated on
            what matters most to you.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: WHITE,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: WHITE,
    marginTop: 20,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: SURFACE_STRONG,
    borderWidth: 1,
    borderColor: TILE_BORDER,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: WHITE,
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 13,
    color: "#999",
  },
  infoBox: {
    backgroundColor: SURFACE_STRONG,
    borderWidth: 1,
    borderColor: TILE_BORDER,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 40,
  },
  infoText: {
    fontSize: 14,
    color: "#ccc",
    lineHeight: 20,
  },
});
