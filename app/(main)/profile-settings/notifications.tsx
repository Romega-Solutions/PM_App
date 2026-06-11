import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  accountApi,
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationPreferences,
} from "@/src/features/account/api/accountApi";
import { LaunchStateNotice } from "@/src/components/ui/LaunchStateNotice";
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  Heart,
  Mail,
  MessageCircle,
  Users,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BRAND_BG = "#0F0814";
const ACCENT_PURPLE = "#8D69F6";
const ACCENT_PINK = "#EF3E78";
const WHITE = "#FFFFFF";
const SURFACE_STRONG = "rgba(255, 255, 255, 0.08)";
const TILE_BORDER = "rgba(168, 85, 247, 0.13)";
const NOTIFICATION_LOAD_ERROR =
  "Notification preferences could not be loaded. Check your connection and try again.";
const NOTIFICATION_SAVE_ERROR =
  "Notification preference was not saved. Check your connection and try again.";

type NotificationPreferenceKey =
  | "pushEnabled"
  | "newMatches"
  | "newMessages"
  | "newLikes"
  | "emailUpdates";

function formatNotificationUpdatedAt(value?: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [preferences, setPreferences] = useState<NotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES,
  );
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savingPreference, setSavingPreference] =
    useState<NotificationPreferenceKey | null>(null);
  const [saveError, setSaveError] = useState<{
    key: NotificationPreferenceKey;
    message: string;
  } | null>(null);
  const [reloadAttempt, setReloadAttempt] = useState(0);
  const deliveryStatus =
    "Launch-stage preference only. Production delivery requires notification provider and support routing sign-off.";
  const updatedAtLabel = React.useMemo(
    () => formatNotificationUpdatedAt(preferences.updatedAt),
    [preferences.updatedAt],
  );

  React.useEffect(() => {
    let isMounted = true;

    const loadPreferences = async () => {
      if (isMounted) {
        setIsLoadingPreferences(true);
        setLoadError(null);
        setSaveError(null);
      }

      try {
        const loadedPreferences = await accountApi.getNotificationPreferences();
        if (isMounted) {
          setPreferences(loadedPreferences);
        }
      } catch {
        if (isMounted) {
          setLoadError(NOTIFICATION_LOAD_ERROR);
          Alert.alert("Notification preferences unavailable", NOTIFICATION_LOAD_ERROR);
        }
      } finally {
        if (isMounted) {
          setIsLoadingPreferences(false);
        }
      }
    };

    loadPreferences();

    return () => {
      isMounted = false;
    };
  }, [reloadAttempt]);

  const savePreference = async (
    key: NotificationPreferenceKey,
    value: boolean,
  ) => {
    if (isLoadingPreferences || savingPreference || loadError) {
      return;
    }

    if (preferences[key] === value) {
      return;
    }

    const previousPreferences = preferences;
    const nextPreferences = { ...preferences, [key]: value };

    if (key === "pushEnabled" && !value) {
      nextPreferences.newMatches = false;
      nextPreferences.newMessages = false;
      nextPreferences.newLikes = false;
    }

    setPreferences(nextPreferences);
    setSavingPreference(key);
    setSaveError(null);

    try {
      const savedPreferences =
        await accountApi.saveNotificationPreferences(nextPreferences);
      setPreferences(savedPreferences);
    } catch {
      setPreferences(previousPreferences);
      setSaveError({ key, message: NOTIFICATION_SAVE_ERROR });
      Alert.alert("Preference not saved", NOTIFICATION_SAVE_ERROR);
    } finally {
      setSavingPreference(null);
    }
  };

  const pushEnabled = preferences.pushEnabled;
  const newMatches = preferences.newMatches;
  const newMessages = preferences.newMessages;
  const newLikes = preferences.newLikes;
  const emailNotifications = preferences.emailUpdates;
  const isPreferenceLocked =
    isLoadingPreferences || savingPreference !== null || !!loadError;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_BG} />
      {Platform.OS === "ios" && (
        <View style={{ height: insets.top, backgroundColor: BRAND_BG }} />
      )}

      <LinearGradient
        colors={[BRAND_BG, "#1A0F1F", "#2D1B35", BRAND_BG]}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/(main)/profile")}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Back to profile"
        >
          <ArrowLeft size={24} color={WHITE} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <LaunchStateNotice
          testID="notification-settings-launch-state-notice"
