// Ticket #48: Supabase Auth "Before User Created" HTTP hook.
//
// Supabase Auth calls this function before it inserts a new auth.users row, for
// every way a user can be created (email/password today; OAuth later). It:
//   1. verifies the Standard Webhooks signature from Supabase Auth,
//   2. looks up the sign-up IP (metadata.ip_address) with the configured vendor,
//   3. stores country + VPN/proxy signal via public.record_signup_signal(),
//   4. returns {} (allow). It never blocks unless GEO_BLOCK_VPN_SIGNUPS=true.
//
// Vendor failures fail OPEN: the sign-up goes through and the row is stored with
// soft_flag = 'unavailable'. See README.md for the full behavior table.

declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

type GeoProvider = "ipqs" | "ipinfo_lite" | "none";
type LookupStatus = "ok" | "error" | "timeout" | "quota" | "not_configured" | "no_ip" | "private_ip";
type SoftFlag = "none" | "review_suggested" | "unavailable";

type HookPayload = {
  metadata?: { uuid?: unknown; ip_address?: unknown; name?: unknown };
  user?: { id?: unknown; app_metadata?: { provider?: unknown } | null };
};

type GeoLookup = {
  status: LookupStatus;
  countryCode: string | null;
  region: string | null;
  isVpn: boolean | null;
  isProxy: boolean | null;
  isTor: boolean | null;
  isMobile: boolean | null;
  fraudScore: number | null;
  providerStatus: Record<string, unknown>;
};

const MAX_HOOK_BODY_BYTES = 20 * 1024;
const WEBHOOK_TOLERANCE_SECONDS = 5 * 60;
const DEFAULT_PROVIDER_TIMEOUT_MS = 2500;
const RPC_TIMEOUT_MS = 1500;
const DEFAULT_LAUNCH_COUNTRIES = ["PH", "US"];
const DEFAULT_US_LAUNCH_REGIONS = ["california"];
const IPQS_DEFAULT_BASE_URL = "https://www.ipqualityscore.com";
const IPINFO_DEFAULT_BASE_URL = "https://api.ipinfo.io";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BLOCKED_VPN_MESSAGE =
  "Sign-up isn't available from this network right now. Please turn off any VPN or proxy and try again.";

function env(name: string): string {
  return Deno.env.get(name)?.trim() ?? "";
}

