import type { UserType } from "./api/authApi";

function getWebHostname(): string {
  if (typeof window === "undefined") return "";
  return window.location.hostname.toLowerCase();
}

export const isBetaDemoModeEnabled = () => {
  const envValue = process.env.EXPO_PUBLIC_BETA_DEMO_MODE?.toLowerCase();

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
