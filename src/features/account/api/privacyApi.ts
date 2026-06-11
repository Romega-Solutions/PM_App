import { supabase } from "@/src/config/supabase";

export type AccountDeletionRequestResult = {
  success: boolean;
  status?: "pending" | "reviewing" | "completed" | "cancelled";
  requestedAt?: string;
  error?: string;
};

const DEFAULT_DELETION_ERROR =
  "Your deletion request was not sent. Check your connection and try again.";

function getFriendlyPrivacyError(error?: { message?: string } | Error | null) {
  const message = error?.message?.trim();

  if (!message) {
    return DEFAULT_DELETION_ERROR;
  }

  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("jwt") ||
    lowerMessage.includes("session") ||
    lowerMessage.includes("auth")
  ) {
    return "Please sign in again before requesting account deletion.";
  }

  if (
    lowerMessage.includes("network") ||
    lowerMessage.includes("fetch") ||
    lowerMessage.includes("timeout")
  ) {
    return DEFAULT_DELETION_ERROR;
  }

  return DEFAULT_DELETION_ERROR;
}

export async function requestAccountDeletion(
  reason = "User requested account deletion from privacy settings",
): Promise<AccountDeletionRequestResult> {
  try {
    const { data, error } = await supabase.rpc("request_account_deletion", {
      p_reason: reason.trim(),
      p_source: "privacy_settings",
    });

    if (error) {
      return {
        success: false,
        error: getFriendlyPrivacyError(error),
      };
    }

    const record = Array.isArray(data) ? data[0] : data;

    return {
      success: true,
      status: record?.status ?? "pending",
      requestedAt: record?.requested_at,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? getFriendlyPrivacyError(error)
          : DEFAULT_DELETION_ERROR,
    };
  }
}
