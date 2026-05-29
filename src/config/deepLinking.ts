import * as Linking from "expo-linking";
import { router } from "expo-router";
import { supabase } from "./supabase";

// Dev-only logger — never logs URLs, tokens, emails, IDs, or user metadata.
const log = (...args: unknown[]) => {
  if (__DEV__) console.log(...args);
};

export const setupDeepLinking = () => {
  log("🔗 Setting up deep link handling...");

  Linking.getInitialURL().then((url) => {
    if (url) {
      log("📲 Initial deep link received");
      handleDeepLink(url);
    }
  });

  const subscription = Linking.addEventListener("url", ({ url }) => {
    log("📲 Deep link received");
    handleDeepLink(url);
  });

  return () => subscription.remove();
};

async function handleDeepLink(url: string) {
  try {
    log("🔍 Processing deep link");

    // ✅ CHECK FOR ERROR FIRST
    if (url.includes("error=")) {
      const errorMatch = url.match(/error_description=([^&#]+)/);
      const errorDesc = errorMatch
        ? decodeURIComponent(errorMatch[1].replace(/\+/g, " "))
        : "Unknown error";

      console.error("❌ Auth error in deep link:", errorDesc);

      if (url.includes("otp_expired")) {
        log("⏰ OTP EXPIRED - Email link has expired!");
      }

      return; // ✅ STOP HERE
    }

    // ✅ Check for confirmation token (email verification)
    const hasToken = url.includes("token=");
    const hasType = url.includes("type=");

    // ✅ ONLY CHECK FOR ACTUAL TOKENS (not "code=" from error_code)
    const hasAccessToken = url.includes("access_token=");
    const hasRefreshToken = url.includes("refresh_token=");

    log("🔍 Auth indicators:", {
      hasToken,
      hasType,
      hasAccessToken,
      hasRefreshToken,
    });

    // Handle email confirmation token (this comes first before access/refresh tokens)
    if (hasToken && hasType) {
      log("📧 Email confirmation link detected, waiting for token exchange...");

      // Wait a bit for Supabase to process the token exchange
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check if we now have a session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        log("✅ Session found after token exchange");
        await handleSessionEstablished(session);
        return;
      } else {
        log("⚠️ No session after token exchange - checking URL for tokens...");
      }
    }

    const isAuthCallback = hasAccessToken && hasRefreshToken;

    if (isAuthCallback) {
      log("🔐 Auth callback detected, processing...");

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

        log("🔑 Tokens extracted:", {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
        });

        if (accessToken && refreshToken) {
          log("🔐 Setting session...");

          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("❌ Session setup failed:", error.message);
            return;
          }

          if (data?.session) {
            log("✅ Session established");
            await handleSessionEstablished(data.session);
          }
        } else {
          log("⚠️ No valid tokens in URL");
        }
      } catch {
        console.error("❌ Error processing auth deep link");
      }
    } else {
      log("ℹ️ Not an auth callback");
    }
  } catch {
    console.error("❌ Deep link error");
  }
}

async function handleSessionEstablished(session: any) {
  log("✅ Session established, resolving profile...");

  const metadata = session.user.user_metadata;
  const userId = session.user.id;

  try {
    log("📦 Checking profile...");

    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("id, user_type, first_name")
      .eq("id", userId)
      .single();

    if (fetchError && fetchError.code === "PGRST116") {
      log("⚠️ Creating profile...");

      const userTypeValue = metadata.user_type || "foreigner";
      const genderValue = userTypeValue === "filipina" ? "female" : "male";

      await supabase.from("profiles").insert({
        id: userId,
        email: session.user.email,
        first_name: metadata.first_name || "",
        user_type: userTypeValue,
        gender: genderValue,
      });

      log("✅ Profile created");
    } else if (existingProfile) {
      log("✅ Profile exists");
    }
  } catch {
    console.error("❌ Profile resolution error");
  }

  await new Promise((resolve) => setTimeout(resolve, 500));

  log("🚀 Navigating...");

  router.replace({
    pathname: "/(auth)/verification-success",
    params: {
      firstName: metadata?.first_name || "",
      userType: metadata?.user_type || "",
    },
  });
}
