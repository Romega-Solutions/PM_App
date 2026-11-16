import { extractTextFromImage } from "../ocrService";
import { supabase } from "@/src/config/supabase";
import { File as ExpoFile } from "expo-file-system";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

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

jest.mock("expo-file-system", () => ({
  File: jest.fn(),
}));

describe("ocrService", () => {
  const testEnv = process.env as Record<string, string | undefined>;
  const originalEndpoint = testEnv.EXPO_PUBLIC_OCR_ENDPOINT;
  const originalSupabaseUrl = testEnv.EXPO_PUBLIC_SUPABASE_URL;
  const originalAnonKey = testEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  const originalFetch = global.fetch;
  const platform = Platform as unknown as { OS: string };
  const originalPlatformOs = platform.OS;
  const expoFileConstructor = ExpoFile as unknown as jest.Mock;

  function createExpoFile(uri: string) {
    const filename = uri.split("/").pop() || "verification-document.jpg";
    const extension = filename.split(".").pop()?.toLowerCase();
    const contentType = extension === "png" ? "image/png" : "image/jpeg";
    const bytes = new Uint8Array([80, 77, 45, 79, 67, 82]);
    const file = new Blob([bytes], { type: contentType }) as Blob & {
      uri: string;
      name: string;
      bytes: () => Promise<Uint8Array>;
    };

    Object.defineProperty(file, "uri", { configurable: true, value: uri });
    Object.defineProperty(file, "name", {
      configurable: true,
      writable: true,
      value: filename,
    });
    Object.assign(file, {
      bytes: jest.fn().mockResolvedValue(bytes),
    });

    return file;
  }

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    expoFileConstructor.mockReset();
    platform.OS = originalPlatformOs;
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
    platform.OS = "ios";
    expoFileConstructor.mockImplementation(createExpoFile);
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

  it.each(["ios", "android"])(
    "appends an Expo File with readable binary data on %s",
    async (platformName) => {
      platform.OS = platformName;
      const uri = "file:///ids/passport.png";
      const nativeFile = createExpoFile(uri);
      expoFileConstructor.mockImplementation(() => nativeFile);
      const appendSpy = jest.spyOn(FormData.prototype, "append");
      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ fullText: "Maria Santos" }),
      });
      global.fetch = fetchMock as unknown as typeof fetch;
      setOcrEndpoint("https://ocr.example.com/extract");
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: { access_token: "session-token" } },
        error: null,
      });

      await extractTextFromImage(uri);

      const documentAppend = appendSpy.mock.calls.find(
        ([fieldName]) => fieldName === "document",
      );
      expect(expoFileConstructor).toHaveBeenCalledWith(uri);
      expect(documentAppend?.[1]).toBe(nativeFile);
      expect((documentAppend?.[1] as typeof nativeFile).bytes).toEqual(
        expect.any(Function),
      );
      expect((documentAppend?.[1] as typeof nativeFile).name).toBe("passport.png");
      expect((documentAppend?.[1] as typeof nativeFile).type).toBe("image/png");
      expect(await nativeFile.bytes()).toEqual(
        new Uint8Array([80, 77, 45, 79, 67, 82]),
      );

      const postedFormData = fetchMock.mock.calls[0]?.[1]?.body as FormData;
      const postedDocument = postedFormData.get("document");
      expect(postedDocument).toBeInstanceOf(Blob);
      expect((postedDocument as Blob).type).toBe("image/png");
      expect(
        new Uint8Array(await (postedDocument as Blob).arrayBuffer()),
      ).toEqual(new Uint8Array([80, 77, 45, 79, 67, 82]));
    },
  );

  it("preserves the browser Blob upload and safe filename", async () => {
    platform.OS = "web";
    const uri = "https://example.com/ids/passport.png?token=fixture";
    const imageBlob = new Blob(["browser image fixture"], {
      type: "image/png",
    });
    const fetchMock = jest
      .fn()
      .mockImplementation(async (input: RequestInfo | URL) => {
        if (String(input) === uri) {
          return { blob: jest.fn().mockResolvedValue(imageBlob) };
        }
        return {
          ok: true,
          json: jest.fn().mockResolvedValue({ fullText: "Maria Santos" }),
        };
      });
    global.fetch = fetchMock as unknown as typeof fetch;
    setOcrEndpoint("https://ocr.example.com/extract");
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { access_token: "session-token" } },
      error: null,
    });

    await extractTextFromImage(uri);

    expect(expoFileConstructor).not.toHaveBeenCalled();
    const postedFormData = fetchMock.mock.calls[2]?.[1]?.body as FormData;
    const postedDocument = postedFormData.get("document") as Blob & {
      name?: string;
    };
    expect(postedDocument).toBeInstanceOf(Blob);
    expect(postedDocument.name).toBe("passport.png");
    expect(postedDocument.type).toBe("image/png");
    expect(
      new TextDecoder().decode(await postedDocument.arrayBuffer()),
    ).toBe("browser image fixture");
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
