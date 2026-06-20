import { supabase } from "@/src/config/supabase";

export type PrivacySettings = {
  showOnlineStatus: boolean;
  showDistance: boolean;
  readReceipts: boolean;
  profileVisible: boolean;
  updatedAt?: string;
};

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  showOnlineStatus: false,
  showDistance: true,
  readReceipts: false,
  profileVisible: true,
};

type DbPrivacyRecord = {
  show_online_status?: boolean;
  show_distance?: boolean;
  read_receipts?: boolean;
  profile_visible?: boolean;
  updated_at?: string;
};

function mapPrivacyRecord(record: DbPrivacyRecord | null): PrivacySettings {
  return {
    showOnlineStatus:
      record?.show_online_status ?? DEFAULT_PRIVACY_SETTINGS.showOnlineStatus,
    showDistance:
      record?.show_distance ?? DEFAULT_PRIVACY_SETTINGS.showDistance,
    readReceipts:
      record?.read_receipts ?? DEFAULT_PRIVACY_SETTINGS.readReceipts,
    profileVisible:
      record?.profile_visible ?? DEFAULT_PRIVACY_SETTINGS.profileVisible,
    updatedAt: record?.updated_at,
  };
}

function getFriendlyPrivacySettingsError(
  error?: { message?: string } | Error | null,
) {
  const message = error?.message?.trim();

  if (!message) {
    return "Privacy settings were not saved. Check your connection and try again.";
  }

  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("jwt") ||
    lowerMessage.includes("session") ||
    lowerMessage.includes("auth")
  ) {
    return "Please sign in again before changing privacy settings.";
  }

  if (
    lowerMessage.includes("network") ||
    lowerMessage.includes("fetch") ||
    lowerMessage.includes("timeout")
  ) {
    return "Check your connection and try again.";
  }

  return "Privacy settings were not saved. Check your connection and try again.";
}

export async function getPrivacySettings(): Promise<PrivacySettings> {
  const { data, error } = await supabase.rpc("get_privacy_settings");

  if (error) {
    throw new Error(getFriendlyPrivacySettingsError(error));
  }

  const record = Array.isArray(data) ? data[0] : data;
  return mapPrivacyRecord(record);
}

export async function savePrivacySettings(
  settings: PrivacySettings,
): Promise<PrivacySettings> {
  const { data, error } = await supabase.rpc("save_privacy_settings", {
    p_show_online_status: settings.showOnlineStatus,
    p_show_distance: settings.showDistance,
    p_read_receipts: settings.readReceipts,
    p_profile_visible: settings.profileVisible,
  });

  if (error) {
    throw new Error(getFriendlyPrivacySettingsError(error));
  }

  const record = Array.isArray(data) ? data[0] : data;
  return mapPrivacyRecord(record);
}
