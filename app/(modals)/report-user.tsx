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

    if (!userId) {
      setFormError(
        "This member could not be identified. Go back and try again.",
      );
      return;
    }

    setSubmitting(true);

    if (isSeedReport) {
      setSubmitting(false);
      Alert.alert(
        shouldBlock ? "Demo report and block recorded" : "Demo report recorded",
        shouldBlock
          ? "No real report or block was sent. This keeps the beta preview safe while preserving the live safety flow for real members."
          : "No real report was sent. This keeps the beta preview safe while preserving the live safety flow for real members.",
        [{ text: "Close", onPress: () => router.back() }],
      );
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
      Alert.alert(
        "Demo block recorded",
        "No real block was sent. This keeps the beta preview safe while preserving the live safety flow for real members.",
        [{ text: "Close", onPress: () => router.back() }],
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
        <View >
          <View >
            <View  />
            <View  />
            <Text >
              Private safety report
            </Text>
          </View>
          <Text
            
            accessibilityRole="header"
          >
            Report member
          </Text>
          <Text >
            Tell support what happened with {reportedName}. Reports are private
            to moderation and help us act on unsafe behavior.
          </Text>
        </View>

        <View >
          <Text >
            What happens next
          </Text>
          <Text >
            Support reviews the report, available conversation context may be
            checked, and the other member is not told who reported them. This is
            not an emergency channel and does not promise an instant moderation action.
          </Text>
          <Text >
            What support receives
          </Text>
          <Text >
            We send your selected reason, optional details, where the report came
            from, and chat context only when available. This form does not ask for passwords, payment details, or ID documents.
          </Text>
          <Text >
            If someone asks for money, codes, passwords, documents, or threatens
            you, stop replying. If you are in immediate danger, contact local
            emergency services.
          </Text>
        </View>

        <View
          
          accessibilityRole="radiogroup"
          accessibilityLabel="Report reason"
        >
          <Text >
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
                
              >
                <Text >
                  {item.label}
                </Text>
                <Text >
                  {item.helper}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View >
          <View >
            <Text >Details</Text>
            <Text >{details.length}/800</Text>
          </View>
          <Text >
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
            
            accessibilityLabel="Report details"
            accessibilityHint="Optional. Add details that help support review the safety concern."
          />
        </View>

        <TouchableOpacity
          onPress={toggleShouldBlock}
          activeOpacity={0.86}
          
          accessibilityRole="switch"
          accessibilityLabel="Block this member too"
          accessibilityHint="Recommended. When enabled, the app reports and blocks this member"
          accessibilityState={{ checked: shouldBlock }}
        >
          <View >
            <View >
              <Text >
                Block this member too
              </Text>
              <Text >
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
            <View >
              <Text >
                Report-only mode sends the report, but this member may still be
                able to contact you until you block them or moderation acts.
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {formError && (
          <View
            
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
          >
            <Text >
              {formError}
            </Text>
            {reportSentWithoutBlock && (
              <TouchableOpacity
                onPress={handleRetryBlock}
                disabled={blockRetrying}
                activeOpacity={0.84}
                
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
                  <Text >Retry block</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        <View >
          <TouchableOpacity
            onPress={() => router.back()}
            disabled={submitting || blockRetrying}
            activeOpacity={0.82}
            
            accessibilityRole="button"
            accessibilityLabel="Cancel report"
            accessibilityHint="Closes the report form without sending"
            accessibilityState={{ disabled: submitting || blockRetrying }}
          >
            <Text >Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={
              reportSentWithoutBlock ? () => router.back() : handleSubmit
            }
            disabled={submitting || blockRetrying}
            activeOpacity={0.86}
            
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
              <Text >
                {reportSentWithoutBlock ? "Close" : "Send private report"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <Text >
          Reports help moderation review patterns. They do not guarantee that an
          account will be removed, do not replace local emergency services, and
          should not include passwords, payment details, or ID numbers.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
