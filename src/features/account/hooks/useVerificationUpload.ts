import { calculateAge, extractTextFromImage } from "@/src/services/ocrService";
import { useIsDemoSession } from "@/src/features/auth/demoMode";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";
import { accountApi, VerificationData } from "../api/accountApi";

export type VerificationStatus =
  | "pending"
  | "captured"
  | "processing"
  | "submitted"
  | "verified"
  | "rejected";

type VerificationFailureState = {
  documentUri: string;
  documentStatus: VerificationStatus;
  error: string;
};

const OCR_FALLBACK_REVIEW_REASON =
  "Document OCR unavailable during beta test; manual review required";
const OCR_FALLBACK_REVIEW_MESSAGE =
  "Document scan did not complete, so we submitted your selfie and ID for manual review.";
const DEMO_SELFIE_URI = "pinaymate-demo://verification-selfie";
const DEMO_DOCUMENT_URI = "pinaymate-demo://verification-document";

export const getOcrFallbackVerificationPayload = (
  selfieUri: string,
  documentUri: string,
): VerificationData => ({
  selfieUri,
  documentUri,
  isVerified: false,
  mismatchReasons: [OCR_FALLBACK_REVIEW_REASON],
});

export const getVerificationFailureState = (
  err: unknown,
): VerificationFailureState => ({
  documentUri: "",
  documentStatus: "rejected",
  error:
    err instanceof Error
      ? err.message
      : "We could not read the document. Try again with a clearer photo.",
});

export const useVerificationUpload = () => {
  const isDemoMode = useIsDemoSession();
  const [selfieUri, setSelfieUri] = useState<string>("");
  const [documentUri, setDocumentUri] = useState<string>("");
  const [selfieStatus, setSelfieStatus] =
    useState<VerificationStatus>("pending");
  const [documentStatus, setDocumentStatus] =
    useState<VerificationStatus>("pending");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const takeSelfie = useCallback(async () => {
    if (isDemoMode) {
      setSelfieUri(DEMO_SELFIE_URI);
      setSelfieStatus("captured");
      setError("");
      return;
    }

    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setError("Camera permission required");
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.9,
    });
    if (res.canceled) return;
    setSelfieUri(res.assets[0].uri);
    setSelfieStatus("captured");
    setError("");
  }, [isDemoMode]);

  const uploadDocument = useCallback(async () => {
    if (!selfieUri) {
      setError("Take a verification selfie before uploading an ID document.");
      return;
    }

    if (isDemoMode) {
      setDocumentUri(DEMO_DOCUMENT_URI);
      setDocumentStatus("submitted");
      setError("");
      return;
    }

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError("Gallery permission required");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 0.9,
    });
    if (res.canceled) return;

    setDocumentUri(res.assets[0].uri);
    setDocumentStatus("processing");
    setLoading(true);

    try {
      // 1) Extract text via OCR
      let ocrResult: Awaited<ReturnType<typeof extractTextFromImage>>;
      try {
        ocrResult = await extractTextFromImage(res.assets[0].uri);
      } catch {
        await accountApi.saveVerification(
          getOcrFallbackVerificationPayload(selfieUri, res.assets[0].uri),
        );
        setDocumentStatus("submitted");
        setError(OCR_FALLBACK_REVIEW_MESSAGE);
        return;
      }

      // 2) Calculate age from birthdate
      const extractedAge = ocrResult.birthDate
        ? calculateAge(ocrResult.birthDate)
        : undefined;

      // 3) Get stored basic info
      const storedInfo = await accountApi.getBasicInfo();

      // 4) Compare
      const comparison = accountApi.compareVerificationData(
        {
          firstName: ocrResult.firstName,
          lastName: ocrResult.lastName,
          age: extractedAge ?? undefined,
        },
        storedInfo,
      );

      // 5) Save verification result
      const verificationPayload: VerificationData = {
        selfieUri,
        documentUri: res.assets[0].uri,
        extractedFirstName: ocrResult.firstName,
        extractedLastName: ocrResult.lastName,
        extractedAge: extractedAge ?? undefined,
        isVerified: false,
        mismatchReasons: comparison.reasons,
      };

      await accountApi.saveVerification(verificationPayload);

      setDocumentStatus("submitted");
      setError(
        comparison.match
          ? ""
          : `Submitted for manual review. We found details that need a reviewer to check: ${comparison.reasons.join("; ")}`,
      );
    } catch (err) {
      const failureState = getVerificationFailureState(err);
      setDocumentUri(failureState.documentUri);
      setDocumentStatus(failureState.documentStatus);
      setError(failureState.error);
    } finally {
      setLoading(false);
    }
  }, [isDemoMode, selfieUri]);

  const isSubmittedForReview = documentStatus === "submitted";

  return {
    selfieUri,
    documentUri,
    selfieStatus,
    documentStatus,
    loading,
    error,
    takeSelfie,
    uploadDocument,
    isSubmittedForReview,
  } as const;
};
