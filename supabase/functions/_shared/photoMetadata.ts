/**
 * Profile photo type sniffing and metadata stripping.
 *
 * Used by the profile-photo-ingest Edge Function (Deno), the one-time
 * backfill script (Node 24, native TypeScript type stripping) and Jest.
 * Keep this file dependency-free and use only erasable TypeScript syntax
 * (no enums, no namespaces, no parameter properties).
 *
 * Why no re-encode: Supabase Free Edge Functions have a 2 s CPU limit and no
 * paid image transforms. Decoding and re-encoding a 12 MP phone photo (and
 * HEIC in particular) does not fit reliably. Instead the metadata containers
 * are removed losslessly, which is where EXIF, GPS, XMP and IPTC live:
 *
 * - JPEG: drop APP1 (EXIF / XMP), APP3-APP13 and APP15 (IPTC, Photoshop, maker
 *   data), APP2 MPF (multi-picture index), COM comments, and every byte after
 *   the first image's EOI (extra preview / depth / gain-map images that carry
 *   their own EXIF). Keep APP0 (JFIF), APP2 ICC_PROFILE and APP14 (Adobe colour
 *   transform). If the photo had an EXIF Orientation other than 1, write back a
 *   new 34-byte EXIF block that holds only that one tag, so the photo does not
 *   turn sideways.
 * - PNG: drop eXIf, tEXt, zTXt, iTXt and tIME chunks and anything after IEND.
 * - WebP: drop EXIF and "XMP " chunks, clear the VP8X EXIF/XMP flags, fix the
 *   RIFF size and drop anything after the RIFF payload.
 * - HEIC: the file structure has absolute byte offsets, so items cannot be
 *   removed without rewriting the iloc table. Instead every Exif item payload
 *   is overwritten in place with an empty EXIF block (valid TIFF header, zero
 *   tags) followed by zero bytes, and every XMP item (mime
 *   application/rdf+xml) is overwritten with zero bytes. Orientation in HEIC
 *   lives in the irot/imir properties, not EXIF, so it is kept. Output stays
 *   HEIC (image/heic, .heic). HEIC image sequences (msf1/hevc brands) are
 *   rejected.
 */

export const PROFILE_PHOTO_MAX_BYTES = 10 * 1024 * 1024;

export type ProfilePhotoType = "image/jpeg" | "image/png" | "image/webp" | "image/heic";

export const PROFILE_PHOTO_TYPES: readonly ProfilePhotoType[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
];

export const PROFILE_PHOTO_EXTENSIONS: Record<ProfilePhotoType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
};

/** Declared Content-Type values the ingest accepts (aliases map to the sniffed type). */
export const PROFILE_PHOTO_DECLARED_TYPES: readonly string[] = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/octet-stream",
];

export type SniffResult =
  | { ok: true; type: ProfilePhotoType }
  | { ok: false; detected: string };

export type StripResult = {
  bytes: Uint8Array;
  type: ProfilePhotoType;
  removed: string[];
  keptOrientation: number | null;
};

export class PhotoMetadataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PhotoMetadataError";
  }
}

const HEIC_BRANDS = new Set(["heic", "heix", "heim", "heis"]);
const HEIC_SEQUENCE_BRANDS = new Set(["hevc", "hevx", "msf1"]);
const AVIF_BRANDS = new Set(["avif", "avis"]);

function ascii(bytes: Uint8Array, start: number, length: number): string {
  let out = "";
  for (let i = start; i < start + length && i < bytes.length; i += 1) {
    out += String.fromCharCode(bytes[i]);
  }
  return out;
}

function readU16BE(bytes: Uint8Array, offset: number): number {
  if (offset + 2 > bytes.length) throw new PhotoMetadataError("Truncated photo");
  return (bytes[offset] << 8) | bytes[offset + 1];
}

function readU32BE(bytes: Uint8Array, offset: number): number {
  if (offset + 4 > bytes.length) throw new PhotoMetadataError("Truncated photo");
  return (
    bytes[offset] * 0x1000000 +
    ((bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3])
  );
}

