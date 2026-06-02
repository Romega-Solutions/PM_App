import { theme, useTheme, withAlpha } from "@/src/theme";
import { LucideIcon } from "lucide-react-native";
import React, { useState } from "react";
import {
  KeyboardTypeOptions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

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
  rightIconAccessibilityLabel = "Toggle input option",
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
  const [focused, setFocused] = useState(false);
  const { colors } = useTheme();
  const hasValue = !!value?.length;

  const handleFocus: NonNullable<TextInputProps["onFocus"]> = (event) => {
    setFocused(true);
    onFocus?.(event);
  };

  const handleBlur: NonNullable<TextInputProps["onBlur"]> = (event) => {
    setFocused(false);
    onBlur?.(event);
  };

  const borderColor = error
    ? colors.error
    : focused
      ? colors.primary
      : hasValue
        ? withAlpha(colors.primary, 0.5)
        : colors.brandBorder;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={[styles.label, { color: colors.onPrimary }, labelStyle]}>
          {label}
        </Text>
      ) : null}

      <View style={styles.inputFrame}>
        <TextInput
          style={[
            styles.input,
            {
              paddingLeft: LeftIcon ? 52 : 18,
              paddingRight: RightIcon ? 56 : 18,
              borderColor,
              backgroundColor: colors.brandSurface,
              color: colors.onPrimary,
            },
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={withAlpha(colors.onPrimary, 0.48)}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          onFocus={handleFocus}
          onBlur={handleBlur}
          selectionColor={colors.secondary}
          accessibilityLabel={props.accessibilityLabel || label || placeholder}
          {...props}
        />

        {LeftIcon ? (
          <View style={styles.leftIconWrap} pointerEvents="none">
            <LeftIcon
              size={theme.iconSizes.md}
              color={withAlpha(colors.primary, 0.76)}
              strokeWidth={2}
            />
          </View>
        ) : null}

        {RightIcon ? (
          <Pressable
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={styles.rightIconWrap}
            hitSlop={8}
            accessible
            accessibilityRole="button"
            accessibilityLabel={rightIconAccessibilityLabel}
            accessibilityState={{ disabled: !onRightIconPress }}
          >
            <RightIcon
              size={theme.iconSizes.md}
              color={withAlpha(colors.onPrimary, 0.76)}
              strokeWidth={2}
            />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text
          style={[styles.error, { color: colors.errorInk }, errorStyle]}
          accessibilityRole="alert"
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    ...theme.textStyles.label,
    marginBottom: theme.spacing.sm,
  },
  inputFrame: {
    position: "relative",
  },
  input: {
    ...theme.textStyles.input,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: Platform.select({
      ios: 18,
      android: 16,
      web: 16,
    }),
    borderWidth: Platform.select({ ios: 2, android: 2, web: 1.5 }),
    minHeight: Platform.select({
      ios: 56,
      android: 52,
      web: 52,
    }),
  },
  leftIconWrap: {
    position: "absolute",
    left: 18,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  rightIconWrap: {
    position: "absolute",
    right: 8,
    top: 0,
    bottom: 0,
    width: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    ...theme.textStyles.caption,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
});
