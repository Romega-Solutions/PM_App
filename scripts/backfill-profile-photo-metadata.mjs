#!/usr/bin/env node
/**
 * Ticket #46: strip EXIF / GPS from profile photos that were uploaded before
 * the profile-photo-ingest Edge Function existed.
 *
 * Uses the same stripper as the Edge Function
 * (supabase/functions/_shared/photoMetadata.ts, loaded with Node 24's
 * built-in TypeScript type stripping).
 *
 * Dry run by default. Nothing is written without --apply.
 * Production only with Duane's OK. Keys come from the environment and are
 * never written to disk:
 *
 *   SUPABASE_URL=...  SUPABASE_SERVICE_ROLE_KEY=...  node scripts/backfill-profile-photo-metadata.mjs
 *   SUPABASE_URL=...  SUPABASE_SERVICE_ROLE_KEY=...  node scripts/backfill-profile-photo-metadata.mjs --apply
 *
 * Output: counts plus one line per object (path, type, action). Objects that
 * are over 10 MB, not JPEG/PNG/WebP/HEIC, or cannot be parsed are listed as
 * "review" and left untouched; delete or replace them by hand.
 */

import { createClient } from "@supabase/supabase-js";
import {
  findProfilePhotoMetadata,
  PROFILE_PHOTO_MAX_BYTES,
  sniffProfilePhotoType,
  stripProfilePhotoMetadata,
} from "../supabase/functions/_shared/photoMetadata.ts";

const BUCKET = "profile-photos";
const apply = process.argv.includes("--apply");
const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment.");
  process.exit(2);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function listAll(prefix) {
  const out = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(prefix, { limit: 1000, offset, sortBy: { column: "name", order: "asc" } });
    if (error) throw new Error(`list ${prefix || "/"} failed: ${error.message}`);
    out.push(...data);
    if (data.length < 1000) return out;
  }
}

const summary = { scanned: 0, clean: 0, stripped: 0, wouldStrip: 0, review: 0 };

for (const folder of await listAll("")) {
  if (folder.id) continue; // a file at the bucket root; not a member folder
  for (const file of await listAll(folder.name)) {
    if (!file.id) continue;
    const path = `${folder.name}/${file.name}`;
    summary.scanned += 1;

    const { data: blob, error } = await supabase.storage.from(BUCKET).download(path);
    if (error || !blob) {
      console.log(`review  ${path}  download failed`);
      summary.review += 1;
      continue;
    }

    const bytes = new Uint8Array(await blob.arrayBuffer());
    const sniffed = sniffProfilePhotoType(bytes);
    if (bytes.length > PROFILE_PHOTO_MAX_BYTES || !sniffed.ok) {
      console.log(`review  ${path}  ${sniffed.ok ? sniffed.type : sniffed.detected}  ${bytes.length} bytes`);
      summary.review += 1;
      continue;
    }

    let result;
    try {
      result = stripProfilePhotoMetadata(bytes, sniffed.type);
    } catch (stripError) {
      console.log(`review  ${path}  ${sniffed.type}  ${stripError.message}`);
      summary.review += 1;
      continue;
    }

    // Already clean when stripping changes nothing (an orientation-only EXIF
    // block written by the ingest function is rebuilt byte for byte).
    const unchanged =
      result.bytes.length === bytes.length && result.bytes.every((value, index) => value === bytes[index]);
    if (unchanged && findProfilePhotoMetadata(bytes, sniffed.type).length === 0) {
      summary.clean += 1;
      continue;
    }

    if (!apply) {
      console.log(`would   ${path}  ${sniffed.type}  remove: ${result.removed.join(", ")}`);
      summary.wouldStrip += 1;
      continue;
    }

    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, result.bytes, {
      contentType: sniffed.type,
      upsert: true,
      cacheControl: "3600",
    });
    if (uploadError) {
      console.log(`review  ${path}  upload failed: ${uploadError.message}`);
      summary.review += 1;
      continue;
    }

    console.log(`strip   ${path}  ${sniffed.type}  removed: ${result.removed.join(", ")}`);
    summary.stripped += 1;
  }
}

console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", ...summary }));
