import { theme, colors } from "@/src/theme";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import {
  Dimensions,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const scale = (size: number) => (width / 375) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

interface BackButtonProps {
  onPress?: () => void;
}

export default function BackButton({ onPress }: BackButtonProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
      accessible
      accessibilityRole="button"
      accessibilityLabel="Go back"
    >
      <ArrowLeft 
        size={moderateScale(24)} 
        color={colors.neutral.white} 
        strokeWidth={2.5} 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    zIndex: 10,
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
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
});