function readU32LE(bytes: Uint8Array, offset: number): number {
  if (offset + 4 > bytes.length) throw new PhotoMetadataError("Truncated photo");
  return (
    bytes[offset + 3] * 0x1000000 +
    ((bytes[offset + 2] << 16) | (bytes[offset + 1] << 8) | bytes[offset])
  );
}

function writeU32LE(bytes: Uint8Array, offset: number, value: number): void {
  bytes[offset] = value & 0xff;
  bytes[offset + 1] = (value >>> 8) & 0xff;
  bytes[offset + 2] = (value >>> 16) & 0xff;
  bytes[offset + 3] = (value >>> 24) & 0xff;
}

function readUIntBE(bytes: Uint8Array, offset: number, size: number): number {
  if (size === 0) return 0;
  if (size === 4) return readU32BE(bytes, offset);
  if (size === 8) {
    const high = readU32BE(bytes, offset);
    if (high !== 0) throw new PhotoMetadataError("Photo offset too large");
    return readU32BE(bytes, offset + 4);
  }
  if (size === 2) return readU16BE(bytes, offset);
  throw new PhotoMetadataError("Unsupported HEIC field size");
}

function concat(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

/** Detect the real file type from magic bytes. The declared MIME type is not trusted. */
export function sniffProfilePhotoType(bytes: Uint8Array): SniffResult {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { ok: true, type: "image/jpeg" };
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    ascii(bytes, 1, 3) === "PNG" &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { ok: true, type: "image/png" };
  }

  if (bytes.length >= 12 && ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP") {
    return { ok: true, type: "image/webp" };
  }

  if (bytes.length >= 6 && (ascii(bytes, 0, 6) === "GIF87a" || ascii(bytes, 0, 6) === "GIF89a")) {
    return { ok: false, detected: "image/gif" };
  }

  if (bytes.length >= 16 && ascii(bytes, 4, 4) === "ftyp") {
    const boxSize = readU32BE(bytes, 0);
    const end = Math.min(boxSize, bytes.length);
    const major = ascii(bytes, 8, 4);
    const brands = [major];
    for (let offset = 16; offset + 4 <= end; offset += 4) {
      brands.push(ascii(bytes, offset, 4));
    }

    if (AVIF_BRANDS.has(major)) {
      return { ok: false, detected: "image/avif" };
    }

    if (HEIC_SEQUENCE_BRANDS.has(major)) {
      return { ok: false, detected: "image/heic-sequence" };
    }

    if (brands.some((brand) => HEIC_BRANDS.has(brand))) {
      return { ok: true, type: "image/heic" };
    }

    return { ok: false, detected: `video-or-iso-bmff:${major.replace(/[^a-z0-9]/gi, "")}` };
  }

  return { ok: false, detected: "unknown" };
}

// ---------------------------------------------------------------------------
// JPEG
// ---------------------------------------------------------------------------

function readExifOrientation(segment: Uint8Array): number | null {
  // segment = "Exif\0\0" + TIFF
  if (segment.length < 6 + 8 || ascii(segment, 0, 4) !== "Exif") return null;
  const tiff = 6;
  const order = ascii(segment, tiff, 2);
  const little = order === "II";
  if (!little && order !== "MM") return null;

  const u16 = (offset: number) => {
    if (offset + 2 > segment.length) return null;
    return little
      ? segment[offset] | (segment[offset + 1] << 8)
      : (segment[offset] << 8) | segment[offset + 1];
  };
  const u32 = (offset: number) => {
    if (offset + 4 > segment.length) return null;
    return little
      ? (segment[offset] | (segment[offset + 1] << 8) | (segment[offset + 2] << 16)) +
          segment[offset + 3] * 0x1000000
      : segment[offset] * 0x1000000 +
          ((segment[offset + 1] << 16) | (segment[offset + 2] << 8) | segment[offset + 3]);
  };

  const ifdOffset = u32(tiff + 4);
  if (ifdOffset === null) return null;
  const ifd = tiff + ifdOffset;
  const count = u16(ifd);
  if (count === null || count > 512) return null;

  for (let i = 0; i < count; i += 1) {
    const entry = ifd + 2 + i * 12;
    const tag = u16(entry);
    if (tag === null) return null;
    if (tag === 0x0112) {
      const type = u16(entry + 2);
      if (type !== 3) return null;
      const value = u16(entry + 8);
      return value !== null && value >= 1 && value <= 8 ? value : null;
    }
  }

  return null;
}

