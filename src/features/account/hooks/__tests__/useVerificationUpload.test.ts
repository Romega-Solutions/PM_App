import {
  getOcrFallbackVerificationPayload,
  getVerificationFailureState,
} from "../useVerificationUpload";

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
