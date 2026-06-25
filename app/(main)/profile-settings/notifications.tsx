import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  accountApi,
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationPreferences,
} from "@/src/features/account/api/accountApi";
import {
  getDemoNotificationPreferences,
  saveDemoNotificationPreferences,
} from "@/src/features/profile/data/demoSettingsStore";
import { LaunchStateNotice } from "@/src/components/ui/LaunchStateNotice";
import { useAuthStore } from "@/src/stores/authStore";
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
  const isDemoMode = useAuthStore((state) => state.isDemoMode);

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
    "Preference saved for your account. Delivery depends on your device and contact settings.";
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

      if (isDemoMode) {
        if (isMounted) {
          setPreferences(getDemoNotificationPreferences());
          setIsLoadingPreferences(false);
        }
        return;
      }

      try {
        const loadedPreferences = await accountApi.getNotificationPreferences();
        if (isMounted) {
          setPreferences(loadedPreferences);
        }
      } catch {
        if (isMounted) {
          setLoadError(NOTIFICATION_LOAD_ERROR);
          Alert.alert("Could not load notification preferences", NOTIFICATION_LOAD_ERROR);
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
  }, [isDemoMode, reloadAttempt]);

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

    if (isDemoMode) {
      setPreferences(saveDemoNotificationPreferences(nextPreferences));
      setSavingPreference(null);
      return;
    }

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
          onPress={() => router.replace("/profile")}
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
          title="Notification controls"
          message="Choose which PinayMate reminders you want. Push and email delivery depend on your device settings and the contact details on your account."
          meta={updatedAtLabel ? `Last saved ${updatedAtLabel}` : null}
          accessibilityLabel="Notification note. These preferences are saved to your PinayMate account. Delivery depends on your device settings and account contact details."
        />

        {isLoadingPreferences ? (
          <View style={styles.statusRow}>
            <ActivityIndicator size="small" color={ACCENT_PINK} />
            <Text style={styles.statusRowText}>
              Loading notification preferences...
            </Text>
          </View>
        ) : null}

        {loadError ? (
          <View style={styles.errorStrip} accessibilityRole="alert">
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
                  Save your device-notification preference.
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
                  Get alerts when a mutual match is available.
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
                  Get alerts for messages from people you match with.
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
                  Get alerts when someone likes your profile.
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
            accessibilityHint="Preference saved for your account. Email delivery depends on the email address on your account."
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
                  Get account, safety, and product updates by email.
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
  statusRow: {
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    marginBottom: 4,
  },
  statusRowText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    fontFamily: "DMSans-Regular",
  },
  errorStrip: {
    backgroundColor: "rgba(255, 107, 107, 0.12)",
    borderLeftWidth: 3,
    borderLeftColor: "#FFB4B4",
    paddingLeft: 14,
    paddingVertical: 12,
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
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
    paddingVertical: 16,
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
