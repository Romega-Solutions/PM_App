import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MessageCircle } from "lucide-react-native";

import { useTheme, withAlpha } from "@/src/theme";

interface ChatStateViewProps {
  title: string;
  message?: string;
  loading?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

export function ChatStateView({
  title,
  message,
  loading = false,
  actionLabel,
  onAction,
}: ChatStateViewProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: colors.brandBackground }]}
      accessibilityLiveRegion={loading ? "polite" : "none"}
    >
      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.secondary}
          accessibilityLabel={title}
        />
      ) : (
        <MessageCircle
          size={44}
          color={withAlpha(colors.onPrimary, 0.5)}
          strokeWidth={1.5}
        />
      )}
      <Text style={[styles.title, { color: colors.onPrimary }]}>{title}</Text>
      {message ? (
        <Text style={[styles.message, { color: withAlpha(colors.onPrimary, 0.65) }]}>
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.secondary }]}
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={[styles.actionText, { color: colors.onSecondary }]}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  title: {
    marginTop: 16,
    fontSize: 18,
    fontFamily: "DMSans-Bold",
    textAlign: "center",
  },
  message: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    lineHeight: 20,
    textAlign: "center",
  },
  actionButton: {
    minHeight: 44,
    marginTop: 20,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: {
    fontSize: 15,
    fontFamily: "DMSans-Bold",
  },
});
