export type BasicInfoPayload = {
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  createdAt?: string;
};

let basicInfoStore: BasicInfoPayload | null = null;

/**
 * Save basic info (mock).
 * Simulates network delay and stores data in-memory.
 */
export async function saveBasicInfo(
  payload: BasicInfoPayload
): Promise<{ ok: true; data: BasicInfoPayload }> {
  await new Promise((r) => setTimeout(r, 700)); // simulate latency
  const record = { ...payload, createdAt: new Date().toISOString() };
  basicInfoStore = record;
  return { ok: true, data: record };
}

/** Retrieve saved basic info (mock). */
export async function getBasicInfo(): Promise<BasicInfoPayload | null> {
  await new Promise((r) => setTimeout(r, 250));
  return basicInfoStore;
}

/** Clear store (useful for testing) */
export async function clearBasicInfo(): Promise<void> {
  basicInfoStore = null;
}

export const accountApi = {
  saveBasicInfo,
  getBasicInfo,
  clearBasicInfo,
};

export default accountApi;
