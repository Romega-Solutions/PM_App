import { supabase } from "@/src/config/supabase";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";
import { compareVerificationData, saveVerification } from "../verificationApi";
import type { BasicInfoPayload } from "../basicInfoApi";

jest.mock("@/src/config/supabase", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    rpc: jest.fn(),
    storage: {
      from: jest.fn(),
    },
  },
}));

jest.mock("expo-file-system/legacy", () => ({
  getInfoAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
}));

jest.mock("base64-arraybuffer", () => ({
  decode: jest.fn(),
}));

const storedInfo: BasicInfoPayload = {
  firstName: "Maria",
  lastName: "Santos",
  age: 28,
  gender: "female",
  userType: "filipina",
};

describe("compareVerificationData", () => {
  it("accepts OCR data that matches stored basic info", () => {
    const result = compareVerificationData(
      { firstName: "maria", lastName: "SANTOS", age: 28 },
      storedInfo,
    );

    expect(result).toEqual({ match: true, reasons: [] });
  });

  it("rejects missing OCR identity fields instead of silently passing", () => {
    const result = compareVerificationData({ firstName: "Maria" }, storedInfo);

    expect(result.match).toBe(false);
    expect(result.reasons).toEqual([
      "Could not read last name from document",
      "Could not read birth date or age from document",
    ]);
  });

  it("rejects mismatched OCR identity fields", () => {
    const result = compareVerificationData(
      { firstName: "Ana", lastName: "Reyes", age: 31 },
      storedInfo,
    );

    expect(result.match).toBe(false);
    expect(result.reasons).toEqual([
      "First name needs manual review",
      "Last name needs manual review",
      "Age needs manual review",
    ]);
  });

  it("rejects comparison when stored basic info is missing", () => {
    const result = compareVerificationData(
      { firstName: "Maria", lastName: "Santos", age: 28 },
      null,
    );

    expect(result).toEqual({
      match: false,
      reasons: ["No basic info found"],
    });
  });
});

describe("saveVerification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, "now").mockReturnValue(1717977600000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("uploads local verification images and saves durable storage paths", async () => {
    const upload = jest.fn().mockResolvedValue({ error: null });

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });
    (supabase.storage.from as jest.Mock).mockReturnValue({ upload });
    (supabase.rpc as jest.Mock).mockResolvedValue({ error: null });
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
      exists: true,
      size: 1024,
    });
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue("base64-image");
    (decode as jest.Mock).mockReturnValue("decoded-image");

    const result = await saveVerification({
      selfieUri: "file:///selfie.jpg",
      documentUri: "file:///passport.png",
      extractedFirstName: "Maria",
      extractedLastName: "Santos",
      extractedAge: 28,
      isVerified: false,
      mismatchReasons: [],
    });

    expect(result.ok).toBe(true);
    expect(supabase.storage.from).toHaveBeenCalledWith("verification-docs");
    expect(upload).toHaveBeenCalledTimes(2);
    expect(upload).toHaveBeenNthCalledWith(
      1,
      "user-123/selfie-1717977600000.jpg",
      "decoded-image",
      {
        contentType: "image/jpeg",
        upsert: false,
      },
    );
    expect(upload).toHaveBeenNthCalledWith(
      2,
      "user-123/document-1717977600000.png",
      "decoded-image",
      {
        contentType: "image/png",
        upsert: false,
      },
    );
    expect(supabase.rpc).toHaveBeenCalledWith("submit_verification", {
      p_selfie_uri: "user-123/selfie-1717977600000.jpg",
      p_document_uri: "user-123/document-1717977600000.png",
      p_extracted_first_name: "Maria",
      p_extracted_last_name: "Santos",
      p_extracted_age: 28,
      p_mismatch_reasons: [],
    });
    expect(result.data.selfieUri).toBe("user-123/selfie-1717977600000.jpg");
    expect(result.data.documentUri).toBe("user-123/document-1717977600000.png");
  });

  it("does not save verification when private storage upload fails", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });
    (supabase.storage.from as jest.Mock).mockReturnValue({
      upload: jest.fn().mockResolvedValue({
        error: { message: "Storage policy rejected upload" },
      }),
    });
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
      exists: true,
      size: 1024,
    });
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue("base64-image");
    (decode as jest.Mock).mockReturnValue("decoded-image");

    await expect(
      saveVerification({
        selfieUri: "file:///selfie.jpg",
        documentUri: "file:///passport.png",
        isVerified: false,
      }),
    ).rejects.toThrow(
      "Verification upload failed. Check your files and connection, then try again.",
    );

    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("rejects oversized verification files before upload", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
      exists: true,
      size: 7 * 1024 * 1024,
    });

    await expect(
      saveVerification({
        selfieUri: "file:///selfie.jpg",
        documentUri: "file:///passport.png",
        isVerified: false,
      }),
    ).rejects.toThrow(
      "Verification upload failed. Check your files and connection, then try again.",
    );

    expect(supabase.storage.from).not.toHaveBeenCalled();
    expect(supabase.rpc).not.toHaveBeenCalled();
  });
});