/** A complete APP1 segment holding only the Orientation tag (big-endian TIFF). */
function buildOrientationOnlyExifSegment(orientation: number): Uint8Array {
  const payload = [
    0x45, 0x78, 0x69, 0x66, 0x00, 0x00, // "Exif\0\0"
    0x4d, 0x4d, 0x00, 0x2a, 0x00, 0x00, 0x00, 0x08, // "MM", 42, IFD0 at 8
    0x00, 0x01, // 1 entry
    0x01, 0x12, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01, // Orientation, SHORT, count 1
    0x00, orientation & 0xff, 0x00, 0x00, // value
    0x00, 0x00, 0x00, 0x00, // no next IFD
  ];
  const length = payload.length + 2;
  return new Uint8Array([0xff, 0xe1, (length >> 8) & 0xff, length & 0xff, ...payload]);
}

function describeJpegSegment(marker: number, segment: Uint8Array): string | null {
  // Returns a label when the segment must be removed, null to keep it.
  if (marker === 0xfe) return "JPEG COM";
  if (marker === 0xe0) return null; // JFIF / JFXX
  if (marker === 0xee) return null; // Adobe colour transform
  if (marker === 0xe2) {
    if (ascii(segment, 0, 12) === "ICC_PROFILE\0") return null;
    if (ascii(segment, 0, 4) === "MPF\0") return "JPEG APP2 MPF";
    return "JPEG APP2";
  }
  if (marker === 0xe1) {
    if (ascii(segment, 0, 4) === "Exif") return "JPEG APP1 EXIF";
    if (ascii(segment, 0, 4) === "http") return "JPEG APP1 XMP";
    return "JPEG APP1";
  }
  if (marker === 0xed) return "JPEG APP13 IPTC/Photoshop";
  if (marker >= 0xe3 && marker <= 0xef) {
    return `JPEG APP${marker - 0xe0}`;
  }
  return null;
}

