import { SettingsScreenScaffold, SettingsSectionTitle } from "@/src/components/settings/SettingsScreenScaffold";
import { SettingsRow } from "@/src/components/settings/SettingsRow";
import { useTheme } from "@/src/theme";
import { useRouter } from "expo-router";
import {
  Book,
  ChevronRight,
  FileText,
  HelpCircle,
  Mail,
  MessageCircle,
} from "lucide-react-native";
import React from "react";
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function HelpScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const unavailable = (label: string) =>
    Alert.alert("Unavailable", `${label} is not available in this build.`);

  return (
    <SettingsScreenScaffold title="Help & Support">
      <SettingsSectionTitle>How can we help you?</SettingsSectionTitle>

      <SettingsRow
        icon={HelpCircle}
        title="FAQ"
        description="Unavailable in this build"
        onPress={() => unavailable("FAQ")}
        badge="Unavailable"
        trailing={<ChevronRight size={20} color={colors.secondary} />}
      />
      <SettingsRow
        icon={Book}
        title="User Guide"
        description="Unavailable in this build"
        onPress={() => unavailable("User Guide")}
        badge="Unavailable"
        trailing={<ChevronRight size={20} color={colors.secondary} />}
      />
      <SettingsRow
        icon={FileText}
        title="Terms of Service"
        onPress={() => router.push("/(auth)/terms" as never)}
        trailing={<ChevronRight size={20} color={colors.secondary} />}
      />
      <SettingsRow
        icon={FileText}
        title="Privacy Policy"
        onPress={() => router.push("/(auth)/privacy" as never)}
        trailing={<ChevronRight size={20} color={colors.secondary} />}
      />
      <SettingsRow
        icon={Mail}
        title="Contact Support"
        description="Email support@pinaymate.com"
        onPress={() => Linking.openURL("mailto:support@pinaymate.com")}
        trailing={<ChevronRight size={20} color={colors.secondary} />}
      />
      <SettingsRow
        icon={MessageCircle}
        title="Live Chat"
        description="Unavailable in this build"
        onPress={() => unavailable("Live Chat")}
        badge="Unavailable"
        trailing={<ChevronRight size={20} color={colors.secondary} />}
      />

      <View style={styles.contactCard}>
        <Text style={styles.contactTitle}>Still need help?</Text>
        <Text style={styles.contactDesc}>
          Our support team can assist with account, safety, and billing questions.
        </Text>
        <TouchableOpacity
          style={styles.contactBtn}
          onPress={() => Linking.openURL("mailto:support@pinaymate.com")}
          accessibilityRole="button"
          accessibilityLabel="Email support"
        >
          <Mail size={18} color={colors.onSecondary} />
          <Text style={styles.contactBtnText}>Email Support</Text>
        </TouchableOpacity>
      </View>
    </SettingsScreenScaffold>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    contactCard: {
      backgroundColor: colors.brandSurfaceElevated,
      borderColor: colors.brandBorder,
      borderRadius: 16,
      borderWidth: 1,
      marginTop: 24,
      padding: 20,
    },
    contactTitle: {
      color: colors.onPrimary,
      fontFamily: "DMSans-Bold",
      fontSize: 18,
      marginBottom: 8,
    },
    contactDesc: {
      color: colors.textSecondary,
      fontFamily: "DMSans-Regular",
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 16,
    },
    contactBtn: {
      alignItems: "center",
      backgroundColor: colors.secondary,
      borderRadius: 12,
      flexDirection: "row",
      gap: 8,
      justifyContent: "center",
      minHeight: 48,
      padding: 14,
    },
    contactBtnText: {
      color: colors.onSecondary,
      fontFamily: "DMSans-Bold",
      fontSize: 16,
    },
  });
