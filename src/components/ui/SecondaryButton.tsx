import { colors, theme } from "@/src/theme";
import { useResponsive } from "@/src/hooks/useResponsive";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  DimensionValue,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";



interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
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
  loadingLabel,
  width: customWidth = "100%",
  variant = "purple",
  accessibilityLabel,
  accessibilityHint,
}: SecondaryButtonProps) {
  const isDisabled = disabled || loading;
  const visibleTitle = loading ? (loadingLabel ?? "Working...") : title;
  const screenReaderLabel = loading
    ? `${accessibilityLabel || title}. ${loadingLabel ?? "In progress."}`
    : accessibilityLabel || title;

  const variantStyles = getVariantStyles(variant, theme);
  const { moderateScale } = useResponsive();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      borderRadius: moderateScale(28),
      height: moderateScale(56),
      minHeight: 52,
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
      justifyContent: "center",
      gap: moderateScale(8),
      paddingHorizontal: theme.spacing.md,
      minHeight: 52,
      width: "100%",
    },

    text: {
      color: colors.neutral.white,
      fontSize: 17,
      fontFamily: theme.fontFamilies.body.semiBold,
      letterSpacing: 0,
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
      flexShrink: 1,
      textAlign: "center",
    },
  }), [moderateScale]);

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
      accessibilityLabel={screenReaderLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLiveRegion={loading ? "polite" : "none"}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.neutral.white} />
        ) : null}

        <Text
          style={[styles.text, variantStyles.text]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.82}
          maxFontSizeMultiplier={1.25}
        >
          {visibleTitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function getVariantStyles(variant: "purple" | "pink" | "white", theme: any) {
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

