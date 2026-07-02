import { getBetaDemoProfile } from "@/src/features/auth/demoMode";
import type { UserType } from "@/src/features/auth/api/authApi";
import type { DemoPreviewUserType } from "@/src/features/auth/demoMode";
import type {
  ProfileData as ApiProfileData,
  UpdateProfileData,
} from "../api/profileApi";

const DEMO_PROFILE_STORAGE_KEY = "pinaymate-demo-profile";

export const DEMO_PROFILE_PHOTO_URI =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=720&q=80";

type DemoProfileOverride = Partial<
  Pick<
    ApiProfileData,
    | "first_name"
    | "last_name"
    | "age"
    | "occupation"
    | "education"
    | "location_name"
    | "photos"
  >
>;

let memoryOverride: DemoProfileOverride = {};

function readOverride(): DemoProfileOverride {
  if (typeof window === "undefined") return memoryOverride;

  try {
    const stored = window.localStorage?.getItem(DEMO_PROFILE_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as DemoProfileOverride) : memoryOverride;
  } catch {
    return memoryOverride;
  }
}

function writeOverride(next: DemoProfileOverride) {
  memoryOverride = next;

  if (typeof window === "undefined") return;

  try {
    window.localStorage?.setItem(DEMO_PROFILE_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Keep the in-memory value for this session when browser storage is unavailable.
  }
}

export function saveDemoProfileUpdates(data: UpdateProfileData) {
  writeOverride({
    ...readOverride(),
    ...data,
  });
}

export function saveDemoProfilePhotos(photos: string[]) {
  writeOverride({
    ...readOverride(),
    photos,
  });
}

export function clearDemoProfileOverrides() {
  writeOverride({});
}

export function getDemoProfileApiData(
  userType?: DemoPreviewUserType,
): ApiProfileData {
  const override = readOverride();
  const demoProfile = getBetaDemoProfile(userType);
  const now = new Date().toISOString();

  return {
    id: demoProfile.id,
    email: "beta.preview@pinaymate.demo",
    first_name: override.first_name ?? demoProfile.firstName,
    last_name: override.last_name ?? demoProfile.lastName,
    age: override.age ?? demoProfile.age,
    user_type: demoProfile.userType,
    occupation: override.occupation ?? "Product demo reviewer",
    education: override.education ?? "Demo University",
    location_name: override.location_name ?? demoProfile.location,
    photos:
      override.photos ??
      (demoProfile.photoUri ? [demoProfile.photoUri] : []),
    is_verified: demoProfile.isVerified,
    created_at: now,
    updated_at: now,
  };
}

export function getDemoProfileScreenData(userType?: DemoPreviewUserType) {
  const profile = getDemoProfileApiData(userType);

  return {
    firstName: profile.first_name,
    lastName: profile.last_name,
    age: profile.age ?? null,
    userType: (profile.user_type ??
      getBetaDemoProfile(userType).userType) as UserType,
    location: profile.location_name ?? null,
    photoUri: profile.photos?.[0] ?? null,
    isVerified: profile.is_verified ?? false,
  };
}
