import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const PROFILE_PHOTOS_BUCKET = "profile-photos";
const MAX_PROFILE_PHOTOS = 6;

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return {};

  const values = {};
  const content = readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    values[key] = rawValue.trim().replace(/^['"]|['"]$/g, "");
  }

  return values;
}

const env = {
  ...loadEnvFile(join(ROOT, ".env")),
  ...loadEnvFile(join(ROOT, ".env.local")),
  ...process.env,
};

function getEnv(...keys) {
  for (const key of keys) {
    const value = env[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function fail(message) {
  throw new Error(message);
}

function info(message) {
  console.log(message);
}

function redactedProject(url) {
  try {
    const host = new URL(url).hostname;
    const projectRef = host.split(".")[0] ?? "unknown";
    return `${projectRef.slice(0, 4)}...${projectRef.slice(-4)}`;
  } catch {
    return "unknown";
  }
}

function redactedUserId(userId) {
  return `${userId.slice(0, 8)}...${userId.slice(-4)}`;
}

function normalizePhotoList(value) {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (item) => typeof item === "string" && item.trim().length > 0,
  );
}

function getStoragePathFromPublicUrl(publicUrl) {
  const marker = `/${PROFILE_PHOTOS_BUCKET}/`;
  const markerIndex = publicUrl.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  const path = decodeURIComponent(
    publicUrl.slice(markerIndex + marker.length).split("?")[0],
  ).replace(/^\/+/, "");

  if (!path || path.includes("..") || path.includes("\\")) {
    return null;
  }

  return path;
}

async function assertPublicPhotoReadable(publicUrl) {
  const response = await fetch(publicUrl, { method: "GET" });

  if (!response.ok) {
    fail(`uploaded public profile photo returned HTTP ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("image/")) {
    fail("uploaded public profile photo did not return an image content type");
  }
}

async function generateProofImage() {
  return sharp({
    create: {
      width: 72,
      height: 90,
      channels: 3,
      background: { r: 239, g: 62, b: 120 },
    },
  })
    .png()
    .toBuffer();
}

async function run() {
  const supabaseUrl = getEnv("EXPO_PUBLIC_SUPABASE_URL", "SUPABASE_URL");
  const supabaseKey = getEnv(
    "EXPO_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_PUBLISHABLE_KEY",
  );
  const email = getEnv("PM_PHOTO_PROOF_EMAIL", "PM_WEB_MVP_EMAIL", "OCR_PROOF_EMAIL");
  const password = getEnv(
    "PM_PHOTO_PROOF_PASSWORD",
    "PM_WEB_MVP_PASSWORD",
    "OCR_PROOF_PASSWORD",
  );

  if (!supabaseUrl || !supabaseKey) {
    fail("set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY");
  }

  if (!email || !password) {
    fail("set PM_WEB_MVP_EMAIL and PM_WEB_MVP_PASSWORD for a disposable beta user");
  }

  if (/placeholder|your-project/i.test(supabaseUrl + supabaseKey)) {
    fail("photo upload proof requires live Supabase values, not placeholders");
  }

  info(`Photo upload live proof target: ${redactedProject(supabaseUrl)}`);
  info("Photo upload live proof output is redacted: no keys, tokens, or user credentials are printed.");

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (authError || !authData.user?.id) {
    fail("proof user sign-in failed");
  }

  const userId = authData.user.id;
  info(`PASS auth: signed in disposable proof user ${redactedUserId(userId)}`);

  const uploadPath = `${userId}/${Date.now()}-${randomUUID()}.png`;
  let uploadedPublicUrl = "";

  try {
    const { data: beforeProfile, error: beforeError } = await supabase
      .from("profiles")
      .select("photos")
      .eq("id", userId)
      .single();

    if (beforeError) {
      fail("could not read proof user's profile photos");
    }

    const beforePhotos = normalizePhotoList(beforeProfile?.photos);
    const image = await generateProofImage();

    const { error: uploadError } = await supabase.storage
      .from(PROFILE_PHOTOS_BUCKET)
      .upload(uploadPath, image, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      fail("profile photo storage upload failed");
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(PROFILE_PHOTOS_BUCKET).getPublicUrl(uploadPath);

    uploadedPublicUrl = publicUrl;

    const ownerPath = getStoragePathFromPublicUrl(publicUrl);
    if (!ownerPath?.startsWith(`${userId}/`)) {
      fail("uploaded profile photo public URL is not user-scoped");
    }

    info("PASS storage: uploaded user-scoped profile photo object");

    const nextPhotos = [
      publicUrl,
      ...beforePhotos.filter((photo) => photo !== publicUrl),
    ].slice(0, MAX_PROFILE_PHOTOS);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        photos: nextPhotos,
        photos_completed: true,
      })
      .eq("id", userId);

    if (updateError) {
      fail("profile photo list update failed");
    }

    const { data: afterProfile, error: afterError } = await supabase
      .from("profiles")
      .select("photos, photos_completed")
      .eq("id", userId)
      .single();

    if (afterError) {
      fail("could not verify updated profile photo list");
    }

    const afterPhotos = normalizePhotoList(afterProfile?.photos);
    if (!afterPhotos.includes(publicUrl) || afterProfile.photos_completed !== true) {
      fail("profile photo list did not include uploaded photo");
    }

    info("PASS profile: profile photo list update verified");

    await assertPublicPhotoReadable(publicUrl);
    info("PASS public-url: uploaded profile photo is readable as an image");
  } finally {
    if (uploadedPublicUrl) {
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("photos")
        .eq("id", userId)
        .single();

      const cleanedPhotos = normalizePhotoList(currentProfile?.photos).filter(
        (photo) => photo !== uploadedPublicUrl,
      );

      await supabase
        .from("profiles")
        .update({
          photos: cleanedPhotos,
          photos_completed: cleanedPhotos.length > 0,
        })
        .eq("id", userId);

      await supabase.storage.from(PROFILE_PHOTOS_BUCKET).remove([uploadPath]);
      info("PASS cleanup: removed proof photo from profile and storage");
    }
  }

  info("Photo upload live proof: PASS");
}

run().catch((error) => {
  const message = error instanceof Error ? error.message : "unknown error";
  console.error(`Photo upload live proof: FAIL - ${message}`);
  process.exit(1);
});
