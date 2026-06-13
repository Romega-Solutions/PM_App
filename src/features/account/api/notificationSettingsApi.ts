import { supabase } from "@/src/config/supabase";

export type NotificationPreferences = {
  pushEnabled: boolean;
  newMatches: boolean;
  newMessages: boolean;
  newLikes: boolean;
  emailUpdates: boolean;
  updatedAt?: string;
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  pushEnabled: false,
  newMatches: false,
  newMessages: false,
  newLikes: false,
  emailUpdates: false,
};

const NOTIFICATION_SETTINGS_ERROR =
  "Notification preferences were not saved. Check your connection and try again.";

function mapNotificationRecord(record: any): NotificationPreferences {
  const pushEnabled =
    record?.push_enabled ?? DEFAULT_NOTIFICATION_PREFERENCES.pushEnabled;

  return {
    pushEnabled,
    newMatches: pushEnabled
      ? record?.new_matches ?? DEFAULT_NOTIFICATION_PREFERENCES.newMatches
      : false,
    newMessages: pushEnabled
      ? record?.new_messages ?? DEFAULT_NOTIFICATION_PREFERENCES.newMessages
      : false,
    newLikes: pushEnabled
      ? record?.new_likes ?? DEFAULT_NOTIFICATION_PREFERENCES.newLikes
      : false,
    emailUpdates:
      record?.email_updates ?? DEFAULT_NOTIFICATION_PREFERENCES.emailUpdates,
    updatedAt: record?.updated_at,
  };
}

function normalizeNotificationPreferences(
  preferences: NotificationPreferences,
): NotificationPreferences {
  return {
    pushEnabled: Boolean(preferences.pushEnabled),
    newMatches: Boolean(preferences.pushEnabled && preferences.newMatches),
    newMessages: Boolean(preferences.pushEnabled && preferences.newMessages),
    newLikes: Boolean(preferences.pushEnabled && preferences.newLikes),
    emailUpdates: Boolean(preferences.emailUpdates),
  };
}

function getFriendlyNotificationPreferencesError(
  error?: { message?: string } | Error | null,
) {
  const message = error?.message?.trim();

  if (!message) {
    return NOTIFICATION_SETTINGS_ERROR;
  }

  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("jwt") ||
    lowerMessage.includes("session") ||
    lowerMessage.includes("auth")
  ) {
    return "Please sign in again before changing notification preferences.";
  }

  if (
    lowerMessage.includes("network") ||
    lowerMessage.includes("fetch") ||
    lowerMessage.includes("timeout")
  ) {
    return "Check your connection and try again.";
  }

  return NOTIFICATION_SETTINGS_ERROR;
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const { data, error } = await supabase.rpc("get_notification_preferences");

  if (error) {
    throw new Error(getFriendlyNotificationPreferencesError(error));
  }

  const record = Array.isArray(data) ? data[0] : data;
  return mapNotificationRecord(record);
}

export async function saveNotificationPreferences(
  preferences: NotificationPreferences,
): Promise<NotificationPreferences> {
  const normalizedPreferences = normalizeNotificationPreferences(preferences);

  const { data, error } = await supabase.rpc("save_notification_preferences", {
    p_push_enabled: normalizedPreferences.pushEnabled,
    p_new_matches: normalizedPreferences.newMatches,
    p_new_messages: normalizedPreferences.newMessages,
    p_new_likes: normalizedPreferences.newLikes,
    p_email_updates: normalizedPreferences.emailUpdates,
  });

  if (error) {
    throw new Error(getFriendlyNotificationPreferencesError(error));
  }

  const record = Array.isArray(data) ? data[0] : data;
  return mapNotificationRecord(record);
}
