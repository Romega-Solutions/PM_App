import { act, renderHook } from "@testing-library/react-native";
import { useIsDemoSession } from "@/src/features/auth/demoMode";
import { extractTextFromImage } from "@/src/services/ocrService";
import { accountApi } from "../../api/accountApi";
import {
  getOcrFallbackVerificationPayload,
  getVerificationFailureState,
  useVerificationUpload,
} from "../useVerificationUpload";

jest.mock("@/src/features/auth/demoMode", () => ({
  useIsDemoSession: jest.fn(() => false),
}));

jest.mock("expo-image-picker", () => ({
  requestCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock("@/src/services/ocrService", () => ({
  calculateAge: jest.fn(),
  extractTextFromImage: jest.fn(),
}));

jest.mock("../../api/accountApi", () => ({
  accountApi: {
    getBasicInfo: jest.fn(),
    compareVerificationData: jest.fn(),
    saveVerification: jest.fn(),
  },
}));

const mockUseIsDemoSession = useIsDemoSession as jest.MockedFunction<
  typeof useIsDemoSession
>;
const mockExtractTextFromImage = extractTextFromImage as jest.MockedFunction<
  typeof extractTextFromImage
>;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseIsDemoSession.mockReturnValue(false);
});

describe("getVerificationFailureState", () => {
  it("clears the failed document upload so users can retry verification", () => {
    expect(
      getVerificationFailureState(new Error("Could not read the document.")),
    ).toEqual({
      documentUri: "",
      documentStatus: "rejected",
      error: "Could not read the document.",
    });
  });
});

describe("getOcrFallbackVerificationPayload", () => {
  it("submits OCR failures as unapproved manual-review verification", () => {
    expect(
      getOcrFallbackVerificationPayload("selfie-uri", "document-uri"),
    ).toEqual({
      selfieUri: "selfie-uri",
      documentUri: "document-uri",
      isVerified: false,
      mismatchReasons: [
        "Document OCR unavailable during beta test; manual review required",
      ],
    });
  });
});

describe("useVerificationUpload demo mode", () => {
  it("submits verification-lite review without OCR, Supabase upload, or an error banner", async () => {
    mockUseIsDemoSession.mockReturnValue(true);

    const { result } = renderHook(() => useVerificationUpload());

    await act(async () => {
      await result.current.takeSelfie();
    });

    await act(async () => {
      await result.current.uploadDocument();
    });

    expect(result.current.selfieUri).toBe("pinaymate-demo://verification-selfie");
    expect(result.current.documentUri).toBe(
      "pinaymate-demo://verification-document",
    );
    expect(result.current.selfieStatus).toBe("captured");
    expect(result.current.documentStatus).toBe("submitted");
    expect(result.current.isSubmittedForReview).toBe(true);
    expect(result.current.error).toBe("");
    expect(mockExtractTextFromImage).not.toHaveBeenCalled();
    expect(accountApi.saveVerification).not.toHaveBeenCalled();
  });
});
