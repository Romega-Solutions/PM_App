import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { isSeedProfileId } from "@/src/features/matching/data/seedProfiles";
import { isSeedConversationId } from "@/src/features/messaging/data/seedConversations";
import { reportSafetyConcern } from "@/src/features/safety/workflows/reportSafetyConcern";
import {
  blockUser,
  type SubmitUserReportInput,
} from "@/src/features/safety/api/safetyApi";
import { useAuthStore } from "@/src/stores/authStore";

type ReportSource = NonNullable<SubmitUserReportInput["source"]>;

const REPORT_SOURCES = new Set<ReportSource>([
  "chat",
  "profile",
  "likes",
  "discovery",
  "app",
]);

const REASONS = [
  {
    label: "Fake profile or impersonation",
    helper: "Someone may be using false photos, names, or identity details.",
  },
  {
    label: "Harassment or abusive messages",
    helper: "Repeated unwanted contact, insults, threats, or pressure.",
  },
  {
    label: "Scam, money request, or suspicious behavior",
    helper:
      "Requests for money, codes, documents, investments, or off-app pressure.",
  },
  {
    label: "Inappropriate photos or content",
    helper: "Sexual, violent, hateful, or unwanted content.",
  },
  {
    label: "Other safety concern",
    helper: "Anything that made you feel unsafe or unsure.",
  },
];

function getSafeReportSource(source?: string): ReportSource {
  if (source && REPORT_SOURCES.has(source as ReportSource)) {
    return source as ReportSource;
  }

  return "app";
}

