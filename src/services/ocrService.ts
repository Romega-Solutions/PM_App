import { supabase } from "@/src/config/supabase";
import * as FileSystem from "expo-file-system/legacy";

export type OCRResult = {
  firstName?: string;
  lastName?: string;
  birthDate?: string; // format: YYYY-MM-DD or raw extracted
  fullText: string;
};

const MAX_OCR_DOCUMENT_BYTES = 6 * 1024 * 1024;

function asText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getImageExtension(uri: string): string {
  const cleanUri = uri.split("?")[0].split("#")[0];
  const extension = cleanUri.split(".").pop()?.toLowerCase();

  if (!extension || extension === cleanUri || extension.length > 5) {
    return "jpg";
  }

  if (["jpg", "jpeg", "png", "webp", "heic"].includes(extension)) {
    return extension;
  }

  return "jpg";
}

function getImageContentType(extension: string): string {
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";

  return `image/${extension}`;
}

async function assertReadableOcrDocument(uri: string): Promise<void> {
  const fileInfo = await FileSystem.getInfoAsync(uri);

  if (
    !fileInfo.exists ||
    (typeof fileInfo.size === "number" &&
      fileInfo.size > MAX_OCR_DOCUMENT_BYTES)
  ) {
    throw new Error("OCR could not read this document. Try a clearer photo.");
  }
}

function getOcrEndpoint(): string | undefined {
  if (process.env.EXPO_PUBLIC_OCR_ENDPOINT) {
    return process.env.EXPO_PUBLIC_OCR_ENDPOINT;
  }

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return undefined;

  try {
    const url = new URL(supabaseUrl);
    const projectRef = url.hostname.split(".")[0];
    if (!projectRef) return undefined;
    return `https://${projectRef}.functions.supabase.co/ocr`;
  } catch {
    return undefined;
  }
}

function isSupabaseFunctionsEndpoint(endpoint: string): boolean {
  try {
    const url = new URL(endpoint);
    return (
      url.hostname.endsWith(".functions.supabase.co") ||
      url.pathname.includes("/functions/v1/")
    );
  } catch {
    return false;
  }
}

function parseOcrPayload(payload: unknown): OCRResult {
  const data =
    typeof payload === "object" && payload !== null && "result" in payload
      ? (payload as { result?: unknown }).result
      : payload;

  if (typeof data !== "object" || data === null) {
    throw new Error("OCR service returned an invalid response.");
  }

  const record = data as Record<string, unknown>;
  const fullText =
    asText(record.fullText) ||
    asText(record.text) ||
    asText(record.rawText) ||
    "";

  if (!fullText) {
    throw new Error("OCR service did not return extracted text.");
  }

  return {
    firstName: asText(record.firstName),
    lastName: asText(record.lastName),
    birthDate: asText(record.birthDate) || asText(record.dateOfBirth),
    fullText,
  };
}

function getFriendlyOcrError(status: number): string {
  if (status === 401 || status === 403) {
    return "Sign in again before verifying IDs.";
  }

  if (status === 413 || status === 422) {
    return "OCR could not read this document. Try a clearer photo.";
  }

  if (status === 429) {
    return "Too many OCR attempts. Please wait before trying another document.";
  }

  if (status >= 500) {
    return "Document scan did not complete. Please try again.";
  }

  return "Document OCR failed. Try again with a clearer photo.";
}

export async function extractTextFromImage(uri: string): Promise<OCRResult> {
  const ocrEndpoint = getOcrEndpoint();

  if (!ocrEndpoint) {
    throw new Error(
      "Document OCR is not configured. Set EXPO_PUBLIC_OCR_ENDPOINT before verifying IDs."
    );
  }

  await assertReadableOcrDocument(uri);

  const filename = uri.split("/").pop() || "verification-document.jpg";
  const extension = getImageExtension(filename);
  const formData = new FormData();
  formData.append("document", {
    uri,
    name: filename,
    type: getImageContentType(extension),
  } as unknown as Blob);

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Sign in before verifying IDs.");
  }

  headers.Authorization = `Bearer ${session.access_token}`;

  if (isSupabaseFunctionsEndpoint(ocrEndpoint)) {
    if (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
      headers.apikey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    }
  }

  const response = await fetch(ocrEndpoint, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    await response.text().catch(() => "");
    throw new Error(getFriendlyOcrError(response.status));
  }

  return parseOcrPayload(await response.json());
}

/**
 * Calculate age from birthdate string (YYYY-MM-DD)
 */
export function calculateAge(birthDateString: string): number | null {
  const match = birthDateString.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const [, year, month, day] = match;
  const birthDate = new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10)
  );
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
