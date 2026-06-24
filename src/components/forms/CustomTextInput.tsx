import { LucideIcon } from "lucide-react-native";
import React, { useState, useMemo } from "react";
import {
  TextInput,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  KeyboardTypeOptions,
  TextStyle,
  ViewStyle,
  Platform,
} from "react-native";

import { useResponsive } from "@/src/hooks/useResponsive";
import { useAppTheme } from "@/src/theme";

interface CustomTextInputProps
  extends Omit<
    TextInputProps,
    "keyboardType" | "autoCapitalize" | "autoComplete"
  > {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  LeftIcon?: LucideIcon;
  RightIcon?: LucideIcon;
  onRightIconPress?: () => void;
  rightIconAccessibilityLabel?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoComplete?:
    | "additional-name"
    | "address-line1"
    | "address-line2"
    | "birthdate-day"
    | "birthdate-full"
    | "birthdate-month"
    | "birthdate-year"
    | "cc-csc"
    | "cc-exp"
    | "cc-exp-day"
    | "cc-exp-month"
    | "cc-exp-year"
    | "cc-number"
    | "country"
    | "current-password"
    | "email"
    | "family-name"
    | "given-name"
    | "honorific-prefix"
    | "honorific-suffix"
    | "name"
    | "name-family"
    | "name-given"
    | "name-middle"
    | "name-middle-initial"
    | "name-prefix"
    | "name-suffix"
    | "new-password"
    | "nickname"
    | "one-time-code"
    | "organization"
    | "organization-title"
    | "password"
    | "password-new"
    | "postal-code"
    | "street-address"
    | "tel"
    | "username"
    | "off";
  error?: string;

  // Optional style overrides
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
  errorStyle?: TextStyle;
}

export default function CustomTextInput({
  label,
  value,
  onChangeText,
  placeholder,
  LeftIcon,
  RightIcon,
  onRightIconPress,
  rightIconAccessibilityLabel,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
  autoComplete,
  error,
  containerStyle,
  labelStyle,
  inputStyle,
  errorStyle,
  onFocus,
  onBlur,
  ...props
}: CustomTextInputProps) {
  const theme = useAppTheme();

  const [focused, setFocused] = useState(false);
  const hasValue = !!value?.length;
  const inputAccessibilityLabel = label ?? placeholder ?? "Text input";
  const { moderateScale } = useResponsive();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      fontSize: moderateScale(15),
      color: theme.colors.neutral.white,
      marginBottom: theme.spacing.sm,
      letterSpacing: 0,
      fontFamily: theme.fontFamilies.body.semiBold,
    },
    input: {
      backgroundColor: `${theme.colors.neutral.white}14`, // 8% opacity
      borderRadius: moderateScale(16),
      paddingVertical: Platform.select({
        ios: moderateScale(18),
        android: moderateScale(16),
        web: moderateScale(16),
      }),
      fontSize: moderateScale(16),
      color: theme.colors.neutral.white,
      borderWidth: Platform.select({ ios: 2, android: 2, web: 1.5 }),
      minHeight: Platform.select({
        ios: moderateScale(56),
        android: moderateScale(52),
        web: moderateScale(52),
      }),
      fontFamily: theme.fontFamilies.body.regular,
      letterSpacing: 0,
    },
    leftIconWrap: {
      position: "absolute",
      left: moderateScale(18),
      top: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
    },
    rightIconWrap: {
      position: "absolute",
      right: moderateScale(18),
      top: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      minWidth: 44,
      minHeight: 44,
      padding: moderateScale(4),
    },
    error: {
      fontSize: moderateScale(13),
      color: theme.semanticColors.error,
      marginTop: theme.spacing.xs,
      marginLeft: moderateScale(4),
      fontFamily: theme.fontFamilies.body.regular,
      letterSpacing: 0,
    },
  }), [moderateScale, theme]);
  const borderColor = error
    ? theme.semanticColors.error
    : focused
      ? theme.semanticColors.primary
      : hasValue
        ? `${theme.semanticColors.primary}80` // 50% opacity
        : `${theme.semanticColors.secondary}40`; // 25% opacity

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      {label ? <Text style={[styles.label, labelStyle]}>{label}</Text> : null}

      {/* Input container */}
      <View style={{ position: "relative" }}>
        <TextInput
          style={[
            styles.input,
            {
              paddingLeft: LeftIcon ? moderateScale(52) : moderateScale(18),
              paddingRight: RightIcon ? moderateScale(52) : moderateScale(18),
              borderColor,
            },
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={`${theme.colors.neutral.white}66`} // 40% opacity
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          selectionColor={`${theme.semanticColors.secondary}E6`} // 90% opacity
          accessibilityLabel={inputAccessibilityLabel}
          accessibilityHint={error ? `Error: ${error}` : undefined}
          accessibilityState={{ disabled: props.editable === false }}
          maxFontSizeMultiplier={1.3}
          {...props}
        />

        {/* Left icon */}
        {LeftIcon ? (
          <View
            style={styles.leftIconWrap}
            accessible={false}
            importantForAccessibility="no"
          >
            <LeftIcon
              size={moderateScale(20)}
              color={`${theme.semanticColors.primary}B3`} // 70% opacity
              strokeWidth={2}
            />
          </View>
        ) : null}

        {/* Right icon */}
        {RightIcon ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconWrap}
            disabled={!onRightIconPress}
            accessible
            accessibilityRole="button"
            accessibilityLabel={
              rightIconAccessibilityLabel ??
              (label ? `Toggle ${label}` : "Toggle input option")
            }
            accessibilityHint="Changes the input visibility or option."
            accessibilityState={{ disabled: !onRightIconPress }}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <RightIcon
              size={moderateScale(20)}
              color={`${theme.colors.neutral.white}B3`} // 70% opacity
              strokeWidth={2}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Error text */}
      {error ? (
        <Text
          style={[styles.error, errorStyle]}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

