// Builds GPS-tagged test photos (fake Manila coordinates) for the ticket #46 local proof.
const fs = require("fs");
const path = require("path");
// Run from the repo root after `npm i --no-save exifr@7.1.3`. Writes to ./tmp-photo-fixtures.
const sharp = require("sharp");
const exifr = require("exifr");

const out = process.env.FIXTURES_DIR || path.resolve("tmp-photo-fixtures");
fs.mkdirSync(out, { recursive: true });

const exif = {
  IFD0: { Make: "ProofCam", Model: "Ticket46", ImageDescription: "GPS proof" },
  IFD3: {
    GPSLatitudeRef: "N",
    GPSLatitude: "14/1 35/1 58/1",
    GPSLongitudeRef: "E",
    GPSLongitude: "120/1 58/1 39/1",
  },
};

(async () => {
  const base = sharp({
    create: { width: 640, height: 480, channels: 3, background: { r: 200, g: 80, b: 120 } },
  });
  const buf = await base.png().toBuffer();

  const files = {
    "gps.jpg": await sharp(buf).jpeg({ quality: 85 }).withMetadata({ orientation: 6 }).withExifMerge(exif).toBuffer(),
    "gps.png": await sharp(buf).png().withExif(exif).toBuffer(),
    "gps.webp": await sharp(buf).webp({ quality: 80 }).withExif(exif).toBuffer(),
    "anim.gif": await sharp(buf).gif().toBuffer(),
  };

  // 11 MB: a valid JPEG header followed by padding (size check runs before decoding).
  const big = Buffer.alloc(11 * 1024 * 1024, 0x20);
  files["eleven-mb.jpg"] = Buffer.concat([files["gps.jpg"], big]);

  for (const [name, data] of Object.entries(files)) {
    fs.writeFileSync(path.join(out, name), data);
    let gps = null;
    try {
      gps = await exifr.gps(data);
    } catch {
      gps = null;
    }
    console.log(`${name}\t${data.length} bytes\tGPS=${gps ? `${gps.latitude.toFixed(4)},${gps.longitude.toFixed(4)}` : "none"}`);
  }
})();