function stripJpeg(bytes: Uint8Array): StripResult {
  const parts: Uint8Array[] = [bytes.subarray(0, 2)];
  const removed: string[] = [];
  let orientation: number | null = null;
  let insertAt = 1; // index in parts where an orientation segment goes
  let offset = 2;
  let sawEoi = false;

  while (offset < bytes.length) {
    if (bytes[offset] !== 0xff) {
      throw new PhotoMetadataError("Malformed JPEG");
    }

    // Skip fill bytes.
    let markerOffset = offset;
    while (markerOffset < bytes.length && bytes[markerOffset] === 0xff) markerOffset += 1;
    if (markerOffset >= bytes.length) throw new PhotoMetadataError("Truncated JPEG");
    const marker = bytes[markerOffset];
    const segmentStart = markerOffset - 1;

    if (marker === 0xd9) {
      parts.push(bytes.subarray(segmentStart, markerOffset + 1));
      sawEoi = true;
      offset = markerOffset + 1;
      break;
    }

    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      parts.push(bytes.subarray(segmentStart, markerOffset + 1));
      offset = markerOffset + 1;
      continue;
    }

    const length = readU16BE(bytes, markerOffset + 1);
    if (length < 2) throw new PhotoMetadataError("Malformed JPEG segment");
    const dataStart = markerOffset + 3;
    const segmentEnd = markerOffset + 1 + length;
    if (segmentEnd > bytes.length) throw new PhotoMetadataError("Truncated JPEG segment");
    const data = bytes.subarray(dataStart, segmentEnd);

    if (marker === 0xda) {
      // Start of scan: copy header, then entropy-coded data up to the next real marker.
      let scan = segmentEnd;
      while (scan < bytes.length) {
        if (bytes[scan] === 0xff) {
          const next = bytes[scan + 1];
          if (next === 0x00 || (next >= 0xd0 && next <= 0xd7) || next === 0xff) {
            scan += next === 0xff ? 1 : 2;
            continue;
          }
          break;
        }
        scan += 1;
      }
      if (scan >= bytes.length) throw new PhotoMetadataError("Truncated JPEG scan");
      parts.push(bytes.subarray(segmentStart, scan));
      offset = scan;
      continue;
    }

    const removeLabel = describeJpegSegment(marker, data);
    if (removeLabel) {
      if (marker === 0xe1 && orientation === null) {
        orientation = readExifOrientation(data);
      }
      removed.push(removeLabel);
    } else {
      parts.push(bytes.subarray(segmentStart, segmentEnd));
      if (marker === 0xe0 && parts.length - 1 === insertAt) {
        insertAt = parts.length;
      }
    }

    offset = segmentEnd;
  }

  if (!sawEoi) throw new PhotoMetadataError("JPEG has no end marker");
  if (offset < bytes.length) removed.push(`JPEG trailing data (${bytes.length - offset} bytes)`);

  let keptOrientation: number | null = null;
  if (orientation !== null && orientation !== 1) {
    parts.splice(insertAt, 0, buildOrientationOnlyExifSegment(orientation));
    keptOrientation = orientation;
  }

  return { bytes: concat(parts), type: "image/jpeg", removed, keptOrientation };
}

// ---------------------------------------------------------------------------
// PNG
// ---------------------------------------------------------------------------

const PNG_METADATA_CHUNKS = new Set(["eXIf", "tEXt", "zTXt", "iTXt", "tIME"]);

function stripPng(bytes: Uint8Array): StripResult {
  const parts: Uint8Array[] = [bytes.subarray(0, 8)];
  const removed: string[] = [];
  let offset = 8;
  let sawEnd = false;

  while (offset + 12 <= bytes.length) {
    const length = readU32BE(bytes, offset);
    const type = ascii(bytes, offset + 4, 4);
    const end = offset + 12 + length;
    if (end > bytes.length) throw new PhotoMetadataError("Truncated PNG chunk");

    if (PNG_METADATA_CHUNKS.has(type)) {
      removed.push(`PNG ${type}`);
    } else {
      parts.push(bytes.subarray(offset, end));
    }

    offset = end;
    if (type === "IEND") {
      sawEnd = true;
      break;
    }
  }

  if (!sawEnd) throw new PhotoMetadataError("PNG has no IEND chunk");
  if (offset < bytes.length) removed.push(`PNG trailing data (${bytes.length - offset} bytes)`);

  return { bytes: concat(parts), type: "image/png", removed, keptOrientation: null };
}

// ---------------------------------------------------------------------------
// WebP
// ---------------------------------------------------------------------------

function stripWebp(bytes: Uint8Array): StripResult {
  const riffSize = readU32LE(bytes, 4);
  const riffEnd = 8 + riffSize;
  if (riffEnd > bytes.length || riffSize < 4) throw new PhotoMetadataError("Truncated WebP");

  const chunks: Uint8Array[] = [];
  const removed: string[] = [];
  let offset = 12;

  while (offset + 8 <= riffEnd) {
    const fourcc = ascii(bytes, offset, 4);
    const size = readU32LE(bytes, offset + 4);
    const end = offset + 8 + size + (size % 2);
    if (offset + 8 + size > riffEnd) throw new PhotoMetadataError("Truncated WebP chunk");

    if (fourcc === "EXIF" || fourcc === "XMP ") {
      removed.push(`WebP ${fourcc.trim()}`);
    } else {
      const chunk = bytes.slice(offset, Math.min(end, riffEnd));
      if (fourcc === "VP8X" && chunk.length >= 9) {
        // Flags byte: ICC 0x20, alpha 0x10, EXIF 0x08, XMP 0x04, animation 0x02.
        chunk[8] = chunk[8] & ~0x0c;
      }
      chunks.push(chunk);
    }

    offset = end;
  }

  if (riffEnd < bytes.length) removed.push(`WebP trailing data (${bytes.length - riffEnd} bytes)`);

  const header = bytes.slice(0, 12);
  const body = concat(chunks);
  writeU32LE(header, 4, body.length + 4);

  return { bytes: concat([header, body]), type: "image/webp", removed, keptOrientation: null };
}

