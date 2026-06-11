import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  ChevronRight,
  FileText,
  HelpCircle,
  Mail,
  MessageCircle,
} from "lucide-react-native";
import React from "react";
import {
  Alert,
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
const SUPPORT_EMAIL = "support@pinaymate.com";

export default function HelpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const openUrl = async (url: string, fallbackTitle: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        fallbackTitle,
        `If this does not open automatically, email ${SUPPORT_EMAIL}.`,
      );
    }
  };

  const openSupportEmail = (subject: string, body?: string) => {
    const params = new URLSearchParams({
      subject,
      ...(body ? { body } : {}),
    });

    void openUrl(
      `mailto:${SUPPORT_EMAIL}?${params.toString()}`,
      "Email support",
    );
  };

  const helpOptions = [
    {
      title: "FAQ and launch status",
      description:
        "Read what is live, what is planned, and what is still gated.",
      icon: <HelpCircle size={22} color={ACCENT_PURPLE} />,
      action: () => openUrl("https://pinaymate.com/#faq", "FAQ unavailable"),
      accessibilityHint: "Opens the PinayMate website FAQ in your browser",
    },
    {
      title: "Terms of Service",
      description: "Review the launch-stage terms and account expectations.",
      icon: <FileText size={22} color={ACCENT_PURPLE} />,
      action: () => router.push("/(auth)/terms" as any),
      accessibilityHint: "Opens the in-app Terms of Service screen",
    },
    {
      title: "Privacy Policy",
      description:
        "Review privacy, account deletion, and safety-review handling.",
      icon: <FileText size={22} color={ACCENT_PURPLE} />,
      action: () => router.push("/(auth)/privacy" as any),
      accessibilityHint: "Opens the in-app Privacy Policy screen",
    },
    {
      title: "Contact Support",
      description:
        "Email support for account, waitlist, verification, or deletion-review questions.",
      icon: <Mail size={22} color={ACCENT_PURPLE} />,
      action: () =>
        openSupportEmail(
          "PinayMate support request",
          "Hi PinayMate team,\n\nI need help with:\n\nAccount email:\nDevice:\n\nDetails:\n\nDo not send passwords, payment details, ID documents, or private message screenshots by email.\n",
        ),
      accessibilityHint: "Opens an email to PinayMate support",
    },
    {
      title: "Safety Concern",
      description:
        "Use email for launch-stage safety help. Live chat is not active yet.",
      icon: <MessageCircle size={22} color={ACCENT_PURPLE} />,
      action: () =>
        openSupportEmail(
          "PinayMate safety concern",
          "Hi PinayMate team,\n\nI need help with a safety concern.\n\nMy account email:\nOther member name or public profile details:\nWhat happened:\n\nDo not send passwords, payment details, ID documents, or private message screenshots by email. If this is an emergency, I understand I should contact local emergency services first.\n",
        ),
      accessibilityHint:
        "Opens an email for safety support. Live chat is not active in this launch build.",
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
          activeOpacity={0.78}
          accessibilityRole="button"
          accessibilityLabel="Back to profile"
          accessibilityHint="Returns to your profile screen"
        >
          <ArrowLeft size={24} color={WHITE} />
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentBody,
          { paddingBottom: Math.max(insets.bottom, 24) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>How can we help you?</Text>
        <Text style={styles.sectionSubtitle}>
          PinayMate support is email-first during launch. We do not show live
          chat unless staffing and escalation coverage are ready.
        </Text>

        <View style={styles.launchSupportCard}>
          <Text style={styles.launchSupportTitle}>Launch support boundary</Text>
          <Text style={styles.launchSupportText}>
            Support can help with account access, waitlist questions,
            verification review, deletion requests, and safety concerns. Email
            support is not emergency service, live chat, or instant moderation.
            Do not send passwords, payment details, ID documents, or private
            message screenshots by email.
          </Text>
        </View>

        {helpOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.listItem}
            onPress={option.action}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={option.title}
            accessibilityHint={option.accessibilityHint}
          >
            <View style={{ marginRight: 16 }}>{option.icon}</View>
            <View style={styles.listItemCopy}>
              <Text style={styles.listItemText}>{option.title}</Text>
              <Text style={styles.listItemDescription}>
                {option.description}
              </Text>
            </View>
            <ChevronRight size={20} color={ACCENT_PURPLE} />
          </TouchableOpacity>
        ))}

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactDesc}>
            Email support with questions or safety concerns. Response coverage
            depends on the launch support schedule. Do not send passwords,
            payment details, ID documents, or private message screenshots by
            email. Do not send passwords, payment details, ID documents, or
            private message screenshots by email.
          </Text>
          <TouchableOpacity
            style={styles.contactBtn}
            onPress={() => openSupportEmail("PinayMate support request")}
            accessibilityRole="button"
            accessibilityLabel="Email PinayMate support"
            accessibilityHint="Opens your email app with the support address"
          >
            <Mail size={18} color={WHITE} />
            <Text style={styles.contactBtnText}>Email Support</Text>
          </TouchableOpacity>
        </View>

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
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    fontSize: 20,
    color: WHITE,
    fontFamily: "DMSans-Bold",
    textAlign: "center",
  },
  headerSpacer: {
    width: 44,
    height: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentBody: {
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: ACCENT_PINK,
    fontFamily: "DMSans-Bold",
    marginTop: 20,
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    lineHeight: 21,
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
    minHeight: 78,
  },
  listItemCopy: {
    flex: 1,
  },
  listItemText: {
    color: WHITE,
    fontSize: 16,
    fontFamily: "DMSans-SemiBold",
    marginBottom: 3,
  },
  listItemDescription: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 13,
    fontFamily: "DMSans-Regular",
    lineHeight: 18,
  },
  contactCard: {
    backgroundColor: "rgba(141, 105, 246, 0.1)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ACCENT_PURPLE,
    padding: 20,
    marginTop: 24,
  },
  launchSupportCard: {
    backgroundColor: "rgba(239, 62, 120, 0.1)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(239, 62, 120, 0.28)",
    padding: 16,
    marginBottom: 16,
  },
  launchSupportTitle: {
    color: WHITE,
    fontSize: 15,
    fontFamily: "DMSans-Bold",
    marginBottom: 6,
  },
  launchSupportText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    fontFamily: "DMSans-Regular",
    lineHeight: 20,
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
    minHeight: 50,
    paddingHorizontal: 14,
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
