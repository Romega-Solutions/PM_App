import AuthLayout from "@/src/components/auth/AuthLayout";
import { theme } from "@/src/theme";
import { useRouter } from "expo-router";
import {
  AlertTriangle,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react-native";
import React from "react";
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const privacyHighlights = [
  {
    title: "Profile visibility",
    body: "Your profile is used for matching and can be limited through privacy settings after sign in.",
    Icon: EyeOff,
  },
  {
    title: "Verification evidence",
    body: "Identity and verification uploads are treated as private review material, not public profile content.",
    Icon: LockKeyhole,
  },
  {
    title: "Safety reports",
    body: "Reports are sent for support review. The reported member is not told who made the report.",
    Icon: ShieldCheck,
  },
];

export default function PrivacyScreen() {
  const router = useRouter();

  const openSupportEmail = () => {
    Linking.openURL(
      "mailto:support@pinaymate.com?subject=PinayMate%20privacy%20question",
    );
  };

  return (
    <AuthLayout showBackButton>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconBadge} accessible={false}>
            <ShieldCheck
              size={30}
              color={theme.colors.neutral.white}
              strokeWidth={2.4}
            />
          </View>
          <Text style={styles.eyebrow}>Privacy and safety</Text>
          <Text style={styles.title} accessibilityRole="header">
            How PinayMate handles your information
          </Text>
          <Text style={styles.subtitle}>
            This is a plain-language overview for launch. It explains the
            product behavior users can expect, without replacing formal legal
            terms.
          </Text>
        </View>

        <View style={styles.alertCard}>
          <AlertTriangle
            size={22}
            color={theme.colors.warning[600]}
            strokeWidth={2.4}
          />
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>
              Keep sensitive details off chat
            </Text>
            <Text style={styles.alertText}>
              Do not share passwords, banking details, one-time codes, passport
              photos, or money requests. Use report and block tools if something
              feels unsafe.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          {privacyHighlights.map(({ title, body, Icon }) => (
            <View key={title} style={styles.card}>
              <View style={styles.cardIcon} accessible={false}>
                <Icon
                  size={22}
                  color={theme.colors.amihan[500]}
                  strokeWidth={2.3}
                />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardBody}>{body}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>What you can control</Text>
          <Text style={styles.detailsText}>
            After creating an account, you can update profile details, manage
            privacy settings, request account deletion review, and contact
            support about privacy or safety questions.
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={openSupportEmail}
            style={({ pressed }) => [
              styles.primaryAction,
              pressed && styles.actionPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Email PinayMate support"
            accessibilityHint="Opens your email app with a privacy question subject"
          >
            <Mail
              size={20}
              color={theme.colors.neutral.white}
              strokeWidth={2.4}
            />
            <Text style={styles.primaryActionText}>Email support</Text>
          </Pressable>

          <TouchableOpacity
            onPress={() => router.push("/(auth)/terms")}
            style={styles.secondaryAction}
            activeOpacity={0.82}
            accessibilityRole="button"
            accessibilityLabel="Read terms of service"
            accessibilityHint="Opens the PinayMate terms overview"
          >
            <Text style={styles.secondaryActionText}>Read terms</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
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
  alertCard: {
    flexDirection: "row",
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    marginBottom: theme.spacing.lg,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    color: theme.colors.neutral.white,
    fontFamily: theme.fontFamilies.body.bold,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: theme.spacing.xs,
  },
  alertText: {
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
  cardIcon: {
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(239, 62, 120, 0.16)",
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
  detailsCard: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: "rgba(141, 105, 246, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(141, 105, 246, 0.28)",
    marginBottom: theme.spacing.lg,
  },
  detailsTitle: {
    color: theme.colors.neutral.white,
    fontFamily: theme.fontFamilies.body.bold,
    fontSize: 16,
    lineHeight: 23,
    marginBottom: theme.spacing.xs,
  },
  detailsText: {
    color: "rgba(255,255,255,0.74)",
    fontFamily: theme.fontFamilies.body.regular,
    fontSize: 14,
    lineHeight: 22,
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
