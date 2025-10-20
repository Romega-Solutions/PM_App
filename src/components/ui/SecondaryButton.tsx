import { colors, theme } from "@/src/theme";
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

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  width?: DimensionValue;
  variant?: "purple" | "pink" | "white";
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function SecondaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  width: customWidth = "100%",
  variant = "purple",
  accessibilityLabel,
  accessibilityHint,
}: SecondaryButtonProps) {
  const isDisabled = disabled || loading;

  const variantStyles = getVariantStyles(variant);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        variantStyles.container,
        {
          width: customWidth,
          opacity: isDisabled ? 0.6 : 1,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isDisabled}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.neutral.white} />
        ) : null}

        <Text style={[styles.text, variantStyles.text]}>
          {loading ? "Loading..." : title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function getVariantStyles(variant: "purple" | "pink" | "white") {
  const variants = {
    purple: {
      container: {
        backgroundColor: `${colors.dalisay[500]}1F`, // 12% opacity
        borderColor: `${colors.dalisay[500]}66`, // 40% opacity
        shadowColor: colors.dalisay[500],
      },
      text: {
        textShadowColor: `${colors.dalisay[500]}80`, // 50% opacity
      },
    },
    pink: {
      container: {
        backgroundColor: `${colors.amihan[500]}1F`,
        borderColor: `${colors.amihan[500]}66`,
        shadowColor: colors.amihan[500],
      },
      text: {
        textShadowColor: `${colors.amihan[500]}80`,
      },
    },
    white: {
      container: {
        backgroundColor: `${colors.neutral.white}1F`,
        borderColor: `${colors.neutral.white}66`,
        shadowColor: colors.neutral.white,
      },
      text: {
        textShadowColor: `${colors.neutral.white}80`,
      },
    },
  };

  return variants[variant];
}

const styles = StyleSheet.create({
  container: {
    borderRadius: moderateScale(28),
    height: moderateScale(56),
    borderWidth: Platform.select({ ios: 1.5, android: 2, web: 1.5 }),
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: Platform.select({ ios: 0.25, android: 0.2, web: 0.2 }),
    shadowRadius: 12,
    elevation: 6,
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
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