export default function ReportUserModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDemoMode = useAuthStore((state) => state.isDemoMode);
  const { userId, userName, conversationId, source, isDemo } = useLocalSearchParams<{
    userId?: string;
    userName?: string;
    conversationId?: string;
    source?: string;
    isDemo?: string;
  }>();
  const [reason, setReason] = useState(REASONS[0].label);
  const [details, setDetails] = useState("");
  const [shouldBlock, setShouldBlock] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [blockRetrying, setBlockRetrying] = useState(false);
  const [reportSentWithoutBlock, setReportSentWithoutBlock] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [demoReceipt, setDemoReceipt] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const reportedName = userName || "this member";
  const reportSource = getSafeReportSource(source);
  const isSeedReport =
    isDemoMode ||
    isDemo === "true" ||
    (userId ? isSeedProfileId(userId) : false) ||
    (conversationId ? isSeedConversationId(conversationId) : false);
  const toggleShouldBlock = () => {
    setShouldBlock((current) => !current);
  };

  const handleSubmit = async () => {
    setFormError(null);
    setReportSentWithoutBlock(false);
    setDemoReceipt(null);

    if (!userId) {
      setFormError(
        "This member could not be identified. Go back and try again.",
      );
      return;
    }

    setSubmitting(true);

    if (isSeedReport) {
      setSubmitting(false);
      setDemoReceipt({
        title: shouldBlock ? "Demo report and block recorded" : "Demo report recorded",
        message: shouldBlock
          ? "No real report or block was sent. This keeps the beta preview safe while preserving the live safety flow for real members."
          : "No real report was sent. This keeps the beta preview safe while preserving the live safety flow for real members.",
      });
      return;
    }

    const result = await reportSafetyConcern({
      reportedUserId: userId,
      reason,
      details,
      conversationId,
      source: reportSource,
      blockAfterReport: shouldBlock,
    });

    setSubmitting(false);

    if (!result.reportSent) {
      setFormError(
        result.error ||
          "The report was not sent. Check your connection and try again.",
      );
      return;
    }

    if (result.blockError) {
      setReportSentWithoutBlock(true);
      setFormError(
        "Report sent. Blocking did not finish. Check your connection, then retry blocking this member without sending a duplicate report.",
      );
      return;
    }

    Alert.alert(
      result.blocked ? "Report sent and member blocked" : "Report sent",
      result.blocked
        ? "Support can now review this report. This member should no longer be able to contact you."
        : "Thanks for helping keep PinayMate safe. Support can now review this report.",
      [{ text: "Close", onPress: () => router.back() }],
    );
  };

  const handleRetryBlock = async () => {
    setFormError(null);

    if (!userId) {
      setFormError(
        "This member could not be identified. Go back and try again.",
      );
      return;
    }

    if (isSeedReport) {
      setDemoReceipt({
        title: "Demo block recorded",
        message:
          "No real block was sent. This keeps the beta preview safe while preserving the live safety flow for real members.",
      });
      return;
    }

    setBlockRetrying(true);
    const result = await blockUser(userId);
    setBlockRetrying(false);

    if (!result.success) {
      setReportSentWithoutBlock(true);
      setFormError(
        result.error ||
          "Report sent. Blocking still did not finish. You can try again from chat or profile controls.",
      );
      return;
    }

    Alert.alert(
      "Member blocked",
      "Your report was already sent, and this member should no longer be able to contact you.",
      [{ text: "Close", onPress: () => router.back() }],
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.root}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        style={styles.scroll}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: Math.max(insets.top + 24, 40),
          paddingBottom: Math.max(insets.bottom + 24, 40),
          paddingHorizontal: 24,
        }}
      >
        <View style={styles.headerCard}>
          <View style={styles.eyebrowRow}>
            <View style={styles.statusDot} />
            <View style={styles.statusLine} />
            <Text style={styles.eyebrow}>
              Private safety report
            </Text>
          </View>
          <Text
            style={styles.title}
            accessibilityRole="header"
          >
            Report member
          </Text>
          <Text style={styles.description}>
            Tell support what happened with {reportedName}. Reports are private
            to moderation and help us act on unsafe behavior.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>
            What happens next
          </Text>
          <Text style={styles.infoText}>
            Support reviews the report, available conversation context may be
            checked, and the other member is not told who reported them. This is
            not an emergency channel and does not promise an instant moderation action.
          </Text>
          <Text style={styles.sectionTitle}>
            What support receives
          </Text>
          <Text style={styles.infoText}>
            We send your selected reason, optional details, where the report came
            from, and chat context only when available. This form does not ask for passwords, payment details, or ID documents.
          </Text>
          <Text style={styles.warningText}>
            If someone asks for money, codes, passwords, documents, or threatens
            you, stop replying. If you are in immediate danger, contact local
            emergency services.
          </Text>
        </View>

        <View
          style={styles.card}
          accessibilityRole="radiogroup"
          accessibilityLabel="Report reason"
        >
          <Text style={styles.cardTitle}>
            Reason
          </Text>
          {REASONS.map((item) => {
            const selected = item.label === reason;

            return (
              <TouchableOpacity
                key={item.label}
                onPress={() => setReason(item.label)}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={item.label}
                accessibilityHint="Selects this as the reason for the report"
                activeOpacity={0.82}
                style={[styles.reasonOption, selected && styles.reasonOptionSelected]}
              >
                <Text style={styles.reasonLabel}>
                  {item.label}
                </Text>
                <Text style={styles.reasonHelper}>
                  {item.helper}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.card}>
          <View style={styles.detailsHeader}>
            <Text style={styles.cardTitle}>Details</Text>
            <Text style={styles.counterText}>{details.length}/800</Text>
          </View>
          <Text style={styles.infoText}>
            Optional, but helpful. Include what happened, when it happened, and
            any message context support should review. Do not include passwords,
            payment details, or ID numbers.
          </Text>
          <TextInput
            value={details}
            onChangeText={(value) => setDetails(value.slice(0, 800))}
            multiline
            textAlignVertical="top"
            placeholder="Example: They asked me to send money after a few messages."
            placeholderTextColor="rgba(255,255,255,0.38)"
            style={styles.textInput}
            accessibilityLabel="Report details"
            accessibilityHint="Optional. Add details that help support review the safety concern."
          />
        </View>

        <TouchableOpacity
          onPress={toggleShouldBlock}
          activeOpacity={0.86}
          style={styles.blockCard}
          accessibilityRole="switch"
          accessibilityLabel="Block this member too"
          accessibilityHint="Recommended. When enabled, the app reports and blocks this member"
          accessibilityState={{ checked: shouldBlock }}
        >
          <View style={styles.blockRow}>
            <View style={styles.blockTextWrap}>
              <Text style={styles.blockTitle}>
                Block this member too
              </Text>
              <Text style={styles.infoText}>
                Recommended for safety reports. Blocking helps prevent future
                discovery, chat, and media access between you.
              </Text>
            </View>
            <Switch
              value={shouldBlock}
              pointerEvents="none"
              trackColor={{ false: "#3B3145", true: "#8D69F6" }}
              thumbColor={shouldBlock ? "#FFFFFF" : "#C8B5E6"}
              importantForAccessibility="no"
            />
          </View>
          {!shouldBlock && (
            <View style={styles.reportOnlyNote}>
              <Text style={styles.infoText}>
                Report-only mode sends the report, but this member may still be
                able to contact you until you block them or moderation acts.
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {formError && (
          <View
            style={styles.errorCard}
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
          >
            <Text style={styles.errorText}>
              {formError}
            </Text>
            {reportSentWithoutBlock && (
              <TouchableOpacity
                onPress={handleRetryBlock}
                disabled={blockRetrying}
                activeOpacity={0.84}
                style={styles.retryButton}
                accessibilityRole="button"
                accessibilityLabel={
                  blockRetrying
                    ? "Retrying block"
                    : "Retry blocking this member"
                }
                accessibilityHint="Attempts to block this member again without sending a duplicate report"
                accessibilityState={{
                  disabled: blockRetrying,
                  busy: blockRetrying,
                }}
              >
                {blockRetrying ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.retryButtonText}>Retry block</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {demoReceipt && (
          <View
            style={styles.successCard}
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
          >
            <Text style={styles.successTitle}>{demoReceipt.title}</Text>
            <Text style={styles.successText}>{demoReceipt.message}</Text>
          </View>
        )}

        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            disabled={submitting || blockRetrying || !!demoReceipt}
            activeOpacity={0.82}
            style={[
              styles.secondaryButton,
              (submitting || blockRetrying || !!demoReceipt) && styles.disabledButton,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Cancel report"
            accessibilityHint="Closes the report form without sending"
            accessibilityState={{ disabled: submitting || blockRetrying || !!demoReceipt }}
          >
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={
              demoReceipt || reportSentWithoutBlock
                ? () => router.back()
                : handleSubmit
            }
            disabled={submitting || blockRetrying}
            activeOpacity={0.86}
            style={[styles.primaryButton, (submitting || blockRetrying) && styles.disabledButton]}
            accessibilityRole="button"
            accessibilityLabel={
              demoReceipt || reportSentWithoutBlock
                ? "Close report form"
                : submitting
                  ? "Sending report"
                  : blockRetrying
                    ? "Blocking member"
                  : "Send private report"
            }
            accessibilityHint={
              demoReceipt || reportSentWithoutBlock
                ? "Closes the report form without sending a duplicate report"
                : "Sends this private safety report to moderation"
            }
            accessibilityState={{
              disabled: submitting || blockRetrying,
              busy: submitting || blockRetrying,
            }}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {demoReceipt || reportSentWithoutBlock ? "Close" : "Send private report"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>
          Reports help moderation review patterns. They do not guarantee that an
          account will be removed, do not replace local emergency services, and
          should not include passwords, payment details, or ID numbers.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#08040D",
  },
  scroll: {
    flex: 1,
  },
  headerCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(239,62,120,0.28)",
    backgroundColor: "rgba(31,18,43,0.96)",
    padding: 20,
    marginBottom: 14,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#EF3E78",
  },
  statusLine: {
    width: 28,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.28)",
  },
  eyebrow: {
    color: "rgba(255,255,255,0.7)",
    fontFamily: "DMSans-Bold",
    fontSize: 12,
    textTransform: "uppercase",
  },
  title: {
    color: "#FFFFFF",
    fontFamily: "DMSans-Bold",
    fontSize: 28,
    marginBottom: 8,
  },
  description: {
    color: "rgba(255,255,255,0.82)",
    fontFamily: "DMSans-Regular",
    fontSize: 15,
    lineHeight: 22,
  },
  infoCard: {
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(141,105,246,0.24)",
    padding: 18,
    marginBottom: 14,
  },
  card: {
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontFamily: "DMSans-Bold",
    fontSize: 15,
    marginBottom: 6,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontFamily: "DMSans-Bold",
    fontSize: 16,
    marginBottom: 10,
  },
  infoText: {
    color: "rgba(255,255,255,0.72)",
    fontFamily: "DMSans-Regular",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  warningText: {
    color: "#FFD7A8",
    fontFamily: "DMSans-Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  reasonOption: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 12,
    marginBottom: 10,
  },
  reasonOptionSelected: {
    borderColor: "#EF3E78",
    backgroundColor: "rgba(239,62,120,0.14)",
  },
  reasonLabel: {
    color: "#FFFFFF",
    fontFamily: "DMSans-Bold",
    fontSize: 14,
    marginBottom: 4,
  },
  reasonHelper: {
    color: "rgba(255,255,255,0.7)",
    fontFamily: "DMSans-Regular",
    fontSize: 13,
    lineHeight: 18,
  },
  detailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  counterText: {
    color: "rgba(255,255,255,0.56)",
    fontFamily: "DMSans-Regular",
    fontSize: 12,
  },
  textInput: {
    minHeight: 110,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(0,0,0,0.24)",
    color: "#FFFFFF",
    fontFamily: "DMSans-Regular",
    fontSize: 15,
    lineHeight: 22,
    padding: 14,
  },
  blockCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(141,105,246,0.24)",
    backgroundColor: "rgba(141,105,246,0.1)",
    padding: 16,
    marginBottom: 14,
  },
  blockRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  blockTextWrap: {
    flex: 1,
  },
  blockTitle: {
    color: "#FFFFFF",
    fontFamily: "DMSans-Bold",
    fontSize: 15,
    marginBottom: 4,
  },
  reportOnlyNote: {
    marginTop: 12,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: 10,
  },
  errorCard: {
    borderRadius: 8,
    backgroundColor: "rgba(255,75,110,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,75,110,0.35)",
    padding: 14,
    marginBottom: 14,
  },
  errorText: {
    color: "#FFD7DF",
    fontFamily: "DMSans-Bold",
    fontSize: 14,
    lineHeight: 20,
  },
  successCard: {
    borderRadius: 8,
    backgroundColor: "rgba(16,185,129,0.12)",
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.38)",
    padding: 14,
    marginBottom: 14,
  },
  successTitle: {
    color: "#D7FFE9",
    fontFamily: "DMSans-Bold",
    fontSize: 15,
    marginBottom: 4,
  },
  successText: {
    color: "rgba(255,255,255,0.78)",
    fontFamily: "DMSans-Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  retryButton: {
    alignSelf: "flex-start",
    borderRadius: 8,
    backgroundColor: "#EF3E78",
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 10,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontFamily: "DMSans-Bold",
    fontSize: 13,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    flex: 1.4,
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: "#EF3E78",
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.52,
  },
  secondaryButtonText: {
    color: "rgba(255,255,255,0.82)",
    fontFamily: "DMSans-Bold",
    fontSize: 14,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontFamily: "DMSans-Bold",
    fontSize: 14,
  },
  footerText: {
    color: "rgba(255,255,255,0.52)",
    fontFamily: "DMSans-Regular",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
});
