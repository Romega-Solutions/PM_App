import * as Linking from "expo-linking";
import { router } from "expo-router";
import { supabase } from "./supabase";

export const setupDeepLinking = () => {
  console.log("🔗 Setting up deep link handling...");

  Linking.getInitialURL().then((url) => {
    if (url) {
      console.log("📲 Initial URL:", url);
      handleDeepLink(url);
    }
  });

  const subscription = Linking.addEventListener("url", ({ url }) => {
    console.log("📲 Deep link received:", url);
    handleDeepLink(url);
  });

  return () => subscription.remove();
};

async function handleDeepLink(url: string) {
  try {
    console.log("🔍 Processing deep link:", url);
    console.log("🔍 Full URL:", url);
    console.log("🔍 URL length:", url.length);
    console.log("🔍 Has #:", url.includes("#"));
    console.log("🔍 Has ?:", url.includes("?"));

    // ✅ CHECK FOR ERROR FIRST
    if (url.includes("error=")) {
      const errorMatch = url.match(/error_description=([^&#]+)/);
      const errorDesc = errorMatch
        ? decodeURIComponent(errorMatch[1].replace(/\+/g, " "))
        : "Unknown error";

      console.error("❌ Auth error in URL:", errorDesc);

      if (url.includes("otp_expired")) {
        console.log("⏰ OTP EXPIRED - Email link has expired!");
      }

      return; // ✅ STOP HERE
    }

    // ✅ Check for confirmation token (email verification)
    const hasToken = url.includes("token=");
    const hasType = url.includes("type=");

    // ✅ ONLY CHECK FOR ACTUAL TOKENS (not "code=" from error_code)
    const hasAccessToken = url.includes("access_token=");
    const hasRefreshToken = url.includes("refresh_token=");

    console.log("🔍 Auth indicators:", {
      hasToken,
      hasType,
      hasAccessToken,
      hasRefreshToken,
    });

    // Handle email confirmation token (this comes first before access/refresh tokens)
    if (hasToken && hasType) {
      console.log("📧 Email confirmation link detected!");
      console.log(
        "⚠️ NOTE: Supabase should automatically exchange this for session tokens"
      );
      console.log("⏳ Waiting for token exchange...");

      // Wait a bit for Supabase to process the token exchange
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check if we now have a session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        console.log("✅ Session found after token exchange!");
        await handleSessionEstablished(session);
        return;
      } else {
        console.log(
          "⚠️ No session after token exchange - checking URL for tokens..."
        );
      }
    }

    const isAuthCallback = hasAccessToken && hasRefreshToken;

    if (isAuthCallback) {
      console.log("🔐 Auth callback detected! Processing...");

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

        console.log("🔑 Tokens extracted:", {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
        });

        if (accessToken && refreshToken) {
          console.log("🔐 Setting session...");

          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("❌ Session setup failed:", error.message);
            return;
          }

          if (data?.session) {
            console.log("✅ Session established!");
            await handleSessionEstablished(data.session);
          }
        } else {
          console.log("⚠️ No valid tokens in URL");
        }
      } catch (error) {
        console.error("❌ Error processing auth:", error);
      }
    } else {
      console.log("ℹ️ Not an auth callback");
    }
  } catch (error) {
    console.error("❌ Deep link error:", error);
  }
}

async function handleSessionEstablished(session: any) {
  console.log("✅ Session established!");
  console.log("👤 User ID:", session.user.id);
  console.log("👤 Metadata:", session.user.user_metadata);

  const metadata = session.user.user_metadata;
  const userId = session.user.id;

  try {
    console.log("📦 Checking profile...");

    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("id, user_type, first_name")
      .eq("id", userId)
      .single();

    if (fetchError && fetchError.code === "PGRST116") {
      console.log("⚠️ Creating profile...");

      const userTypeValue = metadata.user_type || "foreigner";
      const genderValue = userTypeValue === "filipina" ? "female" : "male";

      await supabase.from("profiles").insert({
        id: userId,
        email: session.user.email,
        first_name: metadata.first_name || "",
        user_type: userTypeValue,
        gender: genderValue,
      });

      console.log("✅ Profile created!");
    } else if (existingProfile) {
      console.log("✅ Profile exists");
    }
  } catch (error) {
    console.error("❌ Profile error:", error);
  }

  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log("🚀 Navigating...");

  router.replace({
    pathname: "/(auth)/verification-success",
    params: {
      firstName: metadata?.first_name || "",
      userType: metadata?.user_type || "",
    },
  });
}
