import { JPEG_SIGNATURE, PNG_SIGNATURE } from "../consts/postcard";

export type PostcardImageType = "png" | "jpeg";

export type PostcardImageInfo = { type: PostcardImageType; width: number; height: number };

/** Signature (8) + IHDR length (4) + "IHDR" (4) + width (4) + height (4). */
const PNG_IHDR_END = 24;

/** SOF0–SOF15 carry the frame size; C4 (DHT), C8 (JPG) and CC (DAC) share the range but do not. */
const isJpegFrameMarker = (marker: number): boolean =>
  marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;

const startsWith = (buffer: Buffer, signature: Buffer): boolean =>
  buffer.length > signature.length && buffer.subarray(0, signature.length).equals(signature);

export const isPngBuffer = (buffer: Buffer): boolean => startsWith(buffer, PNG_SIGNATURE);

export const isJpegBuffer = (buffer: Buffer): boolean => startsWith(buffer, JPEG_SIGNATURE);

export const readPngSize = (buffer: Buffer): { width: number; height: number } | null => {
  if (!isPngBuffer(buffer) || buffer.length < PNG_IHDR_END) return null;
  if (buffer.toString("ascii", 12, 16) !== "IHDR") return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
};

export const readJpegSize = (buffer: Buffer): { width: number; height: number } | null => {
  if (!isJpegBuffer(buffer)) return null;
  let offset = 2;
  while (offset + 4 <= buffer.length) {
    if (buffer[offset] !== 0xff) return null;
    const marker = buffer[offset + 1];
    if (marker === 0xff) {
      offset += 1;
      continue;
    }
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }
    if (marker === 0xd9 || marker === 0xda) return null;
    const segmentLength = buffer.readUInt16BE(offset + 2);
    if (segmentLength < 2) return null;
    if (isJpegFrameMarker(marker)) {
      if (offset + 9 > buffer.length) return null;
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    offset += 2 + segmentLength;
  }
  return null;
};

export const readPostcardImageInfo = (buffer: Buffer): PostcardImageInfo | null => {
  const png = readPngSize(buffer);
  if (png) return { type: "png", ...png };
  const jpeg = readJpegSize(buffer);
  if (jpeg) return { type: "jpeg", ...jpeg };
  return null;
};