// ---------------------------------------------------------------------------
// HEIC (ISO BMFF)
// ---------------------------------------------------------------------------

type Box = { type: string; start: number; dataStart: number; end: number };

function readBoxes(bytes: Uint8Array, start: number, end: number): Box[] {
  const boxes: Box[] = [];
  let offset = start;

  while (offset + 8 <= end) {
    let size = readU32BE(bytes, offset);
    const type = ascii(bytes, offset + 4, 4);
    let header = 8;

    if (size === 1) {
      size = readUIntBE(bytes, offset + 8, 8);
      header = 16;
    } else if (size === 0) {
      size = end - offset;
    }

    if (size < header || offset + size > end) {
      throw new PhotoMetadataError("Malformed HEIC box");
    }

    boxes.push({ type, start: offset, dataStart: offset + header, end: offset + size });
    offset += size;
  }

  return boxes;
}

type HeicItemInfo = { id: number; type: string; contentType: string | null };

function readNullTerminated(bytes: Uint8Array, offset: number, end: number): [string, number] {
  let cursor = offset;
  while (cursor < end && bytes[cursor] !== 0) cursor += 1;
  return [ascii(bytes, offset, cursor - offset), Math.min(cursor + 1, end)];
}

function parseIinf(bytes: Uint8Array, box: Box): HeicItemInfo[] {
  const version = bytes[box.dataStart];
  let offset = box.dataStart + 4;
  offset += version === 0 ? 2 : 4; // entry count, the infe boxes follow

  const items: HeicItemInfo[] = [];
  for (const infe of readBoxes(bytes, offset, box.end)) {
    if (infe.type !== "infe") continue;
    const infeVersion = bytes[infe.dataStart];
    let cursor = infe.dataStart + 4;
    if (infeVersion < 2) continue; // v0/v1 items have no item_type; not used by HEIC stills

    const id = infeVersion === 2 ? readU16BE(bytes, cursor) : readU32BE(bytes, cursor);
    cursor += infeVersion === 2 ? 2 : 4;
    cursor += 2; // protection index
    const type = ascii(bytes, cursor, 4);
    cursor += 4;
    const [, afterName] = readNullTerminated(bytes, cursor, infe.end);
    let contentType: string | null = null;
    if (type === "mime") {
      [contentType] = readNullTerminated(bytes, afterName, infe.end);
    }
    items.push({ id, type, contentType });
  }

  return items;
}

type HeicExtent = { method: number; offset: number; length: number };

