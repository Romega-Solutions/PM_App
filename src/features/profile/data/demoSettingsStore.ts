import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  DEFAULT_PRIVACY_SETTINGS,
  type NotificationPreferences,
  type PrivacySettings,
} from "@/src/features/account/api/accountApi";

const DEMO_PRIVACY_STORAGE_KEY = "pinaymate-demo-privacy-settings";
const DEMO_NOTIFICATION_STORAGE_KEY = "pinaymate-demo-notification-settings";
const DEMO_MATCH_PREFERENCES_STORAGE_KEY = "pinaymate-demo-match-preferences";
const DEMO_UPDATED_AT = "2026-01-01T00:00:00.000Z";

export type DemoPreferencesFormState = {
  ageMin: string;
  ageMax: string;
  maxDistance: string;
  relationshipGoal: string;
};

const defaultDemoPrivacySettings: PrivacySettings = {
  ...DEFAULT_PRIVACY_SETTINGS,
  showOnlineStatus: true,
  showDistance: true,
  readReceipts: true,
  profileVisible: true,
  updatedAt: DEMO_UPDATED_AT,
};

const defaultDemoNotificationPreferences: NotificationPreferences = {
  ...DEFAULT_NOTIFICATION_PREFERENCES,
  pushEnabled: true,
  newMatches: true,
  newMessages: true,
  newLikes: true,
  emailUpdates: false,
  updatedAt: DEMO_UPDATED_AT,
};

const defaultDemoMatchPreferences: DemoPreferencesFormState = {
  ageMin: "18",
  ageMax: "38",
  maxDistance: "75",
  relationshipGoal: "serious relationship",
};

let memoryPrivacySettings = defaultDemoPrivacySettings;
let memoryNotificationPreferences = defaultDemoNotificationPreferences;
let memoryMatchPreferences = defaultDemoMatchPreferences;

function readStoredValue<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const stored = window.localStorage?.getItem(key);
    return stored ? ({ ...fallback, ...(JSON.parse(stored) as Partial<T>) } as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStoredValue<T>(key: string, value: T) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage?.setItem(key, JSON.stringify(value));
  } catch {
    // Keep the in-memory value for this session when browser storage is unavailable.
  }
}

export function getDemoPrivacySettings(): PrivacySettings {
  memoryPrivacySettings = readStoredValue(
    DEMO_PRIVACY_STORAGE_KEY,
    memoryPrivacySettings,
  );
  return memoryPrivacySettings;
}

export function saveDemoPrivacySettings(
  settings: PrivacySettings,
): PrivacySettings {
  memoryPrivacySettings = {
    ...settings,
    updatedAt: DEMO_UPDATED_AT,
  };
  writeStoredValue(DEMO_PRIVACY_STORAGE_KEY, memoryPrivacySettings);
  return memoryPrivacySettings;
}

export function getDemoNotificationPreferences(): NotificationPreferences {
  memoryNotificationPreferences = readStoredValue(
    DEMO_NOTIFICATION_STORAGE_KEY,
    memoryNotificationPreferences,
  );
  return memoryNotificationPreferences;
}

export function saveDemoNotificationPreferences(
  preferences: NotificationPreferences,
): NotificationPreferences {
  memoryNotificationPreferences = {
    ...preferences,
    updatedAt: DEMO_UPDATED_AT,
  };
  writeStoredValue(DEMO_NOTIFICATION_STORAGE_KEY, memoryNotificationPreferences);
  return memoryNotificationPreferences;
}

export function getDemoMatchPreferences(): DemoPreferencesFormState {
  memoryMatchPreferences = readStoredValue(
    DEMO_MATCH_PREFERENCES_STORAGE_KEY,
    memoryMatchPreferences,
  );
  return memoryMatchPreferences;
}

export function saveDemoMatchPreferences(
  preferences: DemoPreferencesFormState,
): DemoPreferencesFormState {
  memoryMatchPreferences = preferences;
  writeStoredValue(DEMO_MATCH_PREFERENCES_STORAGE_KEY, memoryMatchPreferences);
  return memoryMatchPreferences;
}
