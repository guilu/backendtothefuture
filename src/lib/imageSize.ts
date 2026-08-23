import fs from "fs";
import path from "path";

/**
 * Intrinsic pixel size of a raster image in `public/`, read from the file.
 *
 * <p>`og:image:width` / `og:image:height` used to be written as a literal
 * `1200 × 630` next to every post, which was true for as long as every post's
 * `og.jpg` happened to be that size. It stopped being true the moment one was
 * exported at `2400 × 1260` — the same retina-density fix `scripts/og-shot.mjs`
 * applies to the index thumbnail, because LinkedIn's documented 1200×627 is a
 * minimum and the feed card is painted at two device pixels per CSS pixel.
 *
 * <p>A declared size that disagrees with the bytes is worse than no size at
 * all: it is the hint scrapers use to lay the card out before the image
 * arrives. So the number is read from the file rather than copied next to it —
 * the same rule `og-shot.mjs` already follows when it parses `OG_SCALE` out of
 * `src/lib/og.ts` instead of keeping its own copy.
 *
 * <p>Only JPEG and PNG are handled, which is the whole of what `og:image`
 * accepts here — social scrapers don't render WebP.
 */

const ROOT = process.cwd();

/** What the metadata declared before this was derived, kept as the fallback. */
export const DEFAULT_OG_SIZE = { width: 1200, height: 630 } as const;

export type ImageSize = { width: number; height: number };

function pngSize(buf: Buffer): ImageSize | null {
  // 8-byte signature, then the IHDR chunk: 4 length + 4 type + width + height.
  if (buf.length < 24) return null;
  if (buf.readUInt32BE(0) !== 0x89504e47) return null;
  if (buf.toString("ascii", 12, 16) !== "IHDR") return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function jpegSize(buf: Buffer): ImageSize | null {
  if (buf.length < 4 || buf.readUInt16BE(0) !== 0xffd8) return null;

  let offset = 2;
  while (offset + 9 < buf.length) {
    if (buf[offset] !== 0xff) {
      offset++; // resync past padding between segments
      continue;
    }
    const marker = buf[offset + 1];

    // Standalone markers carry no length payload.
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }
    if (marker === 0xd9 || marker === 0xda) return null; // end of image / start of scan

    const length = buf.readUInt16BE(offset + 2);
    if (length < 2) return null;

    // SOF0..SOF15 hold the frame size. C4/C8/CC share the range but are
    // Huffman tables, arithmetic coding conditioning and JPEG-LS instead.
    const isSOF =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSOF) {
      return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  return null;
}

/**
 * Reads the size of a `public/`-relative image (e.g. `/blog/foo-og.jpg`).
 *
 * <p>Returns {@link DEFAULT_OG_SIZE} when the file is missing or unparseable,
 * so a malformed asset degrades to the previous behaviour instead of failing
 * the build.
 */
export function imageSize(publicPath: string): ImageSize {
  try {
    const file = path.join(ROOT, "public", publicPath.replace(/^\//, ""));
    const buf = fs.readFileSync(file);
    const size = /\.png$/i.test(file) ? pngSize(buf) : jpegSize(buf);
    return size ?? DEFAULT_OG_SIZE;
  } catch {
    return DEFAULT_OG_SIZE;
  }
}
