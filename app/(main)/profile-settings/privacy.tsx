import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, Eye, EyeOff, Lock, Shield, UserX } from "lucide-react-native";
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
const ACCENT_PINK = "#EF3E78";
const WHITE = "#FFFFFF";
const SURFACE_STRONG = "rgba(255, 255, 255, 0.08)";
const TILE_BORDER = "rgba(168, 85, 247, 0.13)";

export default function PrivacyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [showOnline, setShowOnline] = useState(true);
  const [showDistance, setShowDistance] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);

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
        <TouchableOpacity onPress={() => router.push("/(main)/profile")} style={styles.backBtn}>
          <ArrowLeft size={24} color={WHITE} />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Privacy Settings</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Eye size={22} color={ACCENT_PURPLE} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Show Online Status</Text>
              <Text style={styles.settingDesc}>Let others see when you're online</Text>
            </View>
          </View>
          <Switch
            value={showOnline}
            onValueChange={setShowOnline}
            trackColor={{ false: "#3e3e3e", true: ACCENT_PURPLE }}
            thumbColor={WHITE}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Shield size={22} color={ACCENT_PURPLE} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Show Distance</Text>
              <Text style={styles.settingDesc}>Display your distance to matches</Text>
            </View>
          </View>
          <Switch
            value={showDistance}
            onValueChange={setShowDistance}
            trackColor={{ false: "#3e3e3e", true: ACCENT_PURPLE }}
            thumbColor={WHITE}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <EyeOff size={22} color={ACCENT_PURPLE} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Read Receipts</Text>
              <Text style={styles.settingDesc}>Let others know when you read their messages</Text>
            </View>
          </View>
          <Switch
            value={readReceipts}
            onValueChange={setReadReceipts}
            trackColor={{ false: "#3e3e3e", true: ACCENT_PURPLE }}
            thumbColor={WHITE}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Lock size={22} color={ACCENT_PURPLE} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Profile Visible</Text>
              <Text style={styles.settingDesc}>Make your profile discoverable</Text>
            </View>
          </View>
          <Switch
            value={profileVisible}
            onValueChange={setProfileVisible}
            trackColor={{ false: "#3e3e3e", true: ACCENT_PURPLE }}
            thumbColor={WHITE}
          />
        </View>

        <Text style={styles.sectionTitle}>Data & Account</Text>

        <TouchableOpacity style={styles.actionItem}>
          <UserX size={22} color={ACCENT_PINK} />
          <Text style={styles.actionText}>Delete Account</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND_BG,
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
    color: WHITE,
    fontFamily: "DMSans-Bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: ACCENT_PINK,
    fontFamily: "DMSans-Bold",
    marginTop: 20,
    marginBottom: 20,
  },
  settingItem: {
    backgroundColor: SURFACE_STRONG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: TILE_BORDER,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    color: WHITE,
    fontSize: 16,
    fontFamily: "DMSans-SemiBold",
    marginBottom: 2,
  },
  settingDesc: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontFamily: "DMSans-Regular",
  },
  actionItem: {
    backgroundColor: "rgba(239, 62, 120, 0.12)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ACCENT_PINK,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  actionText: {
    color: ACCENT_PINK,
    fontSize: 16,
    fontFamily: "DMSans-SemiBold",
  },
});
