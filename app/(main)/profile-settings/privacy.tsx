import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  accountApi,
  DEFAULT_PRIVACY_SETTINGS,
  type PrivacySettings,
} from "@/src/features/account/api/accountApi";
import { LaunchStateNotice } from "@/src/components/ui/LaunchStateNotice";
import { useAuthStore } from "@/src/stores/authStore";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Shield,
  type LucideIcon,
  UserX,
} from "lucide-react-native";
import React from "react";
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
const TILE_BORDER = "rgba(168, 85, 247, 0.13)";
const PRIVACY_LOAD_ERROR =
  "Privacy settings could not be loaded. Check your connection and try again.";
const PRIVACY_SAVE_ERROR =
  "This setting could not be saved. Check your connection and try again.";
const DELETION_REQUEST_ERROR =
  "Your deletion request was not sent. Check your connection and try again.";
const DEMO_PRIVACY_UPDATED_AT = "2026-01-01T00:00:00.000Z";

type PrivacySettingKey =
  | "showOnlineStatus"
  | "showDistance"
  | "readReceipts"
  | "profileVisible";

type DeletionRequestFeedback = {
  type: "success" | "error";
  title: string;
  message: string;
};

const createDefaultDemoPrivacySettings = (): PrivacySettings => ({
  ...DEFAULT_PRIVACY_SETTINGS,
  showOnlineStatus: true,
  showDistance: true,
  readReceipts: true,
  profileVisible: true,
  updatedAt: DEMO_PRIVACY_UPDATED_AT,
});

let demoPrivacySettings = createDefaultDemoPrivacySettings();

