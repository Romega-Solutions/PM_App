import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Book,
  ChevronRight,
  FileText,
  HelpCircle,
  Mail,
  MessageCircle,
} from "lucide-react-native";
import React from "react";
import {
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
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

export default function HelpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const helpOptions = [
    {
      title: "FAQ",
      icon: <HelpCircle size={22} color={ACCENT_PURPLE} />,
      action: () => console.log("Open FAQ"),
    },
    {
      title: "User Guide",
      icon: <Book size={22} color={ACCENT_PURPLE} />,
      action: () => console.log("Open User Guide"),
    },
    {
      title: "Terms of Service",
      icon: <FileText size={22} color={ACCENT_PURPLE} />,
      action: () => router.push("/(auth)/terms" as any),
    },
    {
      title: "Privacy Policy",
      icon: <FileText size={22} color={ACCENT_PURPLE} />,
      action: () => router.push("/(auth)/privacy" as any),
    },
    {
      title: "Contact Support",
      icon: <Mail size={22} color={ACCENT_PURPLE} />,
      action: () => Linking.openURL("mailto:support@pinaymate.com"),
    },
    {
      title: "Live Chat",
      icon: <MessageCircle size={22} color={ACCENT_PURPLE} />,
      action: () => console.log("Open Live Chat"),
    },
  ];

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
        <Text style={styles.title}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>How can we help you?</Text>

        {helpOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.listItem}
            onPress={option.action}
            activeOpacity={0.75}
          >
            <View style={{ marginRight: 16 }}>{option.icon}</View>
            <Text style={styles.listItemText}>{option.title}</Text>
            <ChevronRight size={20} color={ACCENT_PURPLE} />
          </TouchableOpacity>
        ))}

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactDesc}>
            Our support team is available 24/7 to assist you with any questions
            or concerns.
          </Text>
          <TouchableOpacity
            style={styles.contactBtn}
            onPress={() => Linking.openURL("mailto:support@pinaymate.com")}
          >
            <Mail size={18} color={WHITE} />
            <Text style={styles.contactBtnText}>Email Support</Text>
          </TouchableOpacity>
        </View>

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
  listItem: {
    backgroundColor: SURFACE_STRONG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: TILE_BORDER,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  listItemText: {
    color: WHITE,
    fontSize: 16,
    fontFamily: "DMSans-SemiBold",
    flex: 1,
  },
  contactCard: {
    backgroundColor: "rgba(141, 105, 246, 0.1)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ACCENT_PURPLE,
    padding: 20,
    marginTop: 24,
  },
  contactTitle: {
    color: WHITE,
    fontSize: 18,
    fontFamily: "DMSans-Bold",
    marginBottom: 8,
  },
  contactDesc: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    lineHeight: 20,
    marginBottom: 16,
  },
  contactBtn: {
    backgroundColor: ACCENT_PURPLE,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  contactBtnText: {
    color: WHITE,
    fontSize: 16,
    fontFamily: "DMSans-Bold",
  },
});
