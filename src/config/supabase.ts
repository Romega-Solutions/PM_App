import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import "react-native-url-polyfill/auto";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

// ✅ Use Linking.createURL for proper deep link handling in both dev and production
const redirectUrl = Linking.createURL("/(auth)/verification-success");

if (__DEV__) console.log("🔗 Supabase redirect URL:", redirectUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // ✅ Important for deep link handling
    flowType: "pkce",
  },
});

// Export the redirect URL for use in auth flows
export const getRedirectUrl = () => redirectUrl;
