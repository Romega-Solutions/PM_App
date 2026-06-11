type OcrResponse = {
  result: {
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    fullText: string;
  };
};

type EdgeFormData = FormData & {
  get(name: string): unknown;
};

type OcrQuotaResult = {
  allowed?: boolean;
  remaining?: number;
  retry_after_seconds?: number;
};

declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_DOCUMENT_BYTES = 6 * 1024 * 1024;
const OCR_PROVIDER_URL =
  Deno.env.get("OCR_PROVIDER_URL") || "https://api.ocr.space/parse/image";
const OCR_LANGUAGE = Deno.env.get("OCR_LANGUAGE") || "eng";
const DEFAULT_OCR_MAX_ATTEMPTS = 5;
const DEFAULT_OCR_WINDOW_MINUTES = 60;

class HttpError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function requireAuthenticatedRequest(req: Request): Promise<string> {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();

  if (!token) {
    throw new HttpError("Sign in before verifying IDs.", 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !anonKey) {
    console.error("OCR auth is not configured. Missing SUPABASE_URL or SUPABASE_ANON_KEY.");
    throw new HttpError("OCR temporarily unavailable. Please try again.", 503);
  }

  const response = await fetch(`${supabaseUrl.replace(/\/+$/, "")}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: anonKey,
    },
  });

  if (!response.ok) {
    throw new HttpError("Sign in before verifying IDs.", 401);
  }

  return token;
}

async function claimOcrAttempt(authToken: string): Promise<void> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !anonKey) {
    console.error("OCR rate limit is not configured. Missing SUPABASE_URL or SUPABASE_ANON_KEY.");
    throw new HttpError("OCR temporarily unavailable. Please try again.", 503);
  }

  const response = await fetch(
    `${supabaseUrl.replace(/\/+$/, "")}/rest/v1/rpc/claim_ocr_attempt`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        apikey: anonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_max_attempts: parsePositiveInt(
          Deno.env.get("OCR_MAX_ATTEMPTS_PER_HOUR"),
          DEFAULT_OCR_MAX_ATTEMPTS,
        ),
        p_window_minutes: parsePositiveInt(
          Deno.env.get("OCR_RATE_LIMIT_WINDOW_MINUTES"),
          DEFAULT_OCR_WINDOW_MINUTES,
        ),
      }),
    },
  );

  if (!response.ok) {
    console.error(`OCR quota claim failed with status ${response.status}.`);
    throw new HttpError("OCR temporarily unavailable. Please try again.", 503);
  }

  const payload = await response.json().catch(() => null);
  const result = Array.isArray(payload)
    ? (payload[0] as OcrQuotaResult | undefined)
    : (payload as OcrQuotaResult | null);

  if (!result?.allowed) {
    throw new HttpError(
      "Too many OCR attempts. Please wait before trying another document.",
      429,
    );
  }
}

function extractBirthDate(text: string): string | undefined {
  const iso = text.match(/\b(19|20)\d{2}[-/.](0?[1-9]|1[0-2])[-/.](0?[1-9]|[12]\d|3[01])\b/);
  if (iso) {
    const [year, month, day] = iso[0].split(/[-/.]/);
    return `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const monthName = text.match(
    /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+([0-3]?\d),?\s+((?:19|20)\d{2})\b/i,
  );

  if (!monthName) return undefined;

  const months: Record<string, string> = {
    jan: "01",
    feb: "02",
    mar: "03",
    apr: "04",
    may: "05",
    jun: "06",
    jul: "07",
    aug: "08",
    sep: "09",
    oct: "10",
    nov: "11",
    dec: "12",
  };

  const month = months[monthName[1].slice(0, 3).toLowerCase()];
  const day = monthName[2].padStart(2, "0");
  return `${monthName[3]}-${month}-${day}`;
}

function extractName(text: string): { firstName?: string; lastName?: string } {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const labelPatterns = [
    /(?:given\s+name|first\s+name|given\s+names?)[:\s]+([A-Z][A-Z\s'-]{1,60})/i,
    /(?:surname|last\s+name|family\s+name)[:\s]+([A-Z][A-Z\s'-]{1,60})/i,
    /(?:name)[:\s]+([A-Z][A-Z\s'-]{3,80})/i,
  ];

  let firstName: string | undefined;
  let lastName: string | undefined;

  for (const line of lines) {
    for (const pattern of labelPatterns) {
      const match = line.match(pattern);
      if (!match?.[1]) continue;
      const parts = match[1].trim().split(/\s+/);
      if (pattern.source.includes("surname") || pattern.source.includes("last")) {
        lastName ||= parts.join(" ");
      } else if (parts.length >= 2) {
        firstName ||= parts[0];
        lastName ||= parts.slice(1).join(" ");
      } else {
        firstName ||= parts[0];
      }
    }
  }

  if (!firstName || !lastName) {
    const candidate = lines.find((line) =>
      /^[A-Z][A-Z\s'-]{5,80}$/.test(line) &&
      !/(REPUBLIC|PASSPORT|LICENSE|IDENTIFICATION|PHILIPPINES|DATE|BIRTH|SEX|ADDRESS)/i.test(line)
    );

    if (candidate) {
      const parts = candidate.trim().split(/\s+/);
      firstName ||= parts[0];
      lastName ||= parts.length > 1 ? parts.slice(1).join(" ") : undefined;
    }
  }

  return { firstName, lastName };
}

function normalizeParsedText(providerPayload: unknown): string {
  const payload = providerPayload as {
    ParsedResults?: { ParsedText?: string }[];
    parsedResults?: { parsedText?: string }[];
    text?: string;
    fullText?: string;
  };

  const parsedText =
    payload.ParsedResults?.map((result) => result.ParsedText || "")
      .join("\n")
      .trim() ||
    payload.parsedResults?.map((result) => result.parsedText || "")
      .join("\n")
      .trim() ||
    payload.fullText ||
    payload.text ||
    "";

  return parsedText.trim();
}

async function callOcrProvider(document: File): Promise<OcrResponse> {
  const apiKey = Deno.env.get("OCR_SPACE_API_KEY");

  if (!apiKey) {
    console.error("OCR provider is not configured. Missing OCR_SPACE_API_KEY.");
    throw new HttpError("OCR temporarily unavailable. Please try again.", 503);
  }

  const body = new FormData();
  body.append("file", document, document.name || "verification-document.jpg");
  body.append("language", OCR_LANGUAGE);
  body.append("isOverlayRequired", "false");
  body.append("detectOrientation", "true");
  body.append("scale", "true");

  const response = await fetch(OCR_PROVIDER_URL, {
    method: "POST",
    headers: {
      apikey: apiKey,
    },
    body,
  });

  if (!response.ok) {
    console.error(`OCR provider request failed with status ${response.status}.`);
    throw new HttpError("OCR temporarily unavailable. Please try again.", 502);
  }

  const providerPayload = await response.json();
  const fullText = normalizeParsedText(providerPayload);

  if (!fullText) {
    throw new HttpError("OCR could not read this document. Try a clearer photo.", 422);
  }

  return {
    result: {
      ...extractName(fullText),
      birthDate: extractBirthDate(fullText),
      fullText,
    },
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const contentType = req.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("multipart/form-data")) {
    return jsonResponse({ error: "Expected multipart/form-data with a document file." }, 415);
  }

  try {
    const authToken = await requireAuthenticatedRequest(req);

    const formData = (await req.formData()) as unknown as EdgeFormData;
    const document = formData.get("document");

    if (!(document instanceof File)) {
      return jsonResponse({ error: "Missing document file." }, 400);
    }

    if (document.size <= 0 || document.size > MAX_DOCUMENT_BYTES) {
      return jsonResponse({ error: "Document must be between 1 byte and 6 MB." }, 413);
    }

    await claimOcrAttempt(authToken);

    return jsonResponse(await callOcrProvider(document));
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status);
    }

    console.error("Unexpected OCR request failure.", error);
    return jsonResponse({ error: "OCR request failed. Please try again." }, 502);
  }
});
