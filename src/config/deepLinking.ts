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

    // Sign-in links only work through the PKCE code exchange below. The code
    // can only be exchanged on the device that started the flow (it needs the
    // code verifier stored there), so a link made by someone else cannot sign
    // this device into their account. Never create a session from tokens
    // (access_token / refresh_token) found in a URL: that is session fixation.
    const authCode = getDeepLinkParam(url, "code");
    const authType = getDeepLinkParam(url, "type");
    const isPasswordRecovery = authType === "recovery";

    if (authCode) {
      let existingSession: Session | null = null;

      try {
        const currentSession = await supabase.auth.getSession();
        existingSession = currentSession?.data?.session ?? null;
      } catch {
        existingSession = null;
      }

      if (existingSession) {
        await handleSessionEstablished(existingSession, {
          mode: isPasswordRecovery ? "password-recovery" : "verification",
        });
        return;
      }

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
