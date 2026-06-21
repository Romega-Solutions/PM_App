import { colors } from "@/src/theme";
import { useResponsive } from "@/src/hooks/useResponsive";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React, { useMemo } from "react";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MIN_TOUCH_TARGET = 44;

interface BackButtonProps {
  onPress?: () => void;
}

export default function BackButton({ onPress }: BackButtonProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { moderateScale } = useResponsive();

  const styles = useMemo(() => StyleSheet.create({
    button: {
      position: "absolute",
      zIndex: 10,
      width: Math.max(MIN_TOUCH_TARGET, moderateScale(44)),
      height: Math.max(MIN_TOUCH_TARGET, moderateScale(44)),
      borderRadius: Math.max(MIN_TOUCH_TARGET, moderateScale(44)) / 2,
      backgroundColor: `${colors.neutral.white}1F`, // 12% opacity
      justifyContent: "center",
      alignItems: "center",
      ...Platform.select({
        ios: {
          shadowColor: colors.neutral.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      }),
    },
  }), [moderateScale]);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          top: insets.top + moderateScale(12),
          left: moderateScale(16),
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.75}
      hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
      accessible
      accessibilityRole="button"
      accessibilityLabel="Go back"
      accessibilityHint="Returns to the previous screen"
    >
      <ArrowLeft 
        size={moderateScale(24)} 
        color={colors.neutral.white} 
        strokeWidth={2.5} 
      />
    </TouchableOpacity>
  );
}

