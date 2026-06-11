import { theme } from "@/src/theme";
import {
  Camera,
  CheckCircle,
  Clock,
  FileText,
  XCircle,
} from "lucide-react-native";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

type Status =
  | "pending"
  | "captured"
  | "processing"
  | "submitted"
  | "verified"
  | "rejected";

interface Props {
  type: "selfie" | "document";
  status: Status;
  title: string;
  description: string;
}

export default function VerificationProcessingCard({
  type,
  status,
  title,
  description,
}: Props) {
  const statusMeta = (() => {
    switch (status) {
      case "verified":
        return {
          step: 3,
          stage: "Result ready",
          color: theme.colors.success[600],
          bg: theme.colors.success[100],
          border: "rgba(34,165,116,0.56)",
          text: "Verified",
          hint: "Approved after a private safety review.",
          Icon: CheckCircle,
        };
      case "captured":
        return {
          step: 1,
          stage: "Capture saved",
          color: theme.colors.success[600],
          bg: theme.colors.success[100],
          border: "rgba(34,165,116,0.56)",
          text: "Captured",
          hint: "We have the file. Submit it when you are ready for review.",
          Icon: CheckCircle,
        };
      case "submitted":
        return {
          step: 2,
          stage: "In review",
          color: theme.colors.success[600],
          bg: theme.colors.success[100],
          border: "rgba(34,165,116,0.56)",
          text: "Submitted",
          hint: "Sent to the safety queue. Your details stay private.",
          Icon: CheckCircle,
        };
      case "processing":
        return {
          step: 2,
          stage: "Checking details",
          color: theme.colors.warning[600],
          bg: theme.colors.warning[100],
          border: "rgba(245,158,11,0.64)",
          text: "Processing",
          hint: "We are checking image clarity before the final result.",
          Icon: Clock,
        };
      case "rejected":
        return {
          step: 3,
          stage: "Action needed",
          color: theme.colors.error[600],
          bg: theme.colors.error[100],
          border: "rgba(213,44,77,0.64)",
          text: "Needs review",
          hint: "Try again with brighter lighting and all details visible.",
          Icon: XCircle,
        };
      default:
        return {
          step: 1,
          stage: "Not started",
          color: theme.semanticColors.primary,
          bg: theme.colors.amihan[50],
          border: "rgba(239,62,120,0.52)",
          text: "Pending",
          hint:
            type === "selfie"
              ? "Take a clear selfie to start verification."
              : "Upload a valid ID document to continue verification.",
          Icon: type === "selfie" ? Camera : FileText,
        };
    }
  })();

  const { Icon } = statusMeta;
  const timelineSteps = ["Capture", "Private review", "Result"];

  return (
    <View
      style={[styles.container, { borderColor: statusMeta.border }]}
      accessible
      accessibilityRole="summary"
      accessibilityLabel={`${title}. Status: ${statusMeta.text}. ${description} ${statusMeta.stage}, step ${statusMeta.step} of ${timelineSteps.length}. ${statusMeta.hint}`}
    >
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: statusMeta.bg }]}>
          <Icon size={20} color={statusMeta.color} strokeWidth={2.4} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title} maxFontSizeMultiplier={1.25}>
            {title}
          </Text>
          <Text style={styles.desc} maxFontSizeMultiplier={1.25}>
            {description}
          </Text>
        </View>
        <View style={[styles.pill, { borderColor: statusMeta.color }]}>
          <View style={[styles.dot, { backgroundColor: statusMeta.color }]} />
          <Text
            style={[styles.pillText, { color: statusMeta.color }]}
            maxFontSizeMultiplier={1.15}
          >
            {statusMeta.text}
          </Text>
        </View>
      </View>
      <View style={styles.trustRow} accessible={false}>
        <View style={styles.timeline} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {timelineSteps.map((step, index) => {
            const isActive = index + 1 <= statusMeta.step;

            return (
              <View
                key={step}
                style={[
                  styles.timelineSegment,
                  {
                    backgroundColor: isActive
                      ? statusMeta.color
                      : "rgba(255,255,255,0.18)",
                  },
                ]}
              />
            );
          })}
        </View>
        <Text style={styles.stageText} maxFontSizeMultiplier={1.2}>
          {statusMeta.stage} - {statusMeta.hint}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1.5,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: Platform.OS === "ios" ? theme.spacing.md : 14,
    minHeight: Platform.OS === "ios" ? 76 : 72,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  title: {
    fontSize: 16,
    color: theme.colors.neutral.white,
    fontFamily: theme.fontFamilies.body.semiBold,
    lineHeight: 22,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    minHeight: 32,
    maxWidth: 116,
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  pillText: {
    fontFamily: theme.fontFamilies.body.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  desc: {
    fontSize: 14,
    color: "rgba(255,255,255,0.86)",
    lineHeight: 20,
  },
  trustRow: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    gap: 8,
  },
  timeline: {
    flexDirection: "row",
    gap: 6,
  },
  timelineSegment: {
    flex: 1,
    height: 4,
    borderRadius: theme.borderRadius.full,
  },
  stageText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
    lineHeight: 18,
  },
});
