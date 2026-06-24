import { extractTextFromImage } from "../ocrService";
import { supabase } from "@/src/config/supabase";
import * as FileSystem from "expo-file-system/legacy";

jest.mock("expo/virtual/env", () => ({
  env: process.env,
}));

jest.mock("@/src/config/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
  },
}));

jest.mock("expo-file-system/legacy", () => ({
  getInfoAsync: jest.fn(),
}));

describe("ocrService", () => {
  const testEnv = process.env as Record<string, string | undefined>;
  const originalEndpoint = testEnv.EXPO_PUBLIC_OCR_ENDPOINT;
  const originalSupabaseUrl = testEnv.EXPO_PUBLIC_SUPABASE_URL;
  const originalAnonKey = testEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  const originalFetch = global.fetch;

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    if (originalEndpoint === undefined) {
      delete testEnv.EXPO_PUBLIC_OCR_ENDPOINT;
    } else {
      testEnv.EXPO_PUBLIC_OCR_ENDPOINT = originalEndpoint;
    }
    if (originalSupabaseUrl === undefined) {
      delete testEnv.EXPO_PUBLIC_SUPABASE_URL;
    } else {
      testEnv.EXPO_PUBLIC_SUPABASE_URL = originalSupabaseUrl;
    }
    if (originalAnonKey === undefined) {
      delete testEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    } else {
      testEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY = originalAnonKey;
    }
    global.fetch = originalFetch;
  });

  function setOcrEndpoint(endpoint?: string) {
    if (endpoint) {
      testEnv.EXPO_PUBLIC_OCR_ENDPOINT = endpoint;
    } else {
      delete testEnv.EXPO_PUBLIC_OCR_ENDPOINT;
    }
  }

  beforeEach(() => {
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
      exists: true,
      size: 1024,
    });
  });

  it("rejects extraction when the OCR endpoint is not configured", async () => {
    setOcrEndpoint();
    delete testEnv.EXPO_PUBLIC_SUPABASE_URL;

    await expect(extractTextFromImage("file:///document.jpg")).rejects.toThrow(
      "Document OCR is not configured.",
    );
    expect(global.fetch).toBe(originalFetch);
  });

  it("posts the document image to the configured OCR endpoint", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        result: {
          firstName: " Maria ",
          lastName: "Santos",
          birthDate: "1998-04-03",
          fullText: "Maria Santos 1998-04-03",
        },
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    setOcrEndpoint("https://ocr.example.com/extract");
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { access_token: "session-token" } },
      error: null,
    });

    const result = await extractTextFromImage("file:///ids/passport.jpg");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://ocr.example.com/extract",
      expect.objectContaining({
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: "Bearer session-token",
        },
        body: expect.any(FormData),
      }),
    );
    expect(result).toEqual({
      firstName: "Maria",
      lastName: "Santos",
      birthDate: "1998-04-03",
      fullText: "Maria Santos 1998-04-03",
    });
    expect(supabase.auth.getSession).toHaveBeenCalled();
  });

  it("requires a session before calling a configured custom OCR endpoint", async () => {
    setOcrEndpoint("https://ocr.example.com/extract");
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    await expect(extractTextFromImage("file:///ids/passport.jpg")).rejects.toThrow(
      "Sign in before verifying IDs.",
    );
    expect(global.fetch).toBe(originalFetch);
  });

  it("rejects oversized documents before calling OCR", async () => {
    setOcrEndpoint("https://ocr.example.com/extract");
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
      exists: true,
      size: 7 * 1024 * 1024,
    });

    await expect(extractTextFromImage("file:///ids/passport.jpg")).rejects.toThrow(
      "OCR could not read this document. Try a clearer photo.",
    );
    expect(supabase.auth.getSession).not.toHaveBeenCalled();
    expect(global.fetch).toBe(originalFetch);
  });

  it("derives the Supabase Edge Function endpoint and sends auth headers", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        result: {
          firstName: "Maria",
          lastName: "Santos",
          birthDate: "1998-04-03",
          fullText: "Maria Santos 1998-04-03",
        },
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    setOcrEndpoint();
    testEnv.EXPO_PUBLIC_SUPABASE_URL = "https://abc123.supabase.co";
    testEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY = "anon-test-key";
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { access_token: "session-token" } },
      error: null,
    });

    await extractTextFromImage("file:///ids/passport.jpg");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://abc123.functions.supabase.co/ocr",
      expect.objectContaining({
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: "Bearer session-token",
          apikey: "anon-test-key",
        },
      }),
    );
  });

  it("requires a session before calling the Supabase Edge Function", async () => {
    setOcrEndpoint();
    testEnv.EXPO_PUBLIC_SUPABASE_URL = "https://abc123.supabase.co";
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    await expect(extractTextFromImage("file:///ids/passport.jpg")).rejects.toThrow(
      "Sign in before verifying IDs.",
    );
    expect(global.fetch).toBe(originalFetch);
  });

  it("surfaces Supabase Edge Function auth rejection without retrying locally", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: jest
        .fn()
        .mockResolvedValue(JSON.stringify({ error: "Sign in before verifying IDs." })),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    setOcrEndpoint();
    testEnv.EXPO_PUBLIC_SUPABASE_URL = "https://abc123.supabase.co";
    testEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY = "anon-test-key";
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { access_token: "expired-session-token" } },
      error: null,
    });

    await expect(extractTextFromImage("file:///ids/passport.jpg")).rejects.toThrow(
      "Sign in again before verifying IDs.",
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "https://abc123.functions.supabase.co/ocr",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer expired-session-token",
          apikey: "anon-test-key",
        }),
      }),
    );
  });

  it("uses client-safe errors when the OCR service rejects the request", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 422,
      text: jest.fn().mockResolvedValue("Unsupported document"),
    }) as unknown as typeof fetch;

    setOcrEndpoint("https://ocr.example.com/extract");
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { access_token: "session-token" } },
      error: null,
    });

    await expect(extractTextFromImage("file:///ids/bad.jpg")).rejects.toThrow(
      "OCR could not read this document. Try a clearer photo.",
    );
  });

  it("uses client-safe JSON error messages from the OCR Edge Function", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
      text: jest
        .fn()
        .mockResolvedValue(JSON.stringify({ error: "OCR temporarily unavailable. Please try again." })),
    }) as unknown as typeof fetch;

    setOcrEndpoint("https://ocr.example.com/extract");
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { access_token: "session-token" } },
      error: null,
    });

    await expect(extractTextFromImage("file:///ids/bad.jpg")).rejects.toThrow(
      "Document scan did not complete. Please try again.",
    );
  });

  it("rejects OCR payloads without extracted text", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ result: { firstName: "Maria" } }),
    }) as unknown as typeof fetch;

    setOcrEndpoint("https://ocr.example.com/extract");
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { access_token: "session-token" } },
      error: null,
    });

    await expect(extractTextFromImage("file:///ids/blank.jpg")).rejects.toThrow(
      "OCR service did not return extracted text.",
    );
  });
});
