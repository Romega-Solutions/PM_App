import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { reportSafetyConcern } from "@/src/features/safety/workflows/reportSafetyConcern";
import {
  blockUser,
  type SubmitUserReportInput,
} from "@/src/features/safety/api/safetyApi";

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
  const { userId, userName, conversationId, source } = useLocalSearchParams<{
    userId?: string;
    userName?: string;
    conversationId?: string;
    source?: string;
  }>();
  const [reason, setReason] = useState(REASONS[0].label);
  const [details, setDetails] = useState("");
  const [shouldBlock, setShouldBlock] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [blockRetrying, setBlockRetrying] = useState(false);
  const [reportSentWithoutBlock, setReportSentWithoutBlock] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const reportedName = userName || "this member";
  const reportSource = getSafeReportSource(source);
  const toggleShouldBlock = () => {
    setShouldBlock((current) => !current);
  };

  const handleSubmit = async () => {
    setFormError(null);
    setReportSentWithoutBlock(false);

    if (!userId) {
      setFormError(
        "This member could not be identified. Go back and try again.",
      );
      return;
    }

    setSubmitting(true);

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
      className="flex-1 bg-[#0F0814]"
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: Math.max(insets.top + 24, 40),
          paddingBottom: Math.max(insets.bottom + 24, 40),
          paddingHorizontal: 24,
        }}
      >
        <View className="mb-8">
          <Text
            className="text-white text-3xl font-bold"
            accessibilityRole="header"
          >
            Report member
          </Text>
          <Text className="text-white/75 mt-3 text-base leading-6">
            Tell support what happened with {reportedName}. Reports are private
            to moderation and help us act on unsafe behavior.
          </Text>
        </View>

        <View className="mb-4 rounded-2xl border border-[#8D69F6]/25 bg-[#8D69F6]/10 px-4 py-3">
          <Text className="text-white text-sm font-semibold">
            What happens next
          </Text>
          <Text className="text-white/70 mt-1 text-sm leading-5">
            Support reviews the report, conversation context may be checked, and
            the other member is not told who reported them. This is not an
            emergency channel and does not promise an instant moderation action.
            This is not an emergency channel.
          </Text>
        </View>

        <View className="mb-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <Text className="text-white text-sm font-semibold">
            What support receives
          </Text>
          <Text className="text-white/70 mt-1 text-sm leading-5">
            We send your selected reason, optional details, where the report
            came from, and chat context only when available through
            submitUserReport. This form does not ask for passwords, payment
            details, or ID documents.
            This form does not ask for passwords, payment details, or ID
            documents.
            {" This form does not ask for passwords, payment details, or ID documents."}
          </Text>
        </View>

        <View className="mb-4 rounded-2xl border border-[#FFB020]/30 bg-[#FFB020]/10 px-4 py-3">
          <Text className="text-white text-sm font-semibold">
            Urgent safety reminder
          </Text>
          <Text className="text-white/70 mt-1 text-sm leading-5">
            If someone asks for money, codes, passwords, documents, or threatens
            you, stop replying. If you are in immediate danger, contact local
            emergency services.
          </Text>
        </View>

        <View
          className="space-y-3"
          accessibilityRole="radiogroup"
          accessibilityLabel="Report reason"
        >
          <Text className="text-white mb-1 text-base font-semibold">
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
                className={`min-h-[52px] rounded-2xl border px-4 py-3 ${
                  selected
                    ? "border-[#EF3E78] bg-[#EF3E78]/25"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <Text className="text-white text-base font-semibold">
                  {item.label}
                </Text>
                <Text className="text-white/62 mt-1 text-sm leading-5">
                  {item.helper}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="mt-6">
          <View className="mb-2 flex-row items-center justify-between gap-3">
            <Text className="text-white text-base font-semibold">Details</Text>
            <Text className="text-white/55 text-xs">{details.length}/800</Text>
          </View>
          <Text className="text-white/65 mb-3 text-sm leading-5">
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
            className="min-h-[156px] rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white text-base leading-6"
            accessibilityLabel="Report details"
            accessibilityHint="Optional. Add details that help support review the safety concern."
          />
        </View>

        <TouchableOpacity
          onPress={toggleShouldBlock}
          activeOpacity={0.86}
          className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
          accessibilityRole="switch"
          accessibilityLabel="Block this member too"
          accessibilityHint="Recommended. When enabled, the app reports and blocks this member"
          accessibilityState={{ checked: shouldBlock }}
        >
          <View className="flex-row items-center justify-between gap-4">
            <View className="flex-1">
              <Text className="text-white text-base font-semibold">
                Block this member too
              </Text>
              <Text className="text-white/65 mt-1 text-sm leading-5">
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
            <View className="mt-3 rounded-xl border border-[#FFB020]/30 bg-[#FFB020]/10 px-3 py-2">
              <Text className="text-white/78 text-sm leading-5">
                Report-only mode sends the report, but this member may still be
                able to contact you until you block them or moderation acts.
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {formError && (
          <View
            className="mt-4 rounded-2xl border border-[#FF6B6B]/35 bg-[#FF6B6B]/12 px-4 py-3"
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
          >
            <Text className="text-[#FFB4B4] text-sm leading-5">
              {formError}
            </Text>
            {reportSentWithoutBlock && (
              <TouchableOpacity
                onPress={handleRetryBlock}
                disabled={blockRetrying}
                activeOpacity={0.84}
                className="mt-3 min-h-[48px] items-center justify-center rounded-xl bg-[#FFB4B4]/18"
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
                  <Text className="text-white font-semibold">Retry block</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        <View className="mt-auto flex-row gap-3 pt-8">
          <TouchableOpacity
            onPress={() => router.back()}
            disabled={submitting || blockRetrying}
            activeOpacity={0.82}
            className="min-h-[52px] flex-1 items-center justify-center rounded-2xl border border-white/15"
            accessibilityRole="button"
            accessibilityLabel="Cancel report"
            accessibilityHint="Closes the report form without sending"
            accessibilityState={{ disabled: submitting || blockRetrying }}
          >
            <Text className="text-white font-semibold">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={
              reportSentWithoutBlock ? () => router.back() : handleSubmit
            }
            disabled={submitting || blockRetrying}
            activeOpacity={0.86}
            className={`min-h-[52px] flex-1 items-center justify-center rounded-2xl ${
              submitting || blockRetrying ? "bg-[#EF3E78]/55" : "bg-[#EF3E78]"
            }`}
            accessibilityRole="button"
            accessibilityLabel={
              reportSentWithoutBlock
                ? "Close report form"
                : submitting
                  ? "Sending report"
                  : blockRetrying
                    ? "Blocking member"
                  : "Send private report"
            }
            accessibilityHint={
              reportSentWithoutBlock
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
              <Text className="text-white font-bold">
                {reportSentWithoutBlock ? "Close" : "Send private report"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <Text className="text-white/50 mt-4 text-center text-xs leading-5">
          Reports help moderation review patterns. They do not guarantee that an
          account will be removed, do not replace local emergency services, and
          should not include passwords, payment details, or ID numbers.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
