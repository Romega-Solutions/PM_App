// ...existing code...
export type BasicInfoPayload = {
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  createdAt?: string;
};

let basicInfoStore: BasicInfoPayload | null = null;

export async function saveBasicInfo(
  payload: BasicInfoPayload
): Promise<{ ok: true; data: BasicInfoPayload }> {
  await new Promise((r) => setTimeout(r, 700));
  const record = { ...payload, createdAt: new Date().toISOString() };
  basicInfoStore = record;
  return { ok: true, data: record };
}

export async function getBasicInfo(): Promise<BasicInfoPayload | null> {
  await new Promise((r) => setTimeout(r, 250));
  return basicInfoStore;
}

export async function clearBasicInfo(): Promise<void> {
  basicInfoStore = null;
}

/* ----------------- profile photos ----------------- */
let profilePhotosStore: string[] = [];

export async function saveProfilePhoto(
  uri: string
): Promise<{ ok: true; data: { photos: string[] } }> {
  await new Promise((r) => setTimeout(r, 600));
  profilePhotosStore = [uri, ...profilePhotosStore].slice(0, 6);
  return { ok: true, data: { photos: profilePhotosStore } };
}

export async function getProfilePhotos(): Promise<string[]> {
  await new Promise((r) => setTimeout(r, 250));
  return profilePhotosStore;
}

export async function removeProfilePhoto(
  uri: string
): Promise<{ ok: true; data: string[] }> {
  await new Promise((r) => setTimeout(r, 200));
  profilePhotosStore = profilePhotosStore.filter((p) => p !== uri);
  return { ok: true, data: profilePhotosStore };
}

/* ----------------- location ----------------- */
export type SavedLocation = {
  locationType: "current" | "manual";
  locationName: string;
  coordinates?: { lat: number; lng: number } | null;
  timestamp: string;
};

let locationStore: SavedLocation | null = null;

export async function saveLocation(
  payload: SavedLocation
): Promise<{ ok: true; data: SavedLocation }> {
  await new Promise((r) => setTimeout(r, 400));
  const record = { ...payload, timestamp: new Date().toISOString() };
  locationStore = record;
  return { ok: true, data: record };
}

export async function getLocation(): Promise<SavedLocation | null> {
  await new Promise((r) => setTimeout(r, 200));
  return locationStore;
}

export async function clearLocation(): Promise<void> {
  locationStore = null;
}

/* ----------------- verification ----------------- */
export type VerificationData = {
  selfieUri: string;
  documentUri: string;
  extractedFirstName?: string;
  extractedLastName?: string;
  extractedAge?: number;
  isVerified: boolean;
  verifiedAt?: string;
  mismatchReasons?: string[];
};

let verificationStore: VerificationData | null = null;

export function compareVerificationData(
  extracted: {
    firstName?: string;
    lastName?: string;
    age?: number;
  },
  stored: BasicInfoPayload | null
): { match: boolean; reasons: string[] } {
  if (!stored)
    return { match: false, reasons: ["No basic info found in store"] };

  const reasons: string[] = [];
  const normalize = (s: string) => s.trim().toLowerCase();

  if (
    extracted.firstName &&
    normalize(extracted.firstName) !== normalize(stored.firstName)
  ) {
    reasons.push(
      `First name mismatch: "${extracted.firstName}" vs "${stored.firstName}"`
    );
  }

  if (
    extracted.lastName &&
    normalize(extracted.lastName) !== normalize(stored.lastName)
  ) {
    reasons.push(
      `Last name mismatch: "${extracted.lastName}" vs "${stored.lastName}"`
    );
  }

  if (extracted.age !== undefined && extracted.age !== stored.age) {
    reasons.push(`Age mismatch: ${extracted.age} vs ${stored.age}`);
  }

  return { match: reasons.length === 0, reasons };
}

export async function saveVerification(
  payload: VerificationData
): Promise<{ ok: true; data: VerificationData }> {
  await new Promise((r) => setTimeout(r, 600));
  const record = {
    ...payload,
    verifiedAt: payload.isVerified ? new Date().toISOString() : undefined,
  };
  verificationStore = record;
  return { ok: true, data: record };
}

export async function getVerification(): Promise<VerificationData | null> {
  await new Promise((r) => setTimeout(r, 200));
  return verificationStore;
}

export async function clearVerification(): Promise<void> {
  verificationStore = null;
}

/* ----------------- NEW: preferences ----------------- */

export type PreferencesPayload = {
  interestedIn: string; // "women" | "men" | "everyone"
  ageMin: number;
  ageMax: number;
  maxDistanceKm: number;
  relationshipGoal: string; // "long_term" | "marriage" | "casual" | "friendship" | "not_sure"
  createdAt?: string;
};

let preferencesStore: PreferencesPayload | null = null;

export async function savePreferences(
  payload: PreferencesPayload
): Promise<{ ok: true; data: PreferencesPayload }> {
  await new Promise((r) => setTimeout(r, 500));
  const record = { ...payload, createdAt: new Date().toISOString() };
  preferencesStore = record;
  return { ok: true, data: record };
}

export async function getPreferences(): Promise<PreferencesPayload | null> {
  await new Promise((r) => setTimeout(r, 200));
  return preferencesStore;
}

export async function clearPreferences(): Promise<void> {
  preferencesStore = null;
}

/* ----------------------------------------------------------------------- */

export const accountApi = {
  saveBasicInfo,
  getBasicInfo,
  clearBasicInfo,
  saveProfilePhoto,
  getProfilePhotos,
  removeProfilePhoto,
  saveLocation,
  getLocation,
  clearLocation,
  saveVerification,
  getVerification,
  clearVerification,
  compareVerificationData,
  // new
  savePreferences,
  getPreferences,
  clearPreferences,
};

export default accountApi;
