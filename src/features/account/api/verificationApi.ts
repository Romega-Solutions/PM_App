/**
 * Verification API
 * 
 * Handles identity verification (selfie + document upload, OCR extraction, verification status).
 * Single Responsibility: Verification operations only.
 */

import { supabase } from "@/src/config/supabase";
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

export function compareVerificationData(
  extracted: { firstName?: string; lastName?: string; age?: number },
  stored: BasicInfoPayload | null
): { match: boolean; reasons: string[] } {
  if (!stored) return { match: false, reasons: ["No basic info found"] };
  const reasons: string[] = [];
  const normalize = (s: string) => s.trim().toLowerCase();
  
  if (extracted.firstName && normalize(extracted.firstName) !== normalize(stored.firstName)) {
    reasons.push(`First name mismatch: "${extracted.firstName}" vs "${stored.firstName}"`);
  }
  if (extracted.lastName && normalize(extracted.lastName) !== normalize(stored.lastName)) {
    reasons.push(`Last name mismatch: "${extracted.lastName}" vs "${stored.lastName}"`);
  }
  if (extracted.age !== undefined && extracted.age !== stored.age) {
    reasons.push(`Age mismatch: ${extracted.age} vs ${stored.age}`);
  }
  
  return { match: reasons.length === 0, reasons };
}

export async function saveVerification(payload: VerificationData): Promise<{ ok: true; data: VerificationData }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error("Not authenticated");
    }

    const record = { 
      ...payload, 
      verifiedAt: payload.isVerified ? new Date().toISOString() : undefined 
    };

    const { error } = await supabase
      .from('profiles')
      .update({
        verification_selfie: record.selfieUri,
        verification_document: record.documentUri,
        verification_extracted_first_name: record.extractedFirstName,
        verification_extracted_last_name: record.extractedLastName,
        verification_extracted_age: record.extractedAge,
        is_verified: record.isVerified,
        verified_at: record.verifiedAt,
        verification_mismatch_reasons: record.mismatchReasons,
        verification_completed: true,
      })
      .eq('id', user.id);

    if (error) throw error;

    console.log("✅ Saved verification to Supabase");
    return { ok: true, data: record };
  } catch (error) {
    console.error("❌ Error saving verification:", error);
    throw error;
  }
}

export async function getVerification(): Promise<VerificationData | null> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('verification_selfie, verification_document, verification_extracted_first_name, verification_extracted_last_name, verification_extracted_age, is_verified, verified_at, verification_mismatch_reasons')
      .eq('id', user.id)
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
  } catch (error) {
    console.error("❌ Error fetching verification:", error);
    return null;
  }
}

export async function clearVerification(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase
        .from('profiles')
        .update({
          verification_completed: false,
          is_verified: false,
          verification_selfie: null,
          verification_document: null,
        })
        .eq('id', user.id);
    }
  } catch (error) {
    console.error("❌ Error clearing verification:", error);
  }
}
