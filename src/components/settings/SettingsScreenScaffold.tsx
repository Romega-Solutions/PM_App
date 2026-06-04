import { theme, useTheme, withAlpha } from "@/src/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SettingsScreenScaffoldProps {
  title: string;
  children: React.ReactNode;
  rightAction?: React.ReactNode;
  loading?: boolean;
}

export function SettingsScreenScaffold({
  title,
  children,
  rightAction,
  loading = false,
}: SettingsScreenScaffoldProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brandBackground} />
      {insets.top > 0 && (
        <View style={{ height: insets.top, backgroundColor: colors.brandBackground }} />
      )}

      <LinearGradient
        colors={[
          colors.brandBackground,
          withAlpha(colors.secondaryDark, 0.32),
          withAlpha(colors.primaryDark, 0.24),
          colors.brandBackground,
        ]}
        locations={[0, 0.3, 0.72, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/(main)/profile")}
          style={styles.headerButton}
          hitSlop={theme.hitSlop.sm}
          accessibilityRole="button"
          accessibilityLabel="Back to profile"
        >
          <ArrowLeft
            size={theme.iconSizes.navigation}
            color={colors.onPrimary}
            strokeWidth={theme.strokeWidths.emphasis}
          />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.headerButton}>{rightAction}</View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={[
            styles.contentInner,
            { paddingBottom: Math.max(insets.bottom + 24, 40) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      )}
    </View>
  );
}

export function SettingsSectionTitle({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <Text style={[sectionStyles.title, { color: colors.primary }]}>{children}</Text>;
}

export function SettingsNote({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <Text style={[sectionStyles.note, { color: withAlpha(colors.onPrimary, 0.68) }]}>{children}</Text>;
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.brandBackground,
    },
    header: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.screen,
      paddingVertical: theme.spacing.field,
    },
    headerButton: {
      alignItems: "center",
      justifyContent: "center",
      minHeight: theme.componentSizes.iconButton,
      minWidth: theme.componentSizes.iconButton,
    },
    title: {
      color: colors.onPrimary,
      fontFamily: "DMSans-Bold",
      fontSize: 20,
    },
    centered: {
      alignItems: "center",
      flex: 1,
      justifyContent: "center",
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.screen,
    },
    contentInner: {
      paddingTop: 4,
    },
  });

const sectionStyles = StyleSheet.create({
  title: {
    fontFamily: "DMSans-Bold",
    fontSize: 18,
    marginBottom: 16,
    marginTop: 20,
  },
  note: {
    fontFamily: "DMSans-Regular",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
});
