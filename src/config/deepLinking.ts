import * as Linking from "expo-linking";
import { router } from "expo-router";
import { Session } from "@supabase/supabase-js";
import { ensureUserProfile } from "../features/profile/api/ensureUserProfile";
import { supabase } from "./supabase";

export const setupDeepLinking = () => {
  Linking.getInitialURL().then((url) => {
    if (url) {
      handleDeepLink(url);
    }
  });

  const subscription = Linking.addEventListener("url", ({ url }) => {
    handleDeepLink(url);
  });

  return () => subscription.remove();
};

function getDeepLinkParam(url: string, key: string) {
  const hashMatch = url.match(/#(.+)/);
  if (hashMatch) {
    const value = new URLSearchParams(hashMatch[1]).get(key);
    if (value) return value;
  }

  const queryMatch = url.match(/\?(.+?)(?:#|$)/);
  if (queryMatch) {
    const value = new URLSearchParams(queryMatch[1]).get(key);
    if (value) return value;
  }

  return null;
}

async function handleDeepLink(url: string) {
  try {
    // ✅ CHECK FOR ERROR FIRST
    if (url.includes("error=")) {
      console.error("Auth deep link returned an error.");

      return; // ✅ STOP HERE
    }

    // ✅ Check for confirmation token (email verification)
    const hasToken = url.includes("token=");
    const hasType = url.includes("type=");

    // ✅ ONLY CHECK FOR ACTUAL TOKENS (not "code=" from error_code)
    const hasAccessToken = url.includes("access_token=");
    const hasRefreshToken = url.includes("refresh_token=");
    const authCode = getDeepLinkParam(url, "code");
    const authType = getDeepLinkParam(url, "type");
    const isPasswordRecovery = authType === "recovery";

    if (authCode) {
      const { data, error } =
        await supabase.auth.exchangeCodeForSession(authCode);

      if (error) {
        console.error("PKCE code exchange failed.");
        return;
      }

      if (data?.session) {
        await handleSessionEstablished(data.session, {
          mode: isPasswordRecovery ? "password-recovery" : "verification",
        });
        return;
      }

      return;
    }

    // Handle email confirmation token (this comes first before access/refresh tokens)
    if (hasToken && hasType) {
      // Wait a bit for Supabase to process the token exchange
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check if we now have a session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        await handleSessionEstablished(session, {
          mode: isPasswordRecovery ? "password-recovery" : "verification",
        });
        return;
      }
    }

    const isAuthCallback = hasAccessToken && hasRefreshToken;

    if (isAuthCallback) {
      try {
        let accessToken = "";
        let refreshToken = "";

        // Extract from hash first
        const hashMatch = url.match(/#(.+)/);
        if (hashMatch) {
          const hashParams = new URLSearchParams(hashMatch[1]);
          accessToken = hashParams.get("access_token") || "";
          refreshToken = hashParams.get("refresh_token") || "";
        }

        // Try query params if not in hash
        if (!accessToken) {
          const queryMatch = url.match(/\?(.+?)(?:#|$)/);
          if (queryMatch) {
            const queryParams = new URLSearchParams(queryMatch[1]);
            accessToken = queryParams.get("access_token") || "";
            refreshToken = queryParams.get("refresh_token") || "";
          }
        }

        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("Auth session setup failed.");
            return;
          }

          if (data?.session) {
            await handleSessionEstablished(data.session, {
              mode: isPasswordRecovery ? "password-recovery" : "verification",
            });
          }
        }
      } catch {
        console.error("Auth callback processing failed.");
      }
    }
  } catch {
    console.error("Deep link processing failed.");
  }
}

async function handleSessionEstablished(
  session: Session,
  options: { mode: "verification" | "password-recovery" } = {
    mode: "verification",
  },
) {
  if (options.mode === "password-recovery") {
    router.replace("/(auth)/reset-password");
    return;
  }

  const metadata = session.user.user_metadata;
  const userId = session.user.id;

  try {
    await ensureUserProfile({
      userId,
      email: session.user.email,
      userType: metadata.user_type,
      firstName: metadata.first_name,
    });
  } catch {
    console.error("Profile setup after deep link failed.");
  }

  await new Promise((resolve) => setTimeout(resolve, 500));

  router.replace({
    pathname: "/(auth)/verification-success",
    params: {
      firstName: metadata?.first_name || "",
      userType: metadata?.user_type || "",
    },
  });
}
