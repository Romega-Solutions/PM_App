import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, Eye, EyeOff, MapPin, Shield } from "lucide-react-native";
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
        <TouchableOpacity
          onPress={() => router.push("/(main)/profile")}
          style={styles.backBtn}
        >
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
              <Text style={styles.settingDesc}>
                Let others see when you're online
              </Text>
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
            <MapPin size={22} color={ACCENT_PURPLE} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Show Distance</Text>
              <Text style={styles.settingDesc}>
                Display your distance to matches
              </Text>
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
            <Shield size={22} color={ACCENT_PURPLE} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Read Receipts</Text>
              <Text style={styles.settingDesc}>
                Show when you've read messages
              </Text>
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
            <EyeOff size={22} color={ACCENT_PURPLE} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Profile Visible</Text>
              <Text style={styles.settingDesc}>
                Make your profile visible to others
              </Text>
            </View>
          </View>
          <Switch
            value={profileVisible}
            onValueChange={setProfileVisible}
            trackColor={{ false: "#3e3e3e", true: ACCENT_PURPLE }}
            thumbColor={WHITE}
          />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Your privacy is important to us. These settings help you control
            what information others can see about you.
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
