import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";
import Constants from 'expo-constants';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // Enable URL detection
    flowType: "pkce",
  },
});

// Helper to get the correct redirect URL based on environment
export const getRedirectUrl = () => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  
  if (__DEV__ && debuggerHost) {
    // Development with Expo Go - use your local IP
    const scheme = 'exp';
    const host = debuggerHost.split(':')[0];
    const port = debuggerHost.split(':')[1] || '8081';
    return `${scheme}://${host}:${port}/--/(auth)/verification-success`;
  } else {
    // Production builds
    return `pinaymate://auth/verification-success`;
  }
};

console.log('🔗 Supabase redirect URL:', getRedirectUrl());