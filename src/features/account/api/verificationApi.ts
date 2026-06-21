/**
 * Verification API
 *
 * Handles identity verification (selfie + document upload, OCR extraction, verification status).
 * Single Responsibility: Verification operations only.
 */

import { supabase } from "@/src/config/supabase";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";
import { BasicInfoPayload } from "./basicInfoApi";

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

const VERIFICATION_BUCKET = "verification-docs";
const VERIFICATION_SIGN_IN_ERROR =
  "Please sign in before submitting verification.";
const VERIFICATION_UPLOAD_ERROR =
  "Verification upload failed. Check your files and connection, then try again.";
const VERIFICATION_SUBMIT_ERROR =
  "Verification was not submitted. Check your connection and try again.";
const MAX_VERIFICATION_IMAGE_BYTES = 6 * 1024 * 1024;
const MAX_EXTRACTED_NAME_LENGTH = 80;
const MIN_VERIFICATION_AGE = 18;
const MAX_VERIFICATION_AGE = 100;
const MAX_MISMATCH_REASONS = 8;
const MAX_MISMATCH_REASON_LENGTH = 140;

function normalizeVerificationUri(uri: string): string {
  const normalizedUri = uri.trim();

  if (!normalizedUri) {
    throw new Error(VERIFICATION_UPLOAD_ERROR);
  }

  return normalizedUri;
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

function normalizeOptionalText(value?: string): string | undefined {
  const normalizedValue = value?.trim().slice(0, MAX_EXTRACTED_NAME_LENGTH);

  return normalizedValue || undefined;
}

function normalizeExtractedAge(age?: number): number | undefined {
  if (typeof age !== "number" || !Number.isFinite(age)) {
    return undefined;
  }

  const normalizedAge = Math.trunc(age);

  if (
    normalizedAge < MIN_VERIFICATION_AGE ||
    normalizedAge > MAX_VERIFICATION_AGE
  ) {
    return undefined;
  }

  return normalizedAge;
}

function normalizeMismatchReasons(reasons?: string[]): string[] | undefined {
  if (!Array.isArray(reasons)) {
    return undefined;
  }

  const normalizedReasons = Array.from(
    new Set(
      reasons
        .map((reason) => reason.trim().slice(0, MAX_MISMATCH_REASON_LENGTH))
        .filter(Boolean),
    ),
  ).slice(0, MAX_MISMATCH_REASONS);

  return normalizedReasons.length > 0 ? normalizedReasons : undefined;
}

function normalizeVerificationPayload(payload: VerificationData) {
  return {
    ...payload,
    selfieUri: normalizeVerificationUri(payload.selfieUri),
    documentUri: normalizeVerificationUri(payload.documentUri),
    extractedFirstName: normalizeOptionalText(payload.extractedFirstName),
    extractedLastName: normalizeOptionalText(payload.extractedLastName),
    extractedAge: normalizeExtractedAge(payload.extractedAge),
    mismatchReasons: normalizeMismatchReasons(payload.mismatchReasons),
  };
}

function getImageContentType(extension: string): string {
  if (extension === "jpg" || extension === "jpeg") {
    return "image/jpeg";
  }

  return `image/${extension}`;
}

async function uploadVerificationImage(
  userId: string,
  uri: string,
  kind: "selfie" | "document",
): Promise<string> {
  const normalizedUri = normalizeVerificationUri(uri);
  const extension = getImageExtension(normalizedUri);
  const filePath = `${userId}/${kind}-${Date.now()}.${extension}`;

  let fileBody: ArrayBuffer;

  if (Platform.OS === "web") {
    try {
      const response = await fetch(normalizedUri);
      fileBody = await response.arrayBuffer();
      if (fileBody.byteLength > MAX_VERIFICATION_IMAGE_BYTES) {
        throw new Error(VERIFICATION_UPLOAD_ERROR);
      }
    } catch {
      throw new Error(VERIFICATION_UPLOAD_ERROR);
    }
  } else {
    const fileInfo = await FileSystem.getInfoAsync(normalizedUri);

    if (
      !fileInfo.exists ||
      (typeof fileInfo.size === "number" &&
        fileInfo.size > MAX_VERIFICATION_IMAGE_BYTES)
    ) {
      throw new Error(VERIFICATION_UPLOAD_ERROR);
    }

    const base64 = await FileSystem.readAsStringAsync(normalizedUri, {
      encoding: "base64",
    });
    fileBody = decode(base64);
  }

  const { error } = await supabase.storage
    .from(VERIFICATION_BUCKET)
    .upload(filePath, fileBody, {
      contentType: getImageContentType(extension),
      upsert: false,
    });

  if (error) {
    throw new Error(VERIFICATION_UPLOAD_ERROR);
  }

  return filePath;
}

export function compareVerificationData(
  extracted: { firstName?: string; lastName?: string; age?: number },
  stored: BasicInfoPayload | null,
): { match: boolean; reasons: string[] } {
  if (!stored) return { match: false, reasons: ["No basic info found"] };
  const reasons: string[] = [];
  const normalize = (s: string) => s.trim().toLowerCase();

  if (!extracted.firstName) {
    reasons.push("Could not read first name from document");
  }
  if (!extracted.lastName) {
    reasons.push("Could not read last name from document");
  }
  if (extracted.age === undefined) {
    reasons.push("Could not read birth date or age from document");
  }

  if (
    extracted.firstName &&
    normalize(extracted.firstName) !== normalize(stored.firstName)
  ) {
    reasons.push("First name needs manual review");
  }
  if (
    extracted.lastName &&
    normalize(extracted.lastName) !== normalize(stored.lastName)
  ) {
    reasons.push("Last name needs manual review");
  }
  if (extracted.age !== undefined && extracted.age !== stored.age) {
    reasons.push("Age needs manual review");
  }

  return { match: reasons.length === 0, reasons };
}

export async function saveVerification(
  payload: VerificationData,
): Promise<{ ok: true; data: VerificationData }> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error(VERIFICATION_SIGN_IN_ERROR);
    }

    const normalizedPayload = normalizeVerificationPayload(payload);

    const selfieStoragePath = await uploadVerificationImage(
      user.id,
      normalizedPayload.selfieUri,
      "selfie",
    );
    const documentStoragePath = await uploadVerificationImage(
      user.id,
      normalizedPayload.documentUri,
      "document",
    );

    const record = {
      ...normalizedPayload,
      selfieUri: selfieStoragePath,
      documentUri: documentStoragePath,
      isVerified: false,
      verifiedAt: undefined,
    };

    const { error } = await supabase.rpc("submit_verification", {
      p_selfie_uri: record.selfieUri,
      p_document_uri: record.documentUri,
      p_extracted_first_name: normalizedPayload.extractedFirstName ?? null,
      p_extracted_last_name: normalizedPayload.extractedLastName ?? null,
      p_extracted_age: normalizedPayload.extractedAge ?? null,
      p_mismatch_reasons: normalizedPayload.mismatchReasons ?? null,
    });

    if (error) {
      throw new Error(VERIFICATION_SUBMIT_ERROR);
    }

    return { ok: true, data: record };
  } catch (error) {
    if (error instanceof Error && error.message === VERIFICATION_SIGN_IN_ERROR) {
      throw new Error(VERIFICATION_SIGN_IN_ERROR);
    }

    if (error instanceof Error && error.message === VERIFICATION_UPLOAD_ERROR) {
      throw new Error(VERIFICATION_UPLOAD_ERROR);
    }

    throw new Error(VERIFICATION_SUBMIT_ERROR);
  }
}

export async function getVerification(): Promise<VerificationData | null> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return null;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "verification_selfie, verification_document, verification_extracted_first_name, verification_extracted_last_name, verification_extracted_age, is_verified, verified_at, verification_mismatch_reasons",
      )
      .eq("id", user.id)
      .single();

    if (error || !data || !data.verification_selfie) {
      return null;
    }

    return {
      selfieUri: data.verification_selfie,
      documentUri: data.verification_document,
      extractedFirstName: data.verification_extracted_first_name,
      extractedLastName: data.verification_extracted_last_name,
      extractedAge: data.verification_extracted_age,
      isVerified: data.is_verified,
      verifiedAt: data.verified_at,
      mismatchReasons: data.verification_mismatch_reasons,
    };
  } catch {
    console.error("Error fetching verification.");
    return null;
  }
}

export async function clearVerification(): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase.rpc("clear_verification_submission");
      if (error) throw error;
    }
  } catch {
    console.error("Error clearing verification.");
  }
}
