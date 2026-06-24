import { ShieldCheck } from "lucide-react-native";
import React from "react";
import {
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useAppTheme } from "../../theme/ThemeContext";
import { makeStyles } from "../../theme/makeStyles";

type LaunchStateNoticeProps = {
  title: string;
  message: string;
  meta?: string | null;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function LaunchStateNotice({
  title,
  message,
  meta,
  accessibilityLabel,
  accessibilityHint,
  testID,
  style,
}: LaunchStateNoticeProps) {
  const theme = useAppTheme();
  const styles = useStyles();

  return (
    <View
      testID={testID ?? "launch-state-notice"}
      collapsable={false}
      style={[styles.noticeCard, style]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={
        accessibilityLabel ??
        `${title}. ${message} This note explains what is available now and what may come later.`
      }
      accessibilityHint={
        accessibilityHint ??
        "Use this note to understand which PinayMate features are available now and which may open later."
      }
    >
      <View
        style={styles.noticeIcon}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <ShieldCheck size={20} color={theme.semanticColors.primary} strokeWidth={2.4} />
      </View>
      <View style={styles.noticeCopy}>
        <Text style={styles.noticeTitle}>{title}</Text>
        <Text style={styles.noticeText}>{message}</Text>
        {meta ? <Text style={styles.noticeMeta}>{meta}</Text> : null}
      </View>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  noticeCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(168, 85, 247, 0.18)",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 22,
  },
  noticeCopy: {
    flex: 1,
  },
  noticeIcon: {
    alignItems: "center",
    justifyContent: "center",
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(239, 62, 120, 0.12)",
  },
  noticeTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 6,
  },
  noticeText: {
    color: "rgba(255, 255, 255, 0.72)",
    fontSize: 13,
    lineHeight: 20,
  },
  noticeMeta: {
    color: theme.semanticColors.primary,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 10,
    textTransform: "uppercase",
  },
}));
