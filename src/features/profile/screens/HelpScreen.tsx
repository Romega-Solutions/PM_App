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
const WHITE = "#FFFFFF";
const SURFACE_STRONG = "rgba(255, 255, 255, 0.08)";
const TILE_BORDER = "rgba(168, 85, 247, 0.13)";

interface HelpOption {
  title: string;
  icon: React.ReactNode;
  action: () => void;
}

export default function HelpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const helpOptions: HelpOption[] = [
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
          >
            <View style={styles.listItemLeft}>
              {option.icon}
              <Text style={styles.listItemText}>{option.title}</Text>
            </View>
            <ChevronRight size={20} color="#999" />
          </TouchableOpacity>
        ))}

        <View style={styles.contactBox}>
          <Text style={styles.contactTitle}>Need More Help?</Text>
          <Text style={styles.contactDesc}>
            Our support team is available 24/7 to assist you with any questions
            or concerns.
          </Text>
          <TouchableOpacity
            style={styles.emailBtn}
            onPress={() => Linking.openURL("mailto:support@pinaymate.com")}
          >
            <Mail size={18} color={WHITE} />
            <Text style={styles.emailBtnText}>support@pinaymate.com</Text>
          </TouchableOpacity>
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
    fontSize: 18,
    fontWeight: "600",
    color: WHITE,
    marginTop: 20,
    marginBottom: 16,
  },
  listItem: {
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
  listItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  listItemText: {
    fontSize: 15,
    fontWeight: "500",
    color: WHITE,
  },
  contactBox: {
    backgroundColor: SURFACE_STRONG,
    borderWidth: 1,
    borderColor: TILE_BORDER,
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 40,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: WHITE,
    marginBottom: 8,
  },
  contactDesc: {
    fontSize: 14,
    color: "#ccc",
    lineHeight: 20,
    marginBottom: 16,
  },
  emailBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: ACCENT_PURPLE,
    borderRadius: 10,
    padding: 12,
  },
  emailBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: WHITE,
  },
});
