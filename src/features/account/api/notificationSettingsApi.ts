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
  return {
    pushEnabled:
      record?.push_enabled ?? DEFAULT_NOTIFICATION_PREFERENCES.pushEnabled,
    newMatches:
      record?.new_matches ?? DEFAULT_NOTIFICATION_PREFERENCES.newMatches,
    newMessages:
      record?.new_messages ?? DEFAULT_NOTIFICATION_PREFERENCES.newMessages,
    newLikes: record?.new_likes ?? DEFAULT_NOTIFICATION_PREFERENCES.newLikes,
    emailUpdates:
      record?.email_updates ?? DEFAULT_NOTIFICATION_PREFERENCES.emailUpdates,
    updatedAt: record?.updated_at,
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
  const { data, error } = await supabase.rpc("save_notification_preferences", {
    p_push_enabled: preferences.pushEnabled,
    p_new_matches: preferences.newMatches,
    p_new_messages: preferences.newMessages,
    p_new_likes: preferences.newLikes,
    p_email_updates: preferences.emailUpdates,
  });

  if (error) {
    throw new Error(getFriendlyNotificationPreferencesError(error));
  }

  const record = Array.isArray(data) ? data[0] : data;
  return mapNotificationRecord(record);
}
