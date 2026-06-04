import { theme, useTheme, withAlpha } from "@/src/theme";
import type { LucideIcon } from "lucide-react-native";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

interface SettingsRowProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  onPress?: () => void;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
  destructive?: boolean;
  trailing?: React.ReactNode;
  badge?: string;
}

export function SettingsRow({
  title,
  description,
  icon: Icon,
  onPress,
  value,
  onValueChange,
  disabled = false,
  destructive = false,
  trailing,
  badge,
}: SettingsRowProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors, destructive, disabled);
  const isSwitch = typeof value === "boolean" && onValueChange;

  const content = (
    <>
      <View style={styles.iconBox}>
        <Icon
          size={theme.iconSizes.control}
          color={destructive ? colors.danger : colors.secondary}
          strokeWidth={theme.strokeWidths.emphasis}
        />
      </View>
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          {badge ? <Text style={styles.badge}>{badge}</Text> : null}
        </View>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          trackColor={{
            false: withAlpha(colors.onPrimary, 0.18),
            true: withAlpha(colors.secondary, 0.72),
          }}
          thumbColor={colors.onPrimary}
        />
      ) : (
        trailing
      )}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.row,
          pressed && !disabled ? styles.rowPressed : null,
        ]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        accessibilityLabel={title}
        disabled={disabled}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View
      style={styles.row}
      accessibilityRole={isSwitch ? "switch" : undefined}
      accessibilityState={{ disabled, checked: isSwitch ? value : undefined }}
      accessibilityLabel={title}
    >
      {content}
    </View>
  );
}

const createStyles = (
  colors: ReturnType<typeof useTheme>["colors"],
  destructive: boolean,
  disabled: boolean,
) =>
  StyleSheet.create({
    row: {
      alignItems: "center",
      backgroundColor: destructive
        ? withAlpha(colors.danger, 0.12)
        : colors.brandSurface,
      borderColor: destructive ? colors.danger : colors.brandBorder,
      borderRadius: 12,
      borderWidth: 1,
      flexDirection: "row",
      gap: theme.spacing.touchGap,
      marginBottom: theme.spacing.related,
      minHeight: theme.componentSizes.settingsRowMinHeight,
      opacity: disabled ? 0.58 : 1,
      padding: theme.spacing.card,
    },
    rowPressed: {
      backgroundColor: destructive
        ? withAlpha(colors.danger, 0.18)
        : colors.brandSurfaceElevated,
    },
    iconBox: {
      alignItems: "center",
      height: theme.componentSizes.iconButton,
      justifyContent: "center",
      width: theme.componentSizes.iconButton,
    },
    copy: {
      flex: 1,
      gap: 3,
    },
    titleRow: {
      alignItems: "center",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    title: {
      color: destructive ? colors.danger : colors.onPrimary,
      fontFamily: "DMSans-SemiBold",
      fontSize: 16,
    },
    description: {
      color: withAlpha(colors.onPrimary, 0.64),
      fontFamily: "DMSans-Regular",
      fontSize: 13,
      lineHeight: 18,
    },
    badge: {
      borderColor: withAlpha(colors.onPrimary, 0.16),
      borderRadius: 10,
      borderWidth: 1,
      color: withAlpha(colors.onPrimary, 0.7),
      fontFamily: "DMSans-SemiBold",
      fontSize: 11,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
  });
