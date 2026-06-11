import { createClient } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import "react-native-url-polyfill/auto";
import { authStorage } from "./authStorage";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

const verificationRedirectUrl = Linking.createURL(
  "/(auth)/verification-success"
);
const passwordResetRedirectUrl = Linking.createURL("/(auth)/reset-password");

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // ✅ Important for deep link handling
    flowType: "pkce",
  },
});

// Export the redirect URL for use in auth flows
export const getRedirectUrl = () => verificationRedirectUrl;
export const getPasswordResetRedirectUrl = () => passwordResetRedirectUrl;