function formatPrivacyUpdatedAt(value?: string) {
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

export default function PrivacyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDemoMode = useAuthStore((state) => state.isDemoMode);
  const [isRequestingDeletion, setIsRequestingDeletion] = React.useState(false);
  const [settings, setSettings] = React.useState<PrivacySettings>(
    DEFAULT_PRIVACY_SETTINGS,
  );
  const [isLoadingSettings, setIsLoadingSettings] = React.useState(true);
  const [savingSetting, setSavingSetting] =
    React.useState<PrivacySettingKey | null>(null);
  const [deletionFeedback, setDeletionFeedback] =
    React.useState<DeletionRequestFeedback | null>(null);
  const [settingsLoadError, setSettingsLoadError] = React.useState<
    string | null
  >(null);
  const [reloadAttempt, setReloadAttempt] = React.useState(0);
  const updatedAtLabel = React.useMemo(
    () => formatPrivacyUpdatedAt(settings.updatedAt),
    [settings.updatedAt],
  );

  React.useEffect(() => {
    let isMounted = true;

    const loadPrivacySettings = async () => {
      if (isMounted) {
        setIsLoadingSettings(true);
        setSettingsLoadError(null);
      }

      if (isDemoMode) {
        if (isMounted) {
          setSettings(demoPrivacySettings);
          setIsLoadingSettings(false);
        }
        return;
      }

      try {
        const loadedSettings = await accountApi.getPrivacySettings();
        if (isMounted) {
          setSettings(loadedSettings);
        }
      } catch {
        if (isMounted) {
          setSettingsLoadError(PRIVACY_LOAD_ERROR);
          Alert.alert("Could not load privacy settings", PRIVACY_LOAD_ERROR);
        }
      } finally {
        if (isMounted) {
          setIsLoadingSettings(false);
        }
      }
    };

    loadPrivacySettings();

    return () => {
      isMounted = false;
    };
  }, [isDemoMode, reloadAttempt]);

  const saveSetting = async (key: PrivacySettingKey, value: boolean) => {
    if (isLoadingSettings || savingSetting || settingsLoadError) {
      return;
    }

    if (settings[key] === value) {
      return;
    }

    const previousSettings = settings;
    const nextSettings = { ...settings, [key]: value };

    setSettings(nextSettings);
    setSavingSetting(key);

    if (isDemoMode) {
      demoPrivacySettings = {
        ...nextSettings,
        updatedAt: DEMO_PRIVACY_UPDATED_AT,
      };
      setSettings(demoPrivacySettings);
      setSavingSetting(null);
      return;
    }

    try {
      const savedSettings = await accountApi.savePrivacySettings(nextSettings);
      setSettings(savedSettings);
    } catch {
      setSettings(previousSettings);
      Alert.alert("Privacy setting not saved", PRIVACY_SAVE_ERROR);
    } finally {
      setSavingSetting(null);
    }
  };

  const privacySettings: {
    key: PrivacySettingKey;
    title: string;
    description: string;
    enabledLabel: string;
    disabledLabel: string;
    icon: LucideIcon;
  }[] = [
    {
      key: "showOnlineStatus",
      title: "Online Status",
      description:
        "Controls whether other members can see your active presence.",
      enabledLabel: "Visible",
      disabledLabel: "Hidden",
      icon: Eye,
    },
    {
      key: "showDistance",
      title: "Distance Display",
      description:
        "Controls whether approximate distance can be shown in discovery.",
      enabledLabel: "Shown",
      disabledLabel: "Hidden",
      icon: Shield,
    },
    {
      key: "readReceipts",
      title: "Read Receipts",
      description:
        "Controls whether matched members can see when you read messages.",
      enabledLabel: "On",
      disabledLabel: "Off",
      icon: EyeOff,
    },
    {
      key: "profileVisible",
      title: "Profile Visibility",
      description: "Controls whether your profile can appear in discovery.",
      enabledLabel: "Discoverable",
      disabledLabel: "Hidden",
      icon: Lock,
    },
  ];

  const submitDeletionRequest = async () => {
    setDeletionFeedback(null);
    setIsRequestingDeletion(true);

    if (isDemoMode) {
      setIsRequestingDeletion(false);
      setDeletionFeedback({
        type: "success",
        title: "Demo request recorded",
        message:
          "No account deletion request was sent. This preview keeps the real support workflow ready for live accounts.",
      });
      return;
    }

    const result = await accountApi.requestAccountDeletion();
    setIsRequestingDeletion(false);

    if (!result.success) {
      setDeletionFeedback({
        type: "error",
        title: "Request not sent",
        message: DELETION_REQUEST_ERROR,
      });
      return;
    }

    setDeletionFeedback({
      type: "success",
      title: "Deletion request received",
      message: `Your request is ${
        result.status ?? "pending"
      } for support review. It does not instantly erase your account, matches, messages, or verification records, and support may contact you before closing the request.`,
    });
  };

  const confirmDeletionRequest = () => {
    if (Platform.OS === "web") {
      const shouldSubmit =
        typeof window !== "undefined" &&
        window.confirm(
          "Request account deletion? This sends a secure deletion request to PinayMate support. It does not instantly delete your account, matches, messages, or verification records.",
        );

      if (shouldSubmit) {
        void submitDeletionRequest();
      }
      return;
    }

    Alert.alert(
      "Request account deletion?",
      "This sends a secure deletion request to PinayMate support. It does not instantly delete your account, matches, messages, or verification records, and support may contact you before closing the request.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Submit Request",
          style: "destructive",
          onPress: submitDeletionRequest,
        },
      ],
    );
  };

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
        <Text style={styles.title}>Privacy</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Privacy Settings</Text>

        <LaunchStateNotice
          testID="privacy-settings-launch-state-notice"
          title="Privacy controls"
          message="These settings save privacy preferences to your PinayMate account. Profile visibility, read receipts, and account deletion requests follow your current app access, safety review, and support process."
          meta={updatedAtLabel ? `Last saved ${updatedAtLabel}` : null}
          accessibilityLabel="Privacy note. These settings save privacy preferences to your PinayMate account. Profile visibility, read receipts, and account deletion requests follow your current app access, safety review, and support process."
        />

        {isLoadingSettings ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={ACCENT_PINK} />
            <Text style={styles.loadingText}>Loading privacy settings...</Text>
          </View>
        ) : null}

        {settingsLoadError ? (
          <View style={styles.errorStrip} accessibilityRole="alert">
            <AlertCircle size={20} color="#FFB4B4" strokeWidth={2.4} />
            <View style={styles.errorCopy}>
              <Text style={styles.errorTitle}>Settings need to reload</Text>
              <Text style={styles.errorText}>
                Toggles are locked until PinayMate loads your saved privacy
                choices, so defaults cannot overwrite your account.
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => setReloadAttempt((attempt) => attempt + 1)}
                accessibilityRole="button"
                accessibilityLabel="Retry loading privacy settings"
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {!isLoadingSettings && !settingsLoadError && !settings.profileVisible ? (
          <View style={styles.hiddenProfileStrip}>
            <EyeOff size={20} color="#FFD6E4" strokeWidth={2.4} />
            <View style={styles.hiddenProfileCopy}>
              <Text style={styles.hiddenProfileTitle}>
                Your profile is hidden
              </Text>
              <Text style={styles.hiddenProfileText}>
                You can still use PinayMate, but new people should not see your
                profile in discovery while this is off.
              </Text>
            </View>
          </View>
        ) : null}

        <View style={styles.settingsGroup}>
          {privacySettings.map(
            ({
              key,
              title,
              description,
              enabledLabel,
              disabledLabel,
              icon: Icon,
            }) => {
              const isEnabled = settings[key];
              const isSaving = savingSetting === key;
              const isDisabled =
                isLoadingSettings ||
                savingSetting !== null ||
                !!settingsLoadError;

              return (
                <TouchableOpacity
                  key={title}
                  style={styles.settingRow}
                  onPress={() => saveSetting(key, !isEnabled)}
                  disabled={isDisabled}
                  activeOpacity={0.82}
                  accessibilityRole="switch"
                  accessibilityLabel={`${title}: ${
                    isEnabled ? enabledLabel : disabledLabel
                  }`}
                  accessibilityHint={description}
                  accessibilityState={{
                    checked: isEnabled,
                    disabled: isDisabled,
                  }}
                >
                  <View style={styles.settingLeft}>
                    <Icon size={22} color={ACCENT_PURPLE} />
                    <View style={styles.settingText}>
                      <Text style={styles.settingTitle}>{title}</Text>
                      <Text style={styles.settingDesc}>{description}</Text>
                    </View>
                  </View>
                  <View style={styles.statusPill}>
                    {isSaving ? (
                      <ActivityIndicator size="small" color={ACCENT_PINK} />
                    ) : (
                      <Text style={styles.statusText}>
                        {isEnabled ? enabledLabel : disabledLabel}
                      </Text>
                    )}
                  </View>
                  <View pointerEvents="none">
                    <Switch
                      value={isEnabled}
                      accessible={false}
                      importantForAccessibility="no"
                      trackColor={{
                        false: "rgba(255,255,255,0.16)",
                        true: "rgba(141,105,246,0.56)",
                      }}
                      thumbColor={
                        isEnabled ? ACCENT_PINK : "rgba(255,255,255,0.8)"
                      }
                      ios_backgroundColor="rgba(255,255,255,0.16)"
                    />
                  </View>
                </TouchableOpacity>
              );
            },
          )}
        </View>

        <Text style={styles.sectionTitle}>Data & Account</Text>

        <View style={styles.deletionInfoStrip}>
          <Text style={styles.deletionInfoTitle}>
            Account deletion is reviewed
          </Text>
          <Text style={styles.deletionInfoText}>
            This sends a private request to support. It does not bypass
            safety, fraud, legal, or verification review, and it does not
            instantly delete account records. Support
            may contact you before closing the request.
          </Text>
        </View>

        <View
          style={styles.deletionChecklistSection}
          accessibilityLabel="Before requesting account deletion, understand that support reviews the request, safety records may be retained when required, and you will receive a status update after review."
        >
          <Text style={styles.deletionChecklistTitle}>
            Before you request deletion
          </Text>
          {[
            "Support reviews the request before account records change.",
            "Safety, fraud, legal, or verification records may need retention.",
            "You will see a request status after support receives it.",
          ].map((item) => (
            <View key={item} style={styles.deletionChecklistRow}>
              <CheckCircle2 size={16} color="#8CF2C1" strokeWidth={2.4} />
              <Text style={styles.deletionChecklistText}>{item}</Text>
            </View>
          ))}
        </View>

        {deletionFeedback ? (
          <View
            style={[
              styles.deletionFeedbackStrip,
              deletionFeedback.type === "success"
                ? styles.deletionSuccessStrip
                : styles.deletionErrorStrip,
            ]}
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
          >
            {deletionFeedback.type === "success" ? (
              <CheckCircle2 size={20} color="#8CF2C1" strokeWidth={2.4} />
            ) : (
              <AlertCircle size={20} color="#FFB4B4" strokeWidth={2.4} />
            )}
            <View style={styles.deletionFeedbackCopy}>
              <Text style={styles.deletionFeedbackTitle}>
                {deletionFeedback.title}
              </Text>
              <Text style={styles.deletionFeedbackText}>
                {deletionFeedback.message}
              </Text>
            </View>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.destructiveActionRow}
          onPress={confirmDeletionRequest}
          disabled={isRequestingDeletion}
          accessibilityRole="button"
          accessibilityLabel="Request account deletion for support review"
          accessibilityHint="This sends a request for review and does not instantly delete your account."
          accessibilityState={{
            disabled: isRequestingDeletion,
            busy: isRequestingDeletion,
          }}
        >
          {isRequestingDeletion ? (
            <ActivityIndicator size="small" color={ACCENT_PINK} />
          ) : (
            <UserX size={22} color={ACCENT_PINK} />
          )}
          <Text style={styles.actionText}>
            {isRequestingDeletion
              ? "Sending deletion request..."
              : "Request Account Deletion"}
          </Text>
        </TouchableOpacity>

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
  noticeCard: {
    backgroundColor: "rgba(141, 105, 246, 0.12)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(141, 105, 246, 0.28)",
    padding: 16,
    marginBottom: 16,
  },
  noticeTitle: {
    color: WHITE,
    fontSize: 15,
    fontFamily: "DMSans-Bold",
    marginBottom: 6,
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
  loadingRow: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: TILE_BORDER,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  loadingText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    fontFamily: "DMSans-Regular",
  },
  errorStrip: {
    backgroundColor: "rgba(255, 107, 107, 0.12)",
    borderLeftWidth: 3,
    borderLeftColor: "rgba(255, 107, 107, 0.72)",
    paddingVertical: 16,
    paddingLeft: 14,
    paddingRight: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
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
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: WHITE,
    fontSize: 12,
    fontFamily: "DMSans-Bold",
  },
  hiddenProfileStrip: {
    backgroundColor: "rgba(239, 62, 120, 0.14)",
    borderLeftWidth: 3,
    borderLeftColor: "rgba(239, 62, 120, 0.72)",
    paddingVertical: 16,
    paddingLeft: 14,
    paddingRight: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  hiddenProfileCopy: {
    flex: 1,
  },
  hiddenProfileTitle: {
    color: WHITE,
    fontSize: 14,
    fontFamily: "DMSans-Bold",
    marginBottom: 4,
  },
  hiddenProfileText: {
    color: "rgba(255,255,255,0.74)",
    fontSize: 13,
    fontFamily: "DMSans-Regular",
    lineHeight: 19,
  },
  settingsGroup: {
    borderTopWidth: 1,
    borderTopColor: TILE_BORDER,
    marginBottom: 12,
  },
  settingRow: {
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: TILE_BORDER,
    minHeight: 72,
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
  statusPill: {
    maxWidth: 112,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginLeft: 10,
  },
  statusText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 11,
    fontFamily: "DMSans-SemiBold",
    textAlign: "center",
  },
  deletionChecklistSection: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(140, 242, 193, 0.2)",
    paddingVertical: 16,
    marginBottom: 12,
    gap: 10,
  },
  deletionChecklistTitle: {
    color: WHITE,
    fontSize: 15,
    fontFamily: "DMSans-Bold",
  },
  deletionChecklistRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  deletionChecklistText: {
    flex: 1,
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    fontFamily: "DMSans-Regular",
    lineHeight: 19,
  },
  destructiveActionRow: {
    backgroundColor: "rgba(239, 62, 120, 0.12)",
    borderLeftWidth: 3,
    borderLeftColor: ACCENT_PINK,
    paddingVertical: 16,
    paddingLeft: 14,
    paddingRight: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  deletionInfoStrip: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderLeftWidth: 3,
    borderLeftColor: "rgba(255, 255, 255, 0.22)",
    paddingVertical: 16,
    paddingLeft: 14,
    paddingRight: 10,
    marginBottom: 12,
  },
  deletionInfoTitle: {
    color: WHITE,
    fontSize: 15,
    fontFamily: "DMSans-Bold",
    marginBottom: 6,
  },
  deletionInfoText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    fontFamily: "DMSans-Regular",
    lineHeight: 19,
  },
  deletionFeedbackStrip: {
    borderLeftWidth: 3,
    paddingVertical: 14,
    paddingLeft: 14,
    paddingRight: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  deletionSuccessStrip: {
    backgroundColor: "rgba(34, 165, 116, 0.12)",
    borderLeftColor: "rgba(34, 165, 116, 0.72)",
  },
  deletionErrorStrip: {
    backgroundColor: "rgba(255, 107, 107, 0.12)",
    borderLeftColor: "rgba(255, 107, 107, 0.72)",
  },
  deletionFeedbackCopy: {
    flex: 1,
  },
  deletionFeedbackTitle: {
    color: WHITE,
    fontSize: 14,
    fontFamily: "DMSans-Bold",
    marginBottom: 4,
  },
  deletionFeedbackText: {
    color: "rgba(255,255,255,0.74)",
    fontSize: 13,
    fontFamily: "DMSans-Regular",
    lineHeight: 19,
  },
  actionText: {
    color: ACCENT_PINK,
    fontSize: 16,
    fontFamily: "DMSans-SemiBold",
  },
});