function isEnabled(name: string): boolean {
  return env(name) === "true";
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function allow(): Response {
  return jsonResponse({});
}

// ---------------------------------------------------------------------------
// Standard Webhooks verification (what Supabase Auth hooks use).
// signed content = `${webhook-id}.${webhook-timestamp}.${body}`, HMAC-SHA256,
// key = base64-decoded part after "v1,whsec_".
// ---------------------------------------------------------------------------
function base64ToBuffer(value: string): ArrayBuffer {
  const binary = atob(value);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return buffer;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function verifyWebhook(req: Request, body: string, secret: string): Promise<boolean> {
  const id = req.headers.get("webhook-id") ?? "";
  const timestamp = req.headers.get("webhook-timestamp") ?? "";
  const signatureHeader = req.headers.get("webhook-signature") ?? "";

  if (!id || !timestamp || !signatureHeader) return false;

  const timestampSeconds = Number.parseInt(timestamp, 10);
  if (!Number.isFinite(timestampSeconds)) return false;
  if (Math.abs(Date.now() / 1000 - timestampSeconds) > WEBHOOK_TOLERANCE_SECONDS) return false;

  let keyBytes: ArrayBuffer;
  try {
    keyBytes = base64ToBuffer(secret.replace(/^v1,/, "").replace(/^whsec_/, ""));
  } catch {
    return false;
  }

  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${id}.${timestamp}.${body}`));
  const expected = bytesToBase64(new Uint8Array(signed));

  return signatureHeader
    .split(" ")
    .map((entry) => entry.trim())
    .filter((entry) => entry.startsWith("v1,"))
    .some((entry) => timingSafeEqual(entry.slice(3), expected));
}

// ---------------------------------------------------------------------------
// IP helpers
// ---------------------------------------------------------------------------
function normalizeIp(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const ip = value.trim();
  if (!ip || ip.length > 64) return null;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip) || /^[0-9a-f:.]+$/i.test(ip)) return ip;
  return null;
}

function isPrivateIp(ip: string): boolean {
  if (ip.includes(":")) {
    const lower = ip.toLowerCase();
    return lower === "::1" || lower.startsWith("fc") || lower.startsWith("fd") || lower.startsWith("fe80");
  }
  const [a, b] = ip.split(".").map((part) => Number.parseInt(part, 10));
  return (
    a === 10 ||
    a === 127 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254) ||
    (a === 100 && b >= 64 && b <= 127)
  );
}

// ---------------------------------------------------------------------------
// Vendor lookups. Each returns a GeoLookup and never throws.
// ---------------------------------------------------------------------------
function emptyLookup(status: LookupStatus, providerStatus: Record<string, unknown> = {}): GeoLookup {
  return {
    status,
    countryCode: null,
    region: null,
    isVpn: null,
    isProxy: null,
    isTor: null,
    isMobile: null,
    fraudScore: null,
    providerStatus,
  };
}

function asBool(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function asCountry(value: unknown): string | null {
  return typeof value === "string" && /^[A-Za-z]{2}$/.test(value) ? value.toUpperCase() : null;
}

function asShortString(value: unknown, max = 100): string | null {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
}

function providerTimeoutMs(): number {
  const parsed = Number.parseInt(env("GEO_PROVIDER_TIMEOUT_MS"), 10);
  return Number.isFinite(parsed) && parsed >= 200 && parsed <= 4000 ? parsed : DEFAULT_PROVIDER_TIMEOUT_MS;
}

async function fetchJson(url: string, timeoutMs: number): Promise<{ status: number; body: unknown } | "timeout" | "error"> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { headers: { Accept: "application/json" }, signal: controller.signal });
    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }
    return { status: response.status, body };
  } catch (error) {
    return error instanceof Error && error.name === "AbortError" ? "timeout" : "error";
  } finally {
    clearTimeout(timer);
  }
}

async function lookupIpqs(ip: string): Promise<GeoLookup> {
  const key = env("GEO_IPQS_API_KEY");
  if (!key) return emptyLookup("not_configured");

  const base = (env("GEO_IPQS_BASE_URL") || IPQS_DEFAULT_BASE_URL).replace(/\/+$/, "");
  // strictness=0 + allow_public_access_points=true keeps false positives low for
  // shared mobile-carrier and cafe/university IPs (we must not punish carrier NAT).
  const url =
    `${base}/api/json/ip/${encodeURIComponent(key)}/${encodeURIComponent(ip)}` +
    "?strictness=0&allow_public_access_points=true&fast=true&mobile=true";

  const result = await fetchJson(url, providerTimeoutMs());
  if (result === "timeout") return emptyLookup("timeout");
  if (result === "error") return emptyLookup("error");

  const body = (result.body && typeof result.body === "object" ? result.body : {}) as Record<string, unknown>;
  const message = asShortString(body.message, 200);

  if (result.status !== 200 || body.success !== true) {
    const quota = result.status === 429 || /quota|exceeded|credits|limit/i.test(message ?? "");
    return emptyLookup(quota ? "quota" : "error", { http_status: result.status, success: body.success ?? null, message });
  }

  const fraudScore = typeof body.fraud_score === "number" ? Math.round(body.fraud_score) : null;

  return {
    status: "ok",
    countryCode: asCountry(body.country_code),
    region: asShortString(body.region),
    isVpn: body.vpn === true || body.active_vpn === true ? true : asBool(body.vpn),
    isProxy: asBool(body.proxy),
    isTor: body.tor === true || body.active_tor === true ? true : asBool(body.tor),
    isMobile: asBool(body.mobile),
    fraudScore,
    // Trimmed copy of the vendor answer. No IP, host, or city is kept.
    providerStatus: {
      success: true,
      request_id: asShortString(body.request_id, 64),
      country_code: asCountry(body.country_code),
      region: asShortString(body.region),
      ISP: asShortString(body.ISP),
      ASN: typeof body.ASN === "number" ? body.ASN : null,
      proxy: asBool(body.proxy),
      vpn: asBool(body.vpn),
      active_vpn: asBool(body.active_vpn),
      tor: asBool(body.tor),
      active_tor: asBool(body.active_tor),
      mobile: asBool(body.mobile),
      recent_abuse: asBool(body.recent_abuse),
      bot_status: asBool(body.bot_status),
      fraud_score: fraudScore,
    },
  };
}

async function lookupIpinfoLite(ip: string): Promise<GeoLookup> {
  const token = env("GEO_IPINFO_TOKEN");
  if (!token) return emptyLookup("not_configured");

  const base = (env("GEO_IPINFO_BASE_URL") || IPINFO_DEFAULT_BASE_URL).replace(/\/+$/, "");
  const url = `${base}/lite/${encodeURIComponent(ip)}?token=${encodeURIComponent(token)}`;

  const result = await fetchJson(url, providerTimeoutMs());
  if (result === "timeout") return emptyLookup("timeout");
  if (result === "error") return emptyLookup("error");

  const body = (result.body && typeof result.body === "object" ? result.body : {}) as Record<string, unknown>;
  if (result.status !== 200) {
    return emptyLookup(result.status === 429 ? "quota" : "error", { http_status: result.status });
  }

  // IPinfo Lite is country + ASN only: VPN/proxy flags stay NULL (unknown).
  return {
    ...emptyLookup("ok"),
    countryCode: asCountry(body.country_code),
    providerStatus: {
      country_code: asCountry(body.country_code),
      asn: asShortString(body.asn, 16),
      as_name: asShortString(body.as_name),
    },
  };
}

function configuredProvider(): GeoProvider {
  const value = env("GEO_SIGNAL_PROVIDER").toLowerCase();
  return value === "ipqs" || value === "ipinfo_lite" ? value : "none";
}

async function lookup(provider: GeoProvider, ip: string | null): Promise<GeoLookup> {
  if (!ip) return emptyLookup("no_ip");
  if (isPrivateIp(ip) && !isEnabled("GEO_LOOKUP_PRIVATE_IPS")) return emptyLookup("private_ip");
  if (provider === "ipqs") return lookupIpqs(ip);
  if (provider === "ipinfo_lite") return lookupIpinfoLite(ip);
  return emptyLookup("not_configured");
}

// ---------------------------------------------------------------------------
// Soft-filter decision
// ---------------------------------------------------------------------------
function listFromEnv(name: string, fallback: string[], lower = false): string[] {
  const raw = env(name);
  if (!raw) return fallback;
  return raw
    .split(",")
    .map((item) => (lower ? item.trim().toLowerCase() : item.trim().toUpperCase()))
    .filter(Boolean);
}

function decide(result: GeoLookup): { softFlag: SoftFlag; reasons: string[] } {
  if (result.status !== "ok") {
    return { softFlag: "unavailable", reasons: [`lookup_${result.status}`] };
  }

  const reasons: string[] = [];
  const launchCountries = listFromEnv("GEO_LAUNCH_COUNTRIES", DEFAULT_LAUNCH_COUNTRIES);
  const usRegions = listFromEnv("GEO_US_LAUNCH_REGIONS", DEFAULT_US_LAUNCH_REGIONS, true);

  if (result.isVpn || result.isProxy || result.isTor) reasons.push("vpn_or_proxy");

  if (!result.countryCode) {
    reasons.push("country_unknown");
  } else if (!launchCountries.includes(result.countryCode)) {
    reasons.push("outside_launch_country");
  } else if (result.countryCode === "US" && result.region && !usRegions.includes(result.region.toLowerCase())) {
    reasons.push("outside_launch_region");
  }

  return { softFlag: reasons.length > 0 ? "review_suggested" : "none", reasons };
}

function shouldHardBlock(result: GeoLookup): boolean {
  // Off by default. Only VPN/proxy/Tor, never country, and never a mobile
  // carrier IP (carrier NAT can look like a proxy).
  if (!isEnabled("GEO_BLOCK_VPN_SIGNUPS")) return false;
  if (result.status !== "ok") return false;
  if (result.isMobile === true) return false;
  return result.isVpn === true || result.isProxy === true || result.isTor === true;
}

// ---------------------------------------------------------------------------
// Persistence (service role -> record_signup_signal). Never throws.
// ---------------------------------------------------------------------------
async function recordSignal(row: Record<string, unknown>): Promise<boolean> {
  const supabaseUrl = env("SUPABASE_URL").replace(/\/+$/, "");
  const serviceRoleKey = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Signup signal hook missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
    return false;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RPC_TIMEOUT_MS);
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/record_signup_signal`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(row),
      signal: controller.signal,
    });
    if (!response.ok) {
      console.error(`Signup signal RPC failed with status ${response.status}.`);
      return false;
    }
    return true;
  } catch (error) {
    const errorName = error instanceof Error ? error.name : "UnknownError";
    console.error(`Signup signal RPC request failed: ${errorName}`);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return jsonResponse({ error: { http_code: 405, message: "Method not allowed" } }, 405);
  }

  const body = await req.text();
  if (new TextEncoder().encode(body).length > MAX_HOOK_BODY_BYTES) {
    return jsonResponse({ error: { http_code: 413, message: "Payload too large" } }, 413);
  }

  const secret = env("BEFORE_USER_CREATED_HOOK_SECRET");
  if (!secret) {
    // Misconfigured deploy: fail open for sign-up, but write nothing because
    // the caller cannot be authenticated.
    console.error("Signup signal hook missing BEFORE_USER_CREATED_HOOK_SECRET; allowing sign-up without a signal.");
    return allow();
  }

  if (!(await verifyWebhook(req, body, secret))) {
    return jsonResponse({ error: { http_code: 401, message: "Invalid webhook signature" } }, 401);
  }

  let payload: HookPayload;
  try {
    payload = JSON.parse(body) as HookPayload;
  } catch {
    return allow();
  }

  const userId = typeof payload.user?.id === "string" && UUID_PATTERN.test(payload.user.id) ? payload.user.id : null;
  if (!userId) {
    console.error("Signup signal hook received a payload without a valid user id; allowing.");
    return allow();
  }

  const hookRequestId =
    typeof payload.metadata?.uuid === "string" && UUID_PATTERN.test(payload.metadata.uuid) ? payload.metadata.uuid : null;
  const authProvider =
    typeof payload.user?.app_metadata?.provider === "string" ? payload.user.app_metadata.provider : "unknown";

  const provider = configuredProvider();
  const ip = normalizeIp(payload.metadata?.ip_address);

  let result: GeoLookup;
  try {
    result = await lookup(provider, ip);
  } catch {
    result = emptyLookup("error");
  }

  const { softFlag, reasons } = decide(result);
  const block = shouldHardBlock(result);

  await recordSignal({
    p_user_id: userId,
    p_hook_request_id: hookRequestId,
    p_auth_provider: authProvider,
    p_provider: provider,
    p_lookup_status: result.status,
    p_country_code: result.countryCode,
    p_region: result.region,
    p_is_vpn: result.isVpn,
    p_is_proxy: result.isProxy,
    p_is_tor: result.isTor,
    p_is_mobile: result.isMobile,
    p_fraud_score: result.fraudScore,
    p_soft_flag: softFlag,
    p_reasons: reasons,
    p_enforcement: block ? "blocked" : "allow",
    p_provider_status: result.providerStatus,
  });

  if (block) {
    // The error object must ride on an HTTP 200: Supabase Auth turns a non-2xx
    // hook status into a generic 500 (proved locally, CLI 3.0.0 / auth image of
    // that release). With 200 + error body, Auth returns http_code + message.
    return jsonResponse({ error: { http_code: 403, message: BLOCKED_VPN_MESSAGE } }, 200);
  }

  return allow();
});
