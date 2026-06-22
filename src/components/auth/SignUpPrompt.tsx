import { useAppTheme } from "@/src/theme";
import { useResponsive } from "@/src/hooks/useResponsive";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SignUpPromptProps {
  questionText?: string;
  actionText?: string;
  onPress?: () => void;
}

export default function SignUpPrompt({
  questionText = "New to PinayMate?",
  actionText = "Create Account",
  onPress,
}: SignUpPromptProps) {
  const theme = useAppTheme();

  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push("/(auth)/signup");
    }
  };

  const { moderateScale } = useResponsive();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      alignItems: "center",
      paddingVertical: moderateScale(32),
    },
    question: {
      color: `${theme.colors.neutral.white}B3`, // 70% opacity
      fontSize: moderateScale(14),
      marginBottom: moderateScale(10),
      fontFamily: theme.fontFamilies.body.regular,
      letterSpacing: Platform.select({ ios: 0.2, android: 0.15, web: 0.2 }),
    },
    action: {
      color: theme.semanticColors.primary,
      fontSize: moderateScale(16),
      lineHeight: moderateScale(22),
      letterSpacing: Platform.select({ ios: 0.3, android: 0.2, web: 0.3 }),
      fontFamily: theme.fontFamilies.body.bold,
    },
    actionButton: {
      minHeight: 44,
      justifyContent: "center",
      paddingHorizontal: moderateScale(8),
    },
  }), [moderateScale, theme]);

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{questionText}</Text>
      <TouchableOpacity
        onPress={handlePress}
        style={styles.actionButton}
        accessible
        accessibilityRole="button"
        accessibilityLabel={actionText}
        accessibilityHint="Opens the next account access step"
      >
        <Text style={styles.action}>{actionText}</Text>
      </TouchableOpacity>
    </View>
  );
}

