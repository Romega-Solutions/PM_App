import type { UserType } from "./api/authApi";
import { useEffect, useState } from "react";

function getWebHostname(): string {
  if (typeof window === "undefined") return "";
  return window.location.hostname.toLowerCase();
}

function getPublicEnvValue(key: string): string | undefined {
  const processRef = globalThis.process as
    | { env?: Record<string, string | undefined> }
    | undefined;

  return processRef?.env?.[key];
}

export const isBetaDemoModeEnabled = () => {
  const envValue = getPublicEnvValue(
    "EXPO_PUBLIC_BETA_DEMO_MODE",
  )?.toLowerCase();

  if (envValue === "true") return true;
  if (envValue === "false") return false;

  const hostname = getWebHostname();
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.includes("pm-app-beta") ||
    hostname.includes("beta.pinaymate.com")
  );
};

function getPersistedDemoSession(): boolean {
  if (!isBetaDemoModeEnabled() || typeof window === "undefined") return false;

  try {
    const stored = window.localStorage?.getItem("auth-storage");
    if (!stored) return false;

    const parsed = JSON.parse(stored) as {
      state?: { isDemoMode?: boolean };
    };

    return parsed.state?.isDemoMode === true;
  } catch {
    return false;
  }
}

export function useIsDemoSession(): boolean {
  const [isDemoSession, setIsDemoSession] = useState(getPersistedDemoSession);

  useEffect(() => {
    setIsDemoSession(getPersistedDemoSession());
  }, []);

  return isDemoSession;
}

export const BETA_DEMO_COPY = {
  title: "Beta preview",
  message:
    "You are viewing seeded demo data. Real signup, sign in, profile setup, and verification still use Supabase when you choose those paths.",
};

export const BETA_DEMO_PROFILE = {
  id: "beta-demo-profile",
  firstName: "Beta",
  lastName: "Preview",
  age: 28,
  userType: "foreigner" as UserType,
  location: "Metro Manila, Philippines",
  photoUri: null,
  isVerified: false,
};