title="Launch-stage controls"
          message="These switches save notification preferences to your PinayMate account for QA and launch planning. Production push and email delivery still require provider setup, mailbox routing, and release sign-off."
          meta={updatedAtLabel ? `Last saved ${updatedAtLabel}` : null}
          accessibilityLabel="Notification launch note. These preferences are saved to your PinayMate account for this launch build and do not prove production push or email delivery."
        />

        {isLoadingPreferences ? (
          <View style={styles.statusCard}>
            <ActivityIndicator size="small" color={ACCENT_PINK} />
            <Text style={styles.statusCardText}>
              Loading notification preferences...
            </Text>
          </View>
        ) : null}

        {loadError ? (
          <View style={styles.errorCard} accessibilityRole="alert">
            <AlertCircle size={20} color="#FFB4B4" strokeWidth={2.4} />
            <View style={styles.errorCopy}>
              <Text style={styles.errorTitle}>Preferences need to reload</Text>
              <Text style={styles.errorText}>
                Switches are locked until PinayMate loads your saved
                notification preferences, so defaults cannot overwrite your
                account.
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => setReloadAttempt((attempt) => attempt + 1)}
                accessibilityRole="button"
                accessibilityLabel="Retry loading notification preferences"
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Push Notifications</Text>

        <View style={styles.settingBlock}>
          <TouchableOpacity
            style={[
              styles.settingItem,
              isPreferenceLocked && styles.disabledItem,
            ]}
            onPress={() => savePreference("pushEnabled", !pushEnabled)}
            disabled={isPreferenceLocked}
            activeOpacity={0.82}
            accessibilityRole="switch"
            accessibilityLabel={`Enable push notifications: ${
              pushEnabled ? "on" : "off"
            }`}
            accessibilityHint={deliveryStatus}
            accessibilityState={{
              checked: pushEnabled,
              disabled: isPreferenceLocked,
              busy: savingPreference === "pushEnabled",
            }}
          >
            <View style={styles.settingLeft}>
              <Bell size={22} color={ACCENT_PURPLE} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Enable Push Notifications</Text>
                <Text style={styles.settingDesc}>
                  Save your device-notification preference for launch QA
                </Text>
              </View>
            </View>
            {savingPreference === "pushEnabled" ? (
              <View style={styles.savingState}>
                <ActivityIndicator size="small" color={ACCENT_PINK} />
                <Text style={styles.savingText}>Saving</Text>
              </View>
            ) : (
              <View pointerEvents="none">
                <Switch
                  value={pushEnabled}
                  accessible={false}
                  importantForAccessibility="no"
                  trackColor={{ false: "#3e3e3e", true: ACCENT_PURPLE }}
                  thumbColor={WHITE}
                />
              </View>
            )}
          </TouchableOpacity>
          {saveError?.key === "pushEnabled" ? (
            <Text style={styles.inlineError} accessibilityRole="alert">
              {saveError.message}
            </Text>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>Notification Types</Text>

        <View style={styles.settingBlock}>
          <TouchableOpacity
            style={[
              styles.settingItem,
              (!pushEnabled || isPreferenceLocked) && styles.disabledItem,
            ]}
            onPress={() => {
              if (pushEnabled) savePreference("newMatches", !newMatches);
            }}
            disabled={!pushEnabled || isPreferenceLocked}
            activeOpacity={0.82}
            accessibilityRole="switch"
            accessibilityLabel={`New match notifications: ${
              newMatches ? "on" : "off"
            }`}
            accessibilityHint={
              pushEnabled
                ? deliveryStatus
                : "Enable push notifications first."
            }
            accessibilityState={{
              checked: newMatches,
              disabled: !pushEnabled || isPreferenceLocked,
              busy: savingPreference === "newMatches",
            }}
          >
            <View style={styles.settingLeft}>
              <Users size={22} color={ACCENT_PURPLE} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>New Matches</Text>
                <Text style={styles.settingDesc}>
                  Preference for mutual-match alerts after delivery is wired
                </Text>
              </View>
            </View>
            {savingPreference === "newMatches" ? (
              <View style={styles.savingState}>
                <ActivityIndicator size="small" color={ACCENT_PINK} />
                <Text style={styles.savingText}>Saving</Text>
              </View>
            ) : (
              <View pointerEvents="none">
                <Switch
                  value={newMatches}
                  accessible={false}
                  importantForAccessibility="no"
                  trackColor={{ false: "#3e3e3e", true: ACCENT_PURPLE }}
                  thumbColor={WHITE}
                  disabled={!pushEnabled}
                />
              </View>
            )}
          </TouchableOpacity>
          {!pushEnabled && !isLoadingPreferences && !loadError ? (
            <Text style={styles.lockedHelper}>Enable push first to edit this.</Text>
          ) : null}
          {saveError?.key === "newMatches" ? (
            <Text style={styles.inlineError} accessibilityRole="alert">
              {saveError.message}
            </Text>
          ) : null}
        </View>

        <View style={styles.settingBlock}>
          <TouchableOpacity
            style={[
              styles.settingItem,
              (!pushEnabled || isPreferenceLocked) && styles.disabledItem,
            ]}
            onPress={() => {
              if (pushEnabled) savePreference("newMessages", !newMessages);
            }}
            disabled={!pushEnabled || isPreferenceLocked}
            activeOpacity={0.82}
            accessibilityRole="switch"
            accessibilityLabel={`New message notifications: ${
              newMessages ? "on" : "off"
            }`}
            accessibilityHint={
              pushEnabled
                ? deliveryStatus
                : "Enable push notifications first."
            }
            accessibilityState={{
              checked: newMessages,
              disabled: !pushEnabled || isPreferenceLocked,
              busy: savingPreference === "newMessages",
            }}
          >
            <View style={styles.settingLeft}>
              <MessageCircle size={22} color={ACCENT_PURPLE} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>New Messages</Text>
                <Text style={styles.settingDesc}>
                  Preference for matched-message alerts after delivery is wired
                </Text>
              </View>
            </View>
            {savingPreference === "newMessages" ? (
              <View style={styles.savingState}>
                <ActivityIndicator size="small" color={ACCENT_PINK} />
                <Text style={styles.savingText}>Saving</Text>
              </View>
            ) : (
              <View pointerEvents="none">
                <Switch
                  value={newMessages}
                  accessible={false}
                  importantForAccessibility="no"
                  trackColor={{ false: "#3e3e3e", true: ACCENT_PURPLE }}
                  thumbColor={WHITE}
                  disabled={!pushEnabled}
                />
              </View>
            )}
          </TouchableOpacity>
          {!pushEnabled && !isLoadingPreferences && !loadError ? (
            <Text style={styles.lockedHelper}>Enable push first to edit this.</Text>
          ) : null}
          {saveError?.key === "newMessages" ? (
            <Text style={styles.inlineError} accessibilityRole="alert">
              {saveError.message}
            </Text>
          ) : null}
        </View>

        <View style={styles.settingBlock}>
          <TouchableOpacity
            style={[
              styles.settingItem,
              (!pushEnabled || isPreferenceLocked) && styles.disabledItem,
            ]}
            onPress={() => {
              if (pushEnabled) savePreference("newLikes", !newLikes);
            }}
            disabled={!pushEnabled || isPreferenceLocked}
            activeOpacity={0.82}
            accessibilityRole="switch"
            accessibilityLabel={`New like notifications: ${
              newLikes ? "on" : "off"
            }`}
            accessibilityHint={
              pushEnabled
                ? deliveryStatus
                : "Enable push notifications first."
            }
            accessibilityState={{
              checked: newLikes,
              disabled: !pushEnabled || isPreferenceLocked,
              busy: savingPreference === "newLikes",
            }}
          >
            <View style={styles.settingLeft}>
              <Heart size={22} color={ACCENT_PURPLE} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>New Likes</Text>
                <Text style={styles.settingDesc}>
                  Preference for like alerts after delivery is wired
                </Text>
              </View>
            </View>
            {savingPreference === "newLikes" ? (
              <View style={styles.savingState}>
                <ActivityIndicator size="small" color={ACCENT_PINK} />
                <Text style={styles.savingText}>Saving</Text>
              </View>
            ) : (
              <View pointerEvents="none">
                <Switch
                  value={newLikes}
                  accessible={false}
                  importantForAccessibility="no"
                  trackColor={{ false: "#3e3e3e", true: ACCENT_PURPLE }}
                  thumbColor={WHITE}
                  disabled={!pushEnabled}
                />
              </View>
            )}
          </TouchableOpacity>
          {!pushEnabled && !isLoadingPreferences && !loadError ? (
            <Text style={styles.lockedHelper}>Enable push first to edit this.</Text>
          ) : null}
          {saveError?.key === "newLikes" ? (
            <Text style={styles.inlineError} accessibilityRole="alert">
              {saveError.message}
            </Text>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>Email Notifications</Text>

        <View style={styles.settingBlock}>
          <TouchableOpacity
            style={[
              styles.settingItem,
              isPreferenceLocked && styles.disabledItem,
            ]}
            onPress={() => savePreference("emailUpdates", !emailNotifications)}
            disabled={isPreferenceLocked}
            activeOpacity={0.82}
            accessibilityRole="switch"
            accessibilityLabel={`Email updates: ${
              emailNotifications ? "on" : "off"
            }`}
            accessibilityHint="Launch-stage preference only. Production email delivery requires mailbox and provider sign-off."
            accessibilityState={{
              checked: emailNotifications,
              disabled: isPreferenceLocked,
              busy: savingPreference === "emailUpdates",
            }}
          >
            <View style={styles.settingLeft}>
              <Mail size={22} color={ACCENT_PURPLE} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Email Updates</Text>
                <Text style={styles.settingDesc}>
                  Preference for launch and support updates after email routing is
                  confirmed
                </Text>
              </View>
            </View>
            {savingPreference === "emailUpdates" ? (
              <View style={styles.savingState}>
                <ActivityIndicator size="small" color={ACCENT_PINK} />
                <Text style={styles.savingText}>Saving</Text>
              </View>
            ) : (
              <View pointerEvents="none">
                <Switch
                  value={emailNotifications}
                  accessible={false}
                  importantForAccessibility="no"
                  trackColor={{ false: "#3e3e3e", true: ACCENT_PURPLE }}
                  thumbColor={WHITE}
                />
              </View>
            )}
          </TouchableOpacity>
          {saveError?.key === "emailUpdates" ? (
            <Text style={styles.inlineError} accessibilityRole="alert">
              {saveError.message}
            </Text>
          ) : null}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND_BG,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    color: WHITE,
    fontFamily: "DMSans-Bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: ACCENT_PINK,
    fontFamily: "DMSans-Bold",
    marginTop: 20,
    marginBottom: 20,
  },
  settingBlock: {
    marginBottom: 12,
  },
  noticeCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(239, 62, 120, 0.24)",
    backgroundColor: "rgba(239, 62, 120, 0.1)",
    padding: 14,
    marginTop: 12,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  noticeCopy: {
    flex: 1,
  },
  noticeTitle: {
    color: WHITE,
    fontSize: 14,
    fontFamily: "DMSans-Bold",
    marginBottom: 4,
  },
  noticeText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    fontFamily: "DMSans-Regular",
    lineHeight: 19,
  },
  noticeMeta: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 12,
    fontFamily: "DMSans-SemiBold",
    lineHeight: 17,
    marginTop: 10,
  },
  statusCard: {
    backgroundColor: SURFACE_STRONG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: TILE_BORDER,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    marginBottom: 4,
  },
  statusCardText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    fontFamily: "DMSans-Regular",
  },
  errorCard: {
    backgroundColor: "rgba(255, 107, 107, 0.12)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.35)",
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 12,
    marginBottom: 4,
  },
  errorCopy: {
    flex: 1,
  },
  errorTitle: {
    color: WHITE,
    fontSize: 14,
    fontFamily: "DMSans-Bold",
    marginBottom: 4,
  },
  errorText: {
    color: "rgba(255,255,255,0.74)",
    fontSize: 13,
    fontFamily: "DMSans-Regular",
    lineHeight: 19,
  },
  retryButton: {
    alignSelf: "flex-start",
    backgroundColor: ACCENT_PINK,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.26)",
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 10,
    minHeight: 44,
    justifyContent: "center",
  },
  retryButtonText: {
    color: WHITE,
    fontSize: 13,
    fontFamily: "DMSans-Bold",
  },
  settingItem: {
    backgroundColor: SURFACE_STRONG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: TILE_BORDER,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 78,
  },
  disabledItem: {
    opacity: 0.62,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    color: WHITE,
    fontSize: 16,
    fontFamily: "DMSans-SemiBold",
    marginBottom: 2,
  },
  settingDesc: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontFamily: "DMSans-Regular",
    lineHeight: 18,
  },
  savingState: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minWidth: 56,
  },
  savingText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontFamily: "DMSans-SemiBold",
  },
  lockedHelper: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 12,
    fontFamily: "DMSans-Regular",
    lineHeight: 17,
    marginTop: 6,
    paddingHorizontal: 4,
  },
  inlineError: {
    color: "#FFB4B4",
    fontSize: 12,
    fontFamily: "DMSans-SemiBold",
    lineHeight: 17,
    marginTop: 6,
    paddingHorizontal: 4,
  },
});
