import { colors, semanticColors, theme } from "@/src/theme";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  DimensionValue,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// Responsive scaling
const scale = (size: number) => (width / 375) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  showChevron?: boolean;
  disabled?: boolean;
  loading?: boolean;
  width?: DimensionValue;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function PrimaryButton({
  title,
  onPress,
  showChevron = true,
  disabled = false,
  loading = false,
  width: customWidth = "100%",
  accessibilityLabel,
  accessibilityHint,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: customWidth,
          opacity: isDisabled ? 0.6 : 1,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={isDisabled}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
    >
      <LinearGradient
        colors={[semanticColors.primary, semanticColors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.neutral.white} />
        ) : null}

        <Text
          style={[
            styles.text,
            showChevron && !loading && styles.textWithChevron,
          ]}
        >
          {loading ? "Loading..." : title}
        </Text>

        {showChevron && !loading ? (
          <ChevronRight
            size={moderateScale(24)}
            color={colors.neutral.white}
            strokeWidth={2.5}
          />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: moderateScale(28),
    height: moderateScale(56),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: semanticColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: Platform.select({ ios: 0.5, android: 0.4, web: 0.3 }),
    shadowRadius: 20,
    elevation: 12,
    overflow: "hidden",
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(8),
    paddingHorizontal: theme.spacing.md,
  },

  text: {
    color: colors.neutral.white,
    fontSize: moderateScale(18),
    fontFamily: theme.fontFamilies.body.semiBold,
    letterSpacing: Platform.select({ ios: 0.5, android: 0.3, web: 0.4 }),
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  textWithChevron: {
    marginRight: moderateScale(4),
  },
});
