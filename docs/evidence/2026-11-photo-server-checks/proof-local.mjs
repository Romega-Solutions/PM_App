// Ticket #46 LOCAL proof. Runs against a local Supabase stack only (refuses any other URL).
// Keys come from `supabase status -o env` (local demo keys) via the environment.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

// Run from the repo root after `npm i --no-save exifr@7.1.3`.
const require = createRequire(new URL("../../../package.json", import.meta.url));
const { createClient } = require("@supabase/supabase-js");
const sharp = require("sharp");
const exifr = require("exifr");

const URL_ = process.env.API_URL;
const ANON = process.env.ANON_KEY;
const SERVICE = process.env.SERVICE_ROLE_KEY;
if (!URL_ || !ANON || !SERVICE) throw new Error("API_URL / ANON_KEY / SERVICE_ROLE_KEY missing");
if (!/^http:\/\/(127\.0\.0\.1|localhost):/.test(URL_)) throw new Error("Refusing: not a local stack");

const fixtures = process.env.FIXTURES_DIR || path.resolve("tmp-photo-fixtures");
const read = (name) => fs.readFileSync(path.join(fixtures, name));
const admin = createClient(URL_, SERVICE, { auth: { persistSession: false } });
const results = [];
const log = (step, ok, detail) => {
  results.push({ step, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${step}${detail ? `  -- ${detail}` : ""}`);
};

async function gpsOf(buf) {
  try {
    const meta = await sharp(buf).metadata();
    if (!meta.exif) return null;
    const tiff = meta.exif.subarray(meta.exif.indexOf("Exif") === 0 ? 6 : 0);
    // Wrap the TIFF block as a minimal JPEG APP1 so exifr reads every format the same way.
    const app1 = Buffer.concat([Buffer.from([0xff, 0xe1]), Buffer.from([((tiff.length + 8) >> 8) & 0xff, (tiff.length + 8) & 0xff]), Buffer.from("Exif\0\0", "binary"), tiff]);
    const jpeg = Buffer.concat([Buffer.from([0xff, 0xd8]), app1, Buffer.from([0xff, 0xd9])]);
    const gps = await exifr.gps(jpeg);
    return gps ? `${gps.latitude.toFixed(4)},${gps.longitude.toFixed(4)}` : null;
  } catch {
    return null;
  }
}

async function member(label) {
  const email = `pm46-${label}-${Date.now()}@example.invalid`;
  const password = `Local-${label}-${Math.random().toString(36).slice(2)}!9A`;
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  const client = createClient(URL_, ANON, { auth: { persistSession: false } });
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw signInError;
  const { data: session } = await client.auth.getSession();
  return { id: data.user.id, client, token: session.session.access_token };
}

async function ingest(m, bytes, contentType) {
  const res = await fetch(`${URL_}/functions/v1/profile-photo-ingest`, {
    method: "POST",
    headers: { Authorization: `Bearer ${m.token}`, apikey: ANON, "Content-Type": contentType },
    body: bytes,
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

const owner = await member("owner");
const viewer = await member("viewer");
const blocked = await member("blocked");
const stranger = await member("stranger");

// Owner: active + verified (discoverable). Profiles rows come from the signup trigger.
for (const m of [owner, viewer, blocked, stranger]) {
  await admin.from("profiles").upsert({ id: m.id, email: `${m.id}@example.invalid`, first_name: "Proof", user_type: "filipina", is_active: true, is_verified: true });
}

// 1. Bucket is private with limits.
const { data: bucket } = await admin.storage.getBucket("profile-photos");
log("bucket private, 10 MB, 4 MIME types", bucket && bucket.public === false && bucket.file_size_limit === 10485760 && JSON.stringify(bucket.allowed_mime_types) === JSON.stringify(["image/jpeg", "image/png", "image/webp", "image/heic"]), JSON.stringify({ public: bucket?.public, file_size_limit: bucket?.file_size_limit, allowed_mime_types: bucket?.allowed_mime_types }));

// 2. Rejections.
const big = await ingest(owner, read("eleven-mb.jpg"), "image/jpeg");
log("11 MB JPEG rejected (413)", big.status === 413, `${big.status} ${JSON.stringify(big.body)}`);
const gif = await ingest(owner, read("anim.gif"), "image/gif");
log("image/gif rejected (415)", gif.status === 415, `${gif.status} ${JSON.stringify(gif.body)}`);
const gifAsJpeg = await ingest(owner, read("anim.gif"), "image/jpeg");
log("GIF bytes labelled image/jpeg rejected by magic-byte sniff (415)", gifAsJpeg.status === 415, `${gifAsJpeg.status} ${JSON.stringify(gifAsJpeg.body)}`);
const noAuth = await fetch(`${URL_}/functions/v1/profile-photo-ingest`, { method: "POST", headers: { apikey: ANON, "Content-Type": "image/jpeg" }, body: read("gps.jpg") });
log("upload without sign-in rejected (401)", noAuth.status === 401, String(noAuth.status));

// 3. Direct upload around the function is blocked by Storage RLS.
const direct = await owner.client.storage.from("profile-photos").upload(`${owner.id}/1781049600000-aaaaaaaa-2222-4222-8222-222222222222.jpg`, read("gps.jpg"), { contentType: "image/jpeg" });
log("direct member upload to profile-photos blocked", Boolean(direct.error), direct.error?.message);

// 4. EXIF/GPS stripped on ingest (JPEG, PNG, WebP).
const stored = {};
for (const [name, type] of [["gps.jpg", "image/jpeg"], ["gps.png", "image/png"], ["gps.webp", "image/webp"]]) {
  const before = await gpsOf(read(name));
  const res = await ingest(owner, read(name), type);
  if (res.status !== 200) {
    log(`${name} ingest`, false, `${res.status} ${JSON.stringify(res.body)}`);
    continue;
  }
  stored[name] = res.body.path;
  const { data: blob } = await admin.storage.from("profile-photos").download(res.body.path);
  const after = Buffer.from(await blob.arrayBuffer());
  const afterGps = await gpsOf(after);
  const meta = await sharp(after).metadata();
  log(`${name}: GPS before=${before} after=${afterGps ?? "none"}; still decodes ${meta.width}x${meta.height}${type === "image/jpeg" ? ` orientation=${meta.orientation}` : ""}`, before && !afterGps && meta.width === 640 && (type !== "image/jpeg" || meta.orientation === 6), `path=<owner>/${res.body.path.split("/")[1]} removed=${res.body.removedMetadata.join(", ")}`);
}

// 5. Old public URL no longer serves the file.
const jpgPath = stored["gps.jpg"];
const pub = await fetch(`${URL_}/storage/v1/object/public/profile-photos/${jpgPath}`);
log("public URL fails after bucket flip", pub.status >= 400, `${pub.status} ${(await pub.text()).slice(0, 120)}`);

// 6. profiles.photos write rules.
const okWrite = await owner.client.from("profiles").update({ photos: [`${URL_}/storage/v1/object/public/profile-photos/${jpgPath}`, stored["gps.png"]] }).eq("id", owner.id).select("photos").single();
log("own photos saved; old public URL normalised to a path", !okWrite.error && okWrite.data.photos[0] === jpgPath, JSON.stringify(okWrite.error ?? okWrite.data.photos.map((p) => p.replace(owner.id, "<owner>"))));
const foreign = await viewer.client.from("profiles").update({ photos: [jpgPath] }).eq("id", viewer.id);
log("another member's photo path rejected", Boolean(foreign.error), foreign.error?.message);
const ghost = await owner.client.from("profiles").update({ photos: [jpgPath, `${owner.id}/1781049600000-bbbbbbbb-2222-4222-8222-222222222222.jpg`] }).eq("id", owner.id);
log("path with no uploaded object rejected", Boolean(ghost.error), ghost.error?.message);
const external = await owner.client.from("profiles").update({ photos: ["https://tracker.example/pixel.jpg"] }).eq("id", owner.id);
log("external URL rejected", Boolean(external.error), external.error?.message);

// 7. Who can sign.
const viewerSign = await viewer.client.storage.from("profile-photos").createSignedUrl(jpgPath, 3600);
const viewerFetch = viewerSign.data ? await fetch(viewerSign.data.signedUrl) : null;
log("discoverable member's photo: viewer gets a signed URL that loads", viewerFetch?.status === 200, `${viewerFetch?.status} ${viewerFetch?.headers.get("content-type")}`);
const orphan = await viewer.client.storage.from("profile-photos").createSignedUrl(stored["gps.webp"], 3600);
log("photo not on the owner's profile cannot be signed by others", Boolean(orphan.error), orphan.error?.message);
await admin.from("user_blocks").insert({ blocker_id: owner.id, blocked_user_id: blocked.id });
const blockedSign = await blocked.client.storage.from("profile-photos").createSignedUrl(jpgPath, 3600);
log("blocked member cannot sign", Boolean(blockedSign.error), blockedSign.error?.message);
await admin.from("user_privacy_settings").upsert({ user_id: owner.id, profile_visible: false });
const hiddenSign = await stranger.client.storage.from("profile-photos").createSignedUrl(jpgPath, 3600);
log("hidden profile (profile_visible=false), no match: stranger cannot sign", Boolean(hiddenSign.error), hiddenSign.error?.message);
await admin.from("likes").insert([
  { from_user_id: owner.id, to_user_id: stranger.id, is_match: true },
  { from_user_id: stranger.id, to_user_id: owner.id, is_match: true },
]);
const matchSign = await stranger.client.storage.from("profile-photos").createSignedUrl(jpgPath, 3600);
log("hidden profile but mutual match (Messages): can sign", !matchSign.error, matchSign.error?.message);
const ownSign = await owner.client.storage.from("profile-photos").createSignedUrl(stored["gps.webp"], 3600);
log("owner can sign own photo even before it is on the profile", !ownSign.error, ownSign.error?.message);

// 8. Signed URL expiry.
// The viewer lost access when the owner hid the profile in step 7, so this
// falls back to the matched member.
const short = await viewer.client.storage.from("profile-photos").createSignedUrl(jpgPath, 3);
const shortSigner = short.error ? stranger : viewer;
const shortUrl = short.error ? (await stranger.client.storage.from("profile-photos").createSignedUrl(jpgPath, 3)).data.signedUrl : short.data.signedUrl;
const first = await fetch(shortUrl);
await new Promise((r) => setTimeout(r, 6000));
const second = await fetch(shortUrl);
const secondBody = await second.text();
log("3-second signed URL loads, then fails after expiry", first.status === 200 && second.status >= 400, `before=${first.status} after=${second.status} ${secondBody.slice(0, 120)} (signer=${shortSigner === viewer ? "viewer" : "matched member"})`);

// 9. Member delete own photo still works.
const del = await owner.client.storage.from("profile-photos").remove([stored["gps.webp"]]);
const { data: left } = await admin.storage.from("profile-photos").list(owner.id);
log("owner can delete own photo", !del.error && !left.some((f) => stored["gps.webp"].endsWith(f.name)), del.error?.message);

fs.writeFileSync(path.join(fixtures, "proof-results.json"), JSON.stringify({ ranAt: new Date().toISOString(), results }, null, 2));
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
