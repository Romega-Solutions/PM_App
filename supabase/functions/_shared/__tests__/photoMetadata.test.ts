import {
  findProfilePhotoMetadata,
  PhotoMetadataError,
  PROFILE_PHOTO_MAX_BYTES,
  sniffProfilePhotoType,
  stripProfilePhotoMetadata,
} from "../photoMetadata.ts";

const SECRET = "GPS-SECRET-14.5995N-120.9842E";

function bytesOf(...parts: (number[] | string | Uint8Array)[]): Uint8Array {
  const arrays = parts.map((part) =>
    typeof part === "string"
      ? new Uint8Array([...part].map((char) => char.charCodeAt(0)))
      : part instanceof Uint8Array
        ? part
        : new Uint8Array(part),
  );
  const out = new Uint8Array(arrays.reduce((sum, a) => sum + a.length, 0));
  let offset = 0;
  for (const a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return out;
}

function u16be(value: number) {
  return [(value >> 8) & 0xff, value & 0xff];
}
function u32be(value: number) {
  return [(value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff];
}
function u32le(value: number) {
  return [value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff];
}

function contains(haystack: Uint8Array, needle: string): boolean {
  const text = Array.from(haystack, (b) => String.fromCharCode(b)).join("");
  return text.includes(needle);
}

function jpegSegment(marker: number, payload: Uint8Array): Uint8Array {
  return bytesOf([0xff, marker], u16be(payload.length + 2), payload);
}

/** EXIF (big-endian) with Orientation and a GPS IFD holding the secret. */
function exifPayload(orientation: number): Uint8Array {
  // TIFF header (8) + IFD0: count(2) + 2 entries(24) + next(4) = 38, GPS IFD at 38.
  const gpsIfdOffset = 8 + 2 + 24 + 4;
  const secretOffset = gpsIfdOffset + 2 + 12 + 4;
  const tiff = bytesOf(
    "MM",
    [0x00, 0x2a],
    u32be(8),
    u16be(2),
    u16be(0x0112), u16be(3), u32be(1), u16be(orientation), [0, 0],
    u16be(0x8825), u16be(4), u32be(1), u32be(gpsIfdOffset),
    u32be(0),
    u16be(1),
    u16be(0x0002), u16be(2), u32be(SECRET.length), u32be(secretOffset),
    u32be(0),
    SECRET,
  );
  return bytesOf("Exif", [0, 0], tiff);
}

function buildJpeg(orientation = 6): Uint8Array {
  return bytesOf(
    [0xff, 0xd8],
    jpegSegment(0xe0, bytesOf("JFIF", [0, 1, 1, 0, 0, 1, 0, 1, 0, 0])),
    jpegSegment(0xe1, exifPayload(orientation)),
    jpegSegment(0xe1, bytesOf("http://ns.adobe.com/xap/1.0/", [0], `<x:xmpmeta>${SECRET}</x:xmpmeta>`)),
    jpegSegment(0xe2, bytesOf("ICC_PROFILE", [0], [1, 1], "fake-icc")),
    jpegSegment(0xe2, bytesOf("MPF", [0], "index")),
    jpegSegment(0xed, bytesOf("Photoshop 3.0", [0], SECRET)),
    jpegSegment(0xfe, bytesOf(`comment ${SECRET}`)),
    jpegSegment(0xdb, bytesOf([0], new Array(64).fill(1))),
    jpegSegment(0xda, bytesOf([1, 1, 0, 0, 0x3f, 0])),
    [0x12, 0xff, 0x00, 0x34, 0xff, 0xd0, 0x56, 0x78],
    [0xff, 0xd9],
    // A second embedded image (like an iPhone/Samsung preview) with its own EXIF.
    [0xff, 0xd8],
    jpegSegment(0xe1, exifPayload(1)),
    [0xff, 0xd9],
  );
}

function pngChunk(type: string, data: Uint8Array): Uint8Array {
  return bytesOf(u32be(data.length), type, data, [0, 0, 0, 0]);
}

function buildPng(): Uint8Array {
  return bytesOf(
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    pngChunk("IHDR", bytesOf(u32be(1), u32be(1), [8, 6, 0, 0, 0])),
    pngChunk("tEXt", bytesOf("Comment", [0], SECRET)),
    pngChunk("eXIf", exifPayload(1).subarray(6)),
    pngChunk("iCCP", bytesOf("icc", [0, 0], "x")),
    pngChunk("IDAT", bytesOf([1, 2, 3, 4])),
    pngChunk("IEND", new Uint8Array()),
    SECRET,
  );
}

function webpChunk(fourcc: string, data: Uint8Array): Uint8Array {
  return bytesOf(fourcc, u32le(data.length), data, data.length % 2 ? [0] : []);
}

function buildWebp(): Uint8Array {
  const body = bytesOf(
    "WEBP",
    webpChunk("VP8X", bytesOf([0x10 | 0x08 | 0x04, 0, 0, 0], [0, 0, 0], [0, 0, 0])),
    webpChunk("VP8 ", bytesOf([9, 9, 9])), // odd size: padded
    webpChunk("EXIF", exifPayload(1).subarray(6)),
    webpChunk("XMP ", bytesOf(`<x:xmpmeta>${SECRET}</x:xmpmeta>`)),
  );
  return bytesOf("RIFF", u32le(body.length), body, SECRET);
}

function box(type: string, ...payload: (number[] | string | Uint8Array)[]): Uint8Array {
  const data = bytesOf(...payload);
  return bytesOf(u32be(data.length + 8), type, data);
}

function buildHeic(): { bytes: Uint8Array; imageStart: number; imageData: Uint8Array; exifStart: number; exifLength: number } {
  const imageData = bytesOf([0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff, 0x11, 0x22]);
  const exifData = bytesOf(u32be(6), "Exif", [0, 0], exifPayload(1).subarray(6));
  const xmpData = bytesOf(`<x:xmpmeta>${SECRET}</x:xmpmeta>`);

  const ftyp = box("ftyp", "heic", u32be(0), "mif1", "heic");
  const build = (imageOffset: number, exifOffset: number, xmpOffset: number) => {
    const hdlr = box("hdlr", u32be(0), u32be(0), "pict", u32be(0), u32be(0), u32be(0), [0]);
    const iinf = box(
      "iinf",
      u32be(0),
      u16be(3),
      box("infe", [2, 0, 0, 0], u16be(1), u16be(0), "hvc1", [0]),
      box("infe", [2, 0, 0, 0], u16be(2), u16be(0), "Exif", [0]),
      box("infe", [2, 0, 0, 0], u16be(3), u16be(0), "mime", [0], "application/rdf+xml", [0]),
    );
    const iloc = box(
      "iloc",
      u32be(0), // version 0
      [0x44, 0x00], // offset_size 4, length_size 4, base_offset_size 0
      u16be(3),
      u16be(1), u16be(0), u16be(1), u32be(imageOffset), u32be(imageData.length),
      u16be(2), u16be(0), u16be(1), u32be(exifOffset), u32be(exifData.length),
      u16be(3), u16be(0), u16be(1), u32be(xmpOffset), u32be(xmpData.length),
    );
    const meta = box("meta", u32be(0), hdlr, iinf, iloc);
    return { meta };
  };

  // Two passes so the iloc offsets point into mdat.
  const first = build(0, 0, 0);
  const mdatStart = ftyp.length + first.meta.length + 8;
  const imageStart = mdatStart;
  const exifStart = imageStart + imageData.length;
  const xmpStart = exifStart + exifData.length;
  const { meta } = build(imageStart, exifStart, xmpStart);
  const mdat = box("mdat", imageData, exifData, xmpData);

  return { bytes: bytesOf(ftyp, meta, mdat), imageStart, imageData, exifStart, exifLength: exifData.length };
}

describe("sniffProfilePhotoType", () => {
  it("detects the four allowed types from magic bytes", () => {
    expect(sniffProfilePhotoType(buildJpeg())).toEqual({ ok: true, type: "image/jpeg" });
    expect(sniffProfilePhotoType(buildPng())).toEqual({ ok: true, type: "image/png" });
    expect(sniffProfilePhotoType(buildWebp())).toEqual({ ok: true, type: "image/webp" });
    expect(sniffProfilePhotoType(buildHeic().bytes)).toEqual({ ok: true, type: "image/heic" });
  });

  it("rejects GIF, AVIF, HEIC sequences and unknown data", () => {
    expect(sniffProfilePhotoType(bytesOf("GIF89a", [1, 0, 1, 0]))).toEqual({ ok: false, detected: "image/gif" });
    expect(sniffProfilePhotoType(box("ftyp", "avif", u32be(0), "mif1", "avif"))).toEqual({
      ok: false,
      detected: "image/avif",
    });
    expect(sniffProfilePhotoType(box("ftyp", "msf1", u32be(0), "heic", "msf1"))).toEqual({
      ok: false,
      detected: "image/heic-sequence",
    });
    expect(sniffProfilePhotoType(bytesOf("%PDF-1.7 hello"))).toEqual({ ok: false, detected: "unknown" });
  });

  it("uses a 10 MB cap", () => {
    expect(PROFILE_PHOTO_MAX_BYTES).toBe(10485760);
  });
});

describe("stripProfilePhotoMetadata", () => {
  it("removes JPEG EXIF/GPS, XMP, IPTC, comments, MPF and trailing images but keeps JFIF, ICC and orientation", () => {
    const input = buildJpeg(6);
    expect(findProfilePhotoMetadata(input, "image/jpeg").length).toBeGreaterThan(0);

    const result = stripProfilePhotoMetadata(input, "image/jpeg");

    expect(contains(result.bytes, SECRET)).toBe(false);
    expect(contains(result.bytes, "http://ns.adobe.com")).toBe(false);
    expect(contains(result.bytes, "JFIF")).toBe(true);
    expect(contains(result.bytes, "ICC_PROFILE")).toBe(true);
    expect(result.keptOrientation).toBe(6);
    expect(result.removed).toEqual(
      expect.arrayContaining([
        "JPEG APP1 EXIF",
        "JPEG APP1 XMP",
        "JPEG APP2 MPF",
        "JPEG APP13 IPTC/Photoshop",
        "JPEG COM",
      ]),
    );
    expect(result.removed.some((label) => label.startsWith("JPEG trailing data"))).toBe(true);
    expect(Array.from(result.bytes.subarray(0, 2))).toEqual([0xff, 0xd8]);
    expect(Array.from(result.bytes.subarray(-2))).toEqual([0xff, 0xd9]);
    // Entropy-coded data, including byte stuffing and restart markers, is untouched.
    expect(contains(result.bytes, String.fromCharCode(0x12, 0xff, 0x00, 0x34, 0xff, 0xd0, 0x56, 0x78))).toBe(true);
    expect(findProfilePhotoMetadata(result.bytes, "image/jpeg")).toEqual([]);
    // The orientation-only block sits right after JFIF and has no GPS pointer.
    const jfifEnd = 2 + 2 + 16;
    expect(Array.from(result.bytes.subarray(jfifEnd, jfifEnd + 2))).toEqual([0xff, 0xe1]);
    expect(contains(result.bytes, String.fromCharCode(0x88, 0x25))).toBe(false);
  });

  it("does not add an EXIF block when orientation is already normal", () => {
    const result = stripProfilePhotoMetadata(buildJpeg(1), "image/jpeg");

    expect(result.keptOrientation).toBeNull();
    expect(contains(result.bytes, "Exif")).toBe(false);
  });

  it("fails closed on a JPEG with no end marker", () => {
    const input = buildJpeg().subarray(0, 200);

    expect(() => stripProfilePhotoMetadata(input, "image/jpeg")).toThrow(PhotoMetadataError);
  });

  it("removes PNG text, eXIf and tIME chunks and trailing data", () => {
    const result = stripProfilePhotoMetadata(buildPng(), "image/png");

    expect(contains(result.bytes, SECRET)).toBe(false);
    expect(contains(result.bytes, "eXIf")).toBe(false);
    expect(contains(result.bytes, "iCCP")).toBe(true);
    expect(contains(result.bytes, "IEND")).toBe(true);
    expect(findProfilePhotoMetadata(result.bytes, "image/png")).toEqual([]);
  });

  it("removes WebP EXIF and XMP chunks, clears VP8X flags and fixes the RIFF size", () => {
    const result = stripProfilePhotoMetadata(buildWebp(), "image/webp");
    const out = result.bytes;

    expect(contains(out, SECRET)).toBe(false);
    expect(contains(out, "EXIF")).toBe(false);
    expect(contains(out, "XMP ")).toBe(false);
    const riffSize = out[4] | (out[5] << 8) | (out[6] << 16) | (out[7] << 24);
    expect(riffSize).toBe(out.length - 8);
    const vp8xFlags = out[12 + 8];
    expect(vp8xFlags & 0x0c).toBe(0);
    expect(vp8xFlags & 0x10).toBe(0x10); // alpha flag kept
    expect(findProfilePhotoMetadata(out, "image/webp")).toEqual([]);
  });

  it("blanks HEIC Exif and XMP items in place and keeps the image data and file layout", () => {
    const heic = buildHeic();
    expect(findProfilePhotoMetadata(heic.bytes, "image/heic")).toEqual([
      "HEIC Exif item 2",
      "HEIC XMP item 3",
    ]);

    const result = stripProfilePhotoMetadata(heic.bytes, "image/heic");

    expect(result.type).toBe("image/heic");
    expect(result.bytes.length).toBe(heic.bytes.length);
    expect(contains(result.bytes, SECRET)).toBe(false);
    expect(Array.from(result.bytes.subarray(heic.imageStart, heic.imageStart + heic.imageData.length))).toEqual(
      Array.from(heic.imageData),
    );
    // Exif item now starts with an empty TIFF block (0 tags).
    expect(Array.from(result.bytes.subarray(heic.exifStart, heic.exifStart + 8))).toEqual([
      0, 0, 0, 0, 0x4d, 0x4d, 0x00, 0x2a,
    ]);
    expect(result.removed).toEqual(["HEIC Exif item 2", "HEIC XMP item 3"]);
    expect(findProfilePhotoMetadata(result.bytes, "image/heic")).toEqual([]);
  });

  it("fails closed on a HEIC without item tables", () => {
    const broken = bytesOf(box("ftyp", "heic", u32be(0), "heic"), box("mdat", [1, 2, 3]));

    expect(() => stripProfilePhotoMetadata(broken, "image/heic")).toThrow(PhotoMetadataError);
  });
});
