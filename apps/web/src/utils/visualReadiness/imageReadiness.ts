export type ImageReadiness = "ready" | "failed";

export type CriticalImage = {
  src: string;
  /**
   * Must match how the page fetches the image, or the browser downloads it twice:
   * `<img>` / CSS `background-image` → omit; CSS `mask-image` → `"anonymous"` (CORS fetch).
   */
  crossOrigin?: "anonymous";
  /** Responsive `<img>` candidates; must equal the element's `srcSet`/`sizes` so both pick the same file. */
  srcSet?: string;
  sizes?: string;
};

/** Only critical view art goes through here; the bound guards against unbounded growth. */
const MAX_TRACKED_IMAGES = 32;

const pending = new Map<string, Promise<ImageReadiness>>();
const settledReady = new Set<string>();

const cacheKey = ({ src, crossOrigin, srcSet }: CriticalImage): string =>
  `${crossOrigin ?? "no-cors"} ${new URL(src, document.baseURI).href} ${srcSet ?? ""}`;

function loadAndDecode({ src, crossOrigin, srcSet, sizes }: CriticalImage): Promise<ImageReadiness> {
  const image = new Image();
  image.decoding = "async";
  if (crossOrigin) image.crossOrigin = crossOrigin;
  if (sizes) image.sizes = sizes;
  if (srcSet) image.srcset = srcSet;

  if (typeof image.decode !== "function") {
    return new Promise((resolve) => {
      image.onload = () => resolve(image.naturalWidth > 0 ? "ready" : "failed");
      image.onerror = () => resolve("failed");
      image.src = src;
    });
  }

  image.src = src;
  // decode() also resolves for cached/already-complete images. It can reject for
  // images that did load (e.g. very large bitmaps), so fall back to a real size check.
  return image.decode().then(
    () => "ready" as const,
    () => (image.complete && image.naturalWidth > 0 ? "ready" : "failed"),
  );
}

function track(key: string, readiness: Promise<ImageReadiness>): void {
  if (pending.size >= MAX_TRACKED_IMAGES) {
    const oldest = pending.keys().next().value;
    if (oldest !== undefined) {
      pending.delete(oldest);
      settledReady.delete(oldest);
    }
  }
  pending.set(key, readiness);
}

/**
 * Request + decode an image once per (URL, CORS mode). Concurrent and later callers share
 * the same promise; failures are evicted so a later call retries.
 */
export function preloadAndDecodeImage(image: CriticalImage): Promise<ImageReadiness> {
  const key = cacheKey(image);
  const existing = pending.get(key);
  if (existing) return existing;

  const readiness = loadAndDecode(image).then((result) => {
    if (result === "ready") settledReady.add(key);
    else pending.delete(key);
    return result;
  });
  track(key, readiness);
  return readiness;
}

/** Synchronous check: true only if a previous call already decoded this image. */
export function isImageDecoded(image: CriticalImage): boolean {
  if (typeof document === "undefined") return false;
  return settledReady.has(cacheKey(image));
}

/** Test-only reset of the module cache. */
export function resetImageReadinessCache(): void {
  pending.clear();
  settledReady.clear();
}
