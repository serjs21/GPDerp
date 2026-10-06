import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/** `dist/assets` after build (copied there), `apps/api/assets` when running from `src`. */
const ASSET_DIR_CANDIDATES = [
  path.resolve(__dirname, "../../assets/postcard"),
  path.resolve(__dirname, "../../../assets/postcard"),
];

let assetDir: string | null = null;

const resolveAssetDir = (): string => {
  if (assetDir) return assetDir;
  const found = ASSET_DIR_CANDIDATES.find((candidate) => existsSync(candidate));
  if (!found) {
    throw new Error(`Postcard assets not found (looked in ${ASSET_DIR_CANDIDATES.join(", ")})`);
  }
  assetDir = found;
  return found;
};

const cache = new Map<string, Buffer>();

export const readPostcardAsset = (fileName: string): Buffer => {
  const cached = cache.get(fileName);
  if (cached) return cached;
  const buffer = readFileSync(path.join(resolveAssetDir(), fileName));
  cache.set(fileName, buffer);
  return buffer;
};

export const POSTCARD_HAND_FONT_FILE = "PatrickHand-Regular.ttf";
export const POSTCARD_FALLBACK_FONT_FILE = "ZenKurenaido-Regular.ttf";
export const POSTCARD_STAMP_FILE = "postcard_stamp.svg";
