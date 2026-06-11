import AuthLayout from "@/src/components/auth/AuthLayout";
import { theme } from "@/src/theme";
import { useRouter } from "expo-router";
import { AlertTriangle, Mail, ShieldCheck } from "lucide-react-native";
import React from "react";
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const termsSections = [
  {
    title: "Early-access product",
    body: "PinayMate is preparing launch-stage matching. Creating a profile does not guarantee live matches, account approval, or uninterrupted availability.",
  },
  {
    title: "Respectful behavior",
    body: "Members must use honest profile information, respectful messages, and clear intent. Harassment, impersonation, explicit pressure, scams, and money requests are not allowed.",
  },
  {
    title: "Safety actions",
    body: "Reports, blocks, and unmatches may be reviewed by support. We may restrict accounts that create safety, fraud, or platform-integrity risk.",
  },
  {
    title: "Account control",
    body: "You can update profile details, manage privacy settings, and request account deletion review from the app when the relevant account tools are available.",
  },
];

export default function TermsScreen() {
  const router = useRouter();

  const openSupportEmail = () => {
    Linking.openURL(
      "mailto:support@pinaymate.com?subject=PinayMate%20terms%20question",
    );
  };

  return (
    <AuthLayout showBackButton>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconBadge} accessible={false}>
            <ShieldCheck
              size={30}
              color={theme.colors.neutral.white}
              strokeWidth={2.4}
            />
          </View>
          <Text style={styles.eyebrow}>Terms overview</Text>
          <Text style={styles.title} accessibilityRole="header">
            Use PinayMate with clear intent and respect
          </Text>
          <Text style={styles.subtitle}>
            This launch-stage overview explains expected product behavior and
            member conduct. It is written plainly so people know what they are
            agreeing to before creating a profile.
          </Text>
        </View>

        <View style={styles.noticeCard}>
          <AlertTriangle
            size={22}
            color={theme.colors.warning[600]}
            strokeWidth={2.4}
          />
          <View style={styles.noticeContent}>
            <Text style={styles.noticeTitle}>Not a safety guarantee</Text>
            <Text style={styles.noticeText}>
              Verification, reporting, and profile review reduce risk, but they
              cannot guarantee another member's identity, behavior, or intent.
              Stay cautious and report anything suspicious.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          {termsSections.map((section) => (
            <View key={section.title} style={styles.card}>
              <View style={styles.bullet} accessible={false}>
                <Text style={styles.bulletText}>•</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{section.title}</Text>
                <Text style={styles.cardBody}>{section.body}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={openSupportEmail}
            style={({ pressed }) => [
              styles.primaryAction,
              pressed && styles.actionPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Email PinayMate support about terms"
            accessibilityHint="Opens your email app with a terms question subject"
          >
            <Mail
              size={20}
              color={theme.colors.neutral.white}
              strokeWidth={2.4}
            />
            <Text style={styles.primaryActionText}>Email support</Text>
          </Pressable>

          <TouchableOpacity
            onPress={() => router.push("/(auth)/privacy")}
            style={styles.secondaryAction}
            activeOpacity={0.82}
            accessibilityRole="button"
            accessibilityLabel="Read privacy overview"
            accessibilityHint="Opens the PinayMate privacy overview"
          >
            <Text style={styles.secondaryActionText}>Read privacy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    alignSelf: "center",
    width: "100%",
    maxWidth: 560,
  },
  header: {
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  iconBadge: {
    alignItems: "center",
    justifyContent: "center",
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(239, 62, 120, 0.32)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    marginBottom: theme.spacing.md,
  },
  eyebrow: {
    color: "rgba(255,255,255,0.72)",
    fontFamily: theme.fontFamilies.body.semiBold,
    fontSize: 13,
    textTransform: "uppercase",
    marginBottom: theme.spacing.sm,
  },
  title: {
    color: theme.colors.neutral.white,
    fontFamily: theme.fontFamilies.header.bold,
    fontSize: 31,
    lineHeight: 37,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
    maxWidth: 420,
  },
  subtitle: {
    color: "rgba(255,255,255,0.76)",
    fontFamily: theme.fontFamilies.body.regular,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    maxWidth: 460,
  },
  noticeCard: {
    flexDirection: "row",
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    marginBottom: theme.spacing.lg,
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    color: theme.colors.neutral.white,
    fontFamily: theme.fontFamilies.body.bold,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: theme.spacing.xs,
  },
  noticeText: {
    color: "rgba(255,255,255,0.74)",
    fontFamily: theme.fontFamilies.body.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  section: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  card: {
    flexDirection: "row",
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  bullet: {
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(239, 62, 120, 0.16)",
  },
  bulletText: {
    color: theme.colors.amihan[500],
    fontFamily: theme.fontFamilies.body.bold,
    fontSize: 22,
    lineHeight: 24,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    color: theme.colors.neutral.white,
    fontFamily: theme.fontFamilies.body.bold,
    fontSize: 16,
    lineHeight: 23,
    marginBottom: theme.spacing.xs,
  },
  cardBody: {
    color: "rgba(255,255,255,0.72)",
    fontFamily: theme.fontFamilies.body.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  actions: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  primaryAction: {
    minHeight: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.amihan[500],
    paddingHorizontal: theme.spacing.md,
  },
  secondaryAction: {
    minHeight: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: theme.spacing.md,
  },
  actionPressed: {
    opacity: 0.84,
  },
  primaryActionText: {
    color: theme.colors.neutral.white,
    fontFamily: theme.fontFamilies.body.bold,
    fontSize: 16,
  },
  secondaryActionText: {
    color: theme.colors.neutral.white,
    fontFamily: theme.fontFamilies.body.semiBold,
    fontSize: 15,
  },
});
