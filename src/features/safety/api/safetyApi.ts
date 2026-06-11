import { supabase } from "@/src/config/supabase";

export type SubmitUserReportInput = {
  reportedUserId: string;
  reason: string;
  details?: string;
  conversationId?: string;
  source?: "chat" | "profile" | "likes" | "discovery" | "app";
};

const MAX_REPORT_REASON_LENGTH = 120;
const MAX_REPORT_DETAILS_LENGTH = 800;
const REPORT_SOURCES = new Set([
  "chat",
  "profile",
  "likes",
  "discovery",
  "app",
]);

async function getAuthenticatedUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error("Please sign in to continue.");
  }

  return user.id;
}

function getFriendlySafetyError(
  fallback: string,
  error?: { message?: string } | Error | null,
): string {
  const message = error?.message?.trim();

  if (!message) {
    return fallback;
  }

  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("network") ||
    lowerMessage.includes("fetch") ||
    lowerMessage.includes("timeout")
  ) {
    return "Check your connection and try again.";
  }

  if (
    lowerMessage.includes("jwt") ||
    lowerMessage.includes("session") ||
    lowerMessage.includes("auth")
  ) {
    return "Please sign in again before continuing.";
  }

  return fallback;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function normalizeSafetyId(value: string, emptyMessage: string): {
  value?: string;
  error?: string;
} {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return { error: emptyMessage };
  }

  if (!isUuid(trimmedValue)) {
    return {
      error: "This member could not be identified. Go back and try again.",
    };
  }

  return { value: trimmedValue };
}

function normalizeConversationId(value?: string): string | null {
  if (!value?.trim()) return null;

  const trimmedValue = value.trim();

  if (!isUuid(trimmedValue)) {
    throw new Error("Conversation context could not be verified.");
  }

  return trimmedValue;
}

function normalizeReportSource(
  source: SubmitUserReportInput["source"],
): NonNullable<SubmitUserReportInput["source"]> {
  if (source && REPORT_SOURCES.has(source)) {
    return source;
  }

  return "app";
}

function normalizeReportReason(reason: string): string {
  return reason.trim().slice(0, MAX_REPORT_REASON_LENGTH);
}

function normalizeReportDetails(details?: string): string {
  return (details || "").trim().slice(0, MAX_REPORT_DETAILS_LENGTH);
}

export async function submitUserReport({
  reportedUserId,
  reason,
  details = "",
  conversationId,
  source = "app",
}: SubmitUserReportInput): Promise<{ success: boolean; error?: string }> {
  try {
    const reporterId = await getAuthenticatedUserId();
    const normalizedReportedUser = normalizeSafetyId(
      reportedUserId,
      "Choose a different member to report.",
    );

    if (normalizedReportedUser.error) {
      return { success: false, error: normalizedReportedUser.error };
    }

    const normalizedReportedUserId = normalizedReportedUser.value;

    if (!normalizedReportedUserId || reporterId === normalizedReportedUserId) {
      return { success: false, error: "Choose a different member to report." };
    }

    const normalizedReason = normalizeReportReason(reason);

    if (!normalizedReason) {
      return { success: false, error: "Choose a reason for the report." };
    }

    const { error } = await supabase.rpc("submit_user_report", {
      p_reported_user_id: normalizedReportedUserId,
      p_reason: normalizedReason,
      p_details: normalizeReportDetails(details),
      p_conversation_id: normalizeConversationId(conversationId),
      p_source: normalizeReportSource(source),
    });

    if (error) {
      return {
        success: false,
        error: getFriendlySafetyError(
          "The report was not sent. Check your connection and try again.",
          error,
        ),
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? getFriendlySafetyError(
              "The report was not sent. Check your connection and try again.",
              error,
            )
          : "The report was not sent. Check your connection and try again.",
    };
  }
}

export async function blockUser(
  blockedUserId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const normalizedBlockedUser = normalizeSafetyId(
      blockedUserId,
      "Choose a member to block.",
    );

    if (normalizedBlockedUser.error) {
      return { success: false, error: normalizedBlockedUser.error };
    }

    const normalizedBlockedUserId = normalizedBlockedUser.value;

    if (!normalizedBlockedUserId) {
      return { success: false, error: "Choose a member to block." };
    }

    await getAuthenticatedUserId();

    const { error } = await supabase.rpc("block_user", {
      p_blocked_user_id: normalizedBlockedUserId,
    });

    if (error) {
      return {
        success: false,
        error: getFriendlySafetyError(
          "Block failed. Check your connection and try again.",
          error,
        ),
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? getFriendlySafetyError(
              "Block failed. Check your connection and try again.",
              error,
            )
          : "Block failed. Check your connection and try again.",
    };
  }
}

export async function unmatchUser(
  otherUserId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const normalizedOtherUser = normalizeSafetyId(
      otherUserId,
      "Choose a member to unmatch.",
    );

    if (normalizedOtherUser.error) {
      return { success: false, error: normalizedOtherUser.error };
    }

    const normalizedOtherUserId = normalizedOtherUser.value;

    if (!normalizedOtherUserId) {
      return { success: false, error: "Choose a member to unmatch." };
    }

    await getAuthenticatedUserId();

    const { error } = await supabase.rpc("unmatch_user", {
      p_other_user_id: normalizedOtherUserId,
    });

    if (error) {
      return {
        success: false,
        error: getFriendlySafetyError(
          "Unmatch failed. Check your connection and try again.",
          error,
        ),
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? getFriendlySafetyError(
              "Unmatch failed. Check your connection and try again.",
              error,
            )
          : "Unmatch failed. Check your connection and try again.",
    };
  }
}