function parseIloc(bytes: Uint8Array, box: Box): Map<number, HeicExtent[]> {
  const version = bytes[box.dataStart];
  let offset = box.dataStart + 4;
  const sizes1 = bytes[offset];
  const sizes2 = bytes[offset + 1];
  offset += 2;
  const offsetSize = sizes1 >> 4;
  const lengthSize = sizes1 & 0x0f;
  const baseOffsetSize = sizes2 >> 4;
  const indexSize = version === 1 || version === 2 ? sizes2 & 0x0f : 0;

  const itemCount = version < 2 ? readU16BE(bytes, offset) : readU32BE(bytes, offset);
  offset += version < 2 ? 2 : 4;

  const map = new Map<number, HeicExtent[]>();
  for (let i = 0; i < itemCount; i += 1) {
    const id = version < 2 ? readU16BE(bytes, offset) : readU32BE(bytes, offset);
    offset += version < 2 ? 2 : 4;
    let method = 0;
    if (version === 1 || version === 2) {
      method = readU16BE(bytes, offset) & 0x0f;
      offset += 2;
    }
    offset += 2; // data reference index
    const baseOffset = readUIntBE(bytes, offset, baseOffsetSize);
    offset += baseOffsetSize;
    const extentCount = readU16BE(bytes, offset);
    offset += 2;

    const extents: HeicExtent[] = [];
    for (let e = 0; e < extentCount; e += 1) {
      offset += indexSize;
      const extentOffset = readUIntBE(bytes, offset, offsetSize);
      offset += offsetSize;
      const extentLength = readUIntBE(bytes, offset, lengthSize);
      offset += lengthSize;
      extents.push({ method, offset: baseOffset + extentOffset, length: extentLength });
    }
    map.set(id, extents);
  }

  return map;
}

/** Empty EXIF payload for HEIC: 4-byte TIFF header offset + big-endian TIFF with 0 tags. */
const HEIC_EMPTY_EXIF = new Uint8Array([
  0x00, 0x00, 0x00, 0x00, // exif_tiff_header_offset = 0
  0x4d, 0x4d, 0x00, 0x2a, 0x00, 0x00, 0x00, 0x08, // "MM", 42, IFD0 at 8
  0x00, 0x00, // 0 entries
  0x00, 0x00, 0x00, 0x00, // no next IFD
]);

function stripHeic(bytes: Uint8Array): StripResult {
  const out = bytes.slice();
  const removed: string[] = [];
  const top = readBoxes(out, 0, out.length);

  if (top.some((box) => box.type === "moov")) {
    throw new PhotoMetadataError("HEIC sequences are not supported");
  }

  const meta = top.find((box) => box.type === "meta");
  if (!meta) throw new PhotoMetadataError("HEIC has no meta box");

  const children = readBoxes(out, meta.dataStart + 4, meta.end);
  const iinf = children.find((box) => box.type === "iinf");
  const iloc = children.find((box) => box.type === "iloc");
  const idat = children.find((box) => box.type === "idat");
  if (!iinf || !iloc) throw new PhotoMetadataError("HEIC has no item tables");

  const items = parseIinf(out, iinf);
  const locations = parseIloc(out, iloc);

  for (const item of items) {
    const isExif = item.type === "Exif";
    const isXmp = item.type === "mime" && item.contentType === "application/rdf+xml";
    if (!isExif && !isXmp) continue;

    const extents = locations.get(item.id);
    if (!extents || extents.length === 0) {
      throw new PhotoMetadataError("HEIC metadata item has no location");
    }

    let wroteStub = false;
    for (const extent of extents) {
      if (extent.method === 2) throw new PhotoMetadataError("HEIC item references are not supported");
      if (extent.length === 0) throw new PhotoMetadataError("HEIC open-ended extents are not supported");

      let start = extent.offset;
      if (extent.method === 1) {
        if (!idat) throw new PhotoMetadataError("HEIC idat is missing");
        start = idat.dataStart + extent.offset;
      }
      const end = start + extent.length;
      if (start < 0 || end > out.length) throw new PhotoMetadataError("HEIC metadata is out of range");

      out.fill(0, start, end);
      if (isExif && !wroteStub && extent.length >= HEIC_EMPTY_EXIF.length) {
        out.set(HEIC_EMPTY_EXIF, start);
        wroteStub = true;
      }
    }

    removed.push(isExif ? `HEIC Exif item ${item.id}` : `HEIC XMP item ${item.id}`);
  }

  return { bytes: out, type: "image/heic", removed, keptOrientation: null };
}

/**
 * Remove EXIF / GPS / XMP / IPTC from a profile photo. Throws
 * PhotoMetadataError when the file cannot be parsed safely (fail closed: the
 * caller must reject the upload instead of storing the original bytes).
 */
