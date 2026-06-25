import type { UserType } from "./api/authApi";
import { useEffect, useState } from "react";
import { getPublicEnvValue } from "@/src/config/publicEnv";

export type DemoPreviewUserType = Extract<UserType, "filipina" | "foreigner">;

function getWebHostname(): string {
  if (typeof window === "undefined") return "";
  return window.location.hostname.toLowerCase();
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

export function getPersistedDemoUserType(): DemoPreviewUserType {
  if (!isBetaDemoModeEnabled() || typeof window === "undefined") {
    return "foreigner";
  }

  try {
    const stored = window.localStorage?.getItem("auth-storage");
    if (!stored) return "foreigner";

    const parsed = JSON.parse(stored) as {
      state?: { demoUserType?: string };
    };

    return parsed.state?.demoUserType === "filipina"
      ? "filipina"
      : "foreigner";
  } catch {
    return "foreigner";
  }
}

export function useIsDemoSession(): boolean {
  const [isDemoSession, setIsDemoSession] = useState(getPersistedDemoSession);

  useEffect(() => {
    setIsDemoSession(getPersistedDemoSession());
  }, []);

  return isDemoSession;
}

export function useDemoPreviewUserType(): DemoPreviewUserType {
  const [demoUserType, setDemoUserType] = useState(getPersistedDemoUserType);

  useEffect(() => {
    setDemoUserType(getPersistedDemoUserType());
  }, []);

  return demoUserType;
}

export const BETA_DEMO_COPY = {
  title: "Beta preview",
  message:
    "You are viewing seeded demo data. Real signup, sign in, profile setup, and verification still use Supabase when you choose those paths.",
};

export const BETA_DEMO_PROFILES: Record<DemoPreviewUserType, {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  userType: DemoPreviewUserType;
  location: string;
  photoUri: string | null;
  isVerified: boolean;
}> = {
  foreigner: {
    id: "beta-demo-foreigner-profile",
    firstName: "Daniel",
    lastName: "Preview",
    age: 34,
    userType: "foreigner",
    location: "Austin, United States",
    photoUri: null,
    isVerified: false,
  },
  filipina: {
    id: "beta-demo-filipina-profile",
    firstName: "Ana",
    lastName: "Preview",
    age: 27,
    userType: "filipina",
    location: "Metro Manila, Philippines",
    photoUri: null,
    isVerified: false,
  },
};

export function getBetaDemoProfile(userType = getPersistedDemoUserType()) {
  return BETA_DEMO_PROFILES[userType];
}

export const BETA_DEMO_PROFILE = BETA_DEMO_PROFILES.foreigner;
