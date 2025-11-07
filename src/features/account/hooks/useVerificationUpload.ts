import { useCallback, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { accountApi, VerificationData } from "../api/accountApi";
import { extractTextFromImage, calculateAge } from "@/src/services/ocrService";

export type VerificationStatus =
  | "pending"
  | "processing"
  | "verified"
  | "rejected";

export const useVerificationUpload = () => {
  const [selfieUri, setSelfieUri] = useState<string>("");
  const [documentUri, setDocumentUri] = useState<string>("");
  const [selfieStatus, setSelfieStatus] =
    useState<VerificationStatus>("pending");
  const [documentStatus, setDocumentStatus] =
    useState<VerificationStatus>("pending");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const takeSelfie = useCallback(async () => {
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
    setSelfieStatus("processing");
    // Simulate validation
    setTimeout(() => setSelfieStatus("verified"), 1500);
  }, []);

  const uploadDocument = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError("Gallery permission required");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 0.9,
    });
    if (res.canceled) return;

    setDocumentUri(res.assets[0].uri);
    setDocumentStatus("processing");
    setLoading(true);

    try {
      // 1) Extract text via OCR
      const ocrResult = await extractTextFromImage(res.assets[0].uri);

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
        storedInfo
      );

      // 5) Save verification result
      const verificationPayload: VerificationData = {
        selfieUri,
        documentUri: res.assets[0].uri,
        extractedFirstName: ocrResult.firstName,
        extractedLastName: ocrResult.lastName,
        extractedAge: extractedAge ?? undefined,
        isVerified: comparison.match,
        mismatchReasons: comparison.reasons,
      };

      await accountApi.saveVerification(verificationPayload);

      if (comparison.match) {
        setDocumentStatus("verified");
      } else {
        setDocumentStatus("rejected");
        setError(comparison.reasons.join("; "));
      }
    } catch (err) {
      setDocumentStatus("rejected");
      setError(err instanceof Error ? err.message : "OCR failed");
    } finally {
      setLoading(false);
    }
  }, [selfieUri]);

  const isVerified = selfieStatus === "verified" && documentStatus === "verified";

  return {
    selfieUri,
    documentUri,
    selfieStatus,
    documentStatus,
    loading,
    error,
    takeSelfie,
    uploadDocument,
    isVerified,
  } as const;
};