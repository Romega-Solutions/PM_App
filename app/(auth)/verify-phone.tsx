import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  CheckCircle2,
  MailCheck,
  ShieldCheck,
  Smartphone,
} from "lucide-react-native";
import React from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BRAND_BG = "#0F0814";
const CARD = "rgba(255, 255, 255, 0.08)";
const BORDER = "rgba(239, 62, 120, 0.22)";
const PINK = "#EF3E78";
const WHITE = "#FFFFFF";
const TEXT_SECONDARY = "rgba(255, 255, 255, 0.74)";
const TEXT_MUTED = "rgba(255, 255, 255, 0.56)";

const launchChecks = [
  "Email verification is the active account check for this launch build.",
  "Profile review and safety reporting stay available after signup.",
  "No SMS is sent and no phone badge is created from this screen.",
  "SMS OTP will only appear after the backend and support process are ready.",
];

export default function VerifyPhone() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const explainPhoneStatus = () => {
    Alert.alert(
      "SMS is not part of this build",
      "PinayMate is using email verification and profile review for launch. Phone OTP will be added only after the SMS backend, abuse controls, and support process are verified.",
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[BRAND_BG, "#1A0F1F", "#2D1B35", BRAND_BG]}
        locations={[0, 0.28, 0.72, 1]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 28 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft size={21} color={WHITE} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.heroIconWrap} accessibilityElementsHidden>
          <Smartphone size={34} color={PINK} strokeWidth={2.3} />
        </View>

        <Text style={styles.eyebrow}>Launch verification path</Text>
        <Text style={styles.title}>Phone verification is off for launch</Text>
        <Text style={styles.subtitle}>
          Phone OTP is intentionally disabled in this build. That is safer than
          showing an SMS flow before the backend, support handling, and abuse
          controls are ready.
        </Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.smallIconWrap}>
              <MailCheck size={20} color={PINK} strokeWidth={2.4} />
            </View>
            <View style={styles.cardHeaderCopy}>
              <Text style={styles.cardTitle}>Current account check</Text>
              <Text style={styles.cardSubtitle}>
                Continue with the email link sent during signup.
              </Text>
            </View>
          </View>

          <View style={styles.checkList}>
            {launchChecks.map((check) => (
              <View key={check} style={styles.checkItem}>
                <CheckCircle2 size={18} color={PINK} strokeWidth={2.5} />
                <Text style={styles.checkText}>{check}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.safetyNote}>
          <ShieldCheck size={19} color={PINK} strokeWidth={2.4} />
          <Text style={styles.safetyText}>
            This screen does not send an SMS code, create a phone-verification
            badge, mark a profile as verified, or change launch access.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.replace("/(auth)/signin")}
          style={styles.primaryButton}
          accessibilityRole="button"
          accessibilityLabel="Return to email sign in"
          accessibilityHint="Opens sign in so you can continue through email verification"
          activeOpacity={0.86}
        >
          <Text style={styles.primaryButtonText}>Return to Email Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={explainPhoneStatus}
          style={styles.secondaryButton}
          accessibilityRole="button"
          accessibilityLabel="Learn why phone verification is unavailable"
          accessibilityHint="Explains why SMS phone verification is not active in this launch build"
          activeOpacity={0.82}
        >
          <Text style={styles.secondaryButtonText}>
            Why is SMS not available?
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND_BG,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 22,
  },
  backButton: {
    alignSelf: "flex-start",
    minHeight: 44,
    borderRadius: 18,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    marginBottom: 28,
  },
  backText: {
    color: WHITE,
    fontFamily: "DMSans-Bold",
    fontSize: 14,
  },
  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(239, 62, 120, 0.14)",
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  eyebrow: {
    color: PINK,
    fontFamily: "DMSans-Bold",
    fontSize: 13,
    letterSpacing: 0,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  title: {
    color: WHITE,
    fontFamily: "DMSans-Bold",
    fontSize: 34,
    lineHeight: 39,
    letterSpacing: 0,
    marginBottom: 14,
  },
  subtitle: {
    color: TEXT_SECONDARY,
    fontFamily: "DMSans-Regular",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 26,
  },
  card: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD,
    padding: 18,
    gap: 18,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  smallIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(239, 62, 120, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardHeaderCopy: {
    flex: 1,
  },
  cardTitle: {
    color: WHITE,
    fontFamily: "DMSans-Bold",
    fontSize: 17,
    marginBottom: 4,
  },
  cardSubtitle: {
    color: TEXT_SECONDARY,
    fontFamily: "DMSans-Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  checkList: {
    gap: 12,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  checkText: {
    flex: 1,
    color: TEXT_SECONDARY,
    fontFamily: "DMSans-Medium",
    fontSize: 14,
    lineHeight: 20,
  },
  safetyNote: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    backgroundColor: "rgba(15, 8, 20, 0.52)",
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 24,
  },
  safetyText: {
    flex: 1,
    color: TEXT_MUTED,
    fontFamily: "DMSans-Regular",
    fontSize: 13,
    lineHeight: 19,
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: PINK,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PINK,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
  },
  primaryButtonText: {
    color: WHITE,
    fontFamily: "DMSans-Bold",
    fontSize: 16,
  },
  secondaryButton: {
    minHeight: 50,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  secondaryButtonText: {
    color: PINK,
    fontFamily: "DMSans-Bold",
    fontSize: 15,
  },
});