export function stripProfilePhotoMetadata(bytes: Uint8Array, type: ProfilePhotoType): StripResult {
  switch (type) {
    case "image/jpeg":
      return stripJpeg(bytes);
    case "image/png":
      return stripPng(bytes);
    case "image/webp":
      return stripWebp(bytes);
    case "image/heic":
      return stripHeic(bytes);
    default:
      throw new PhotoMetadataError("Unsupported photo type");
  }
}

/**
 * Lists metadata blocks still present. Used after stripping as a fail-closed
 * self-check and by tests. The orientation-only JPEG EXIF block and the empty
 * HEIC EXIF stub are reported as allowed (not listed).
 */
export function findProfilePhotoMetadata(bytes: Uint8Array, type: ProfilePhotoType): string[] {
  const found: string[] = [];

  if (type === "image/jpeg") {
    let offset = 2;
    while (offset + 4 <= bytes.length && bytes[offset] === 0xff) {
      const marker = bytes[offset + 1];
      if (marker === 0xda || marker === 0xd9) break;
      const length = readU16BE(bytes, offset + 2);
      const data = bytes.subarray(offset + 4, offset + 2 + length);
      const label = describeJpegSegment(marker, data);
      if (label) {
        const orientationOnly =
          marker === 0xe1 && length === 34 && readExifOrientation(data) !== null;
        if (!orientationOnly) found.push(label);
      }
      offset += 2 + length;
    }
    return found;
  }

  if (type === "image/png") {
    let offset = 8;
    while (offset + 12 <= bytes.length) {
      const length = readU32BE(bytes, offset);
      const chunkType = ascii(bytes, offset + 4, 4);
      if (PNG_METADATA_CHUNKS.has(chunkType)) found.push(`PNG ${chunkType}`);
      offset += 12 + length;
      if (chunkType === "IEND") break;
    }
    return found;
  }

  if (type === "image/webp") {
    let offset = 12;
    while (offset + 8 <= bytes.length) {
      const fourcc = ascii(bytes, offset, 4);
      const size = readU32LE(bytes, offset + 4);
      if (fourcc === "EXIF" || fourcc === "XMP ") found.push(`WebP ${fourcc.trim()}`);
      offset += 8 + size + (size % 2);
    }
    return found;
  }

  // HEIC: any Exif item whose payload is not the empty stub, or any non-zero XMP item.
  const top = readBoxes(bytes, 0, bytes.length);
  const meta = top.find((box) => box.type === "meta");
  if (!meta) return found;
  const children = readBoxes(bytes, meta.dataStart + 4, meta.end);
  const iinf = children.find((box) => box.type === "iinf");
  const iloc = children.find((box) => box.type === "iloc");
  const idat = children.find((box) => box.type === "idat");
  if (!iinf || !iloc) return found;
  const locations = parseIloc(bytes, iloc);

  for (const item of parseIinf(bytes, iinf)) {
    const isExif = item.type === "Exif";
    const isXmp = item.type === "mime" && item.contentType === "application/rdf+xml";
    if (!isExif && !isXmp) continue;

    for (const extent of locations.get(item.id) ?? []) {
      const start = extent.method === 1 && idat ? idat.dataStart + extent.offset : extent.offset;
      const payload = bytes.subarray(start, start + extent.length);
      // Allowed: all zero bytes, or (Exif only) the empty stub followed by zero bytes.
      const hasStub =
        isExif &&
        payload.length >= HEIC_EMPTY_EXIF.length &&
        HEIC_EMPTY_EXIF.every((value, index) => payload[index] === value);
      const rest = hasStub ? payload.subarray(HEIC_EMPTY_EXIF.length) : payload;
      if (!rest.every((value) => value === 0)) {
        found.push(isExif ? `HEIC Exif item ${item.id}` : `HEIC XMP item ${item.id}`);
      }
    }
  }

  return found;
}
