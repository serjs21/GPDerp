const CSS_URL_PATTERN = /url\(\s*(['"]?)(.*?)\1\s*\)/g;
const IMAGE_STYLE_PROPS = [
  "background-image",
  "mask-image",
  "-webkit-mask-image",
  "border-image-source",
] as const;

const FRAME_FALLBACK_MS = 50;

/** rAF is throttled or paused in hidden tabs; fall back to a timer so capture can't stall. */
function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, FRAME_FALLBACK_MS);
    requestAnimationFrame(() => {
      clearTimeout(timer);
      resolve();
    });
  });
}

function collectCssImageUrls(root: HTMLElement): string[] {
  const urls = new Set<string>();
  const elements = [root, ...Array.from(root.querySelectorAll<HTMLElement>("*"))];
  for (const element of elements) {
    const computed = getComputedStyle(element);
    for (const prop of IMAGE_STYLE_PROPS) {
      const value = computed.getPropertyValue(prop);
      if (!value || value === "none") continue;
      for (const match of value.matchAll(CSS_URL_PATTERN)) {
        const url = match[2];
        if (url && !url.startsWith("#") && !url.startsWith("data:")) urls.add(url);
      }
    }
  }
  return [...urls];
}

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => reject(new Error(`Asset failed to load: ${url}`));
    image.src = url;
  });
}

async function decodeImage(image: HTMLImageElement): Promise<void> {
  if (!image.currentSrc && !image.src) return;
  if (!image.complete) {
    await new Promise<void>((resolve, reject) => {
      image.addEventListener("load", () => resolve(), { once: true });
      image.addEventListener("error", () => reject(new Error(`Image failed to load: ${image.src}`)), {
        once: true,
      });
    });
  }
  if (image.naturalWidth === 0) {
    throw new Error(`Image failed to load: ${image.src}`);
  }
  await image.decode().catch(() => undefined);
}

/** Request every font face the subtree's text actually uses, then wait for the font set. */
async function loadUsedFonts(root: HTMLElement): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  const requests = new Map<string, string>();
  const elements = [root, ...Array.from(root.querySelectorAll<HTMLElement>("*"))];
  for (const element of elements) {
    const text = Array.from(element.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent ?? "")
      .join("")
      .trim();
    if (!text) continue;
    const computed = getComputedStyle(element);
    const font = `${computed.fontStyle} ${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`;
    requests.set(font, (requests.get(font) ?? "") + text);
  }
  await Promise.all(
    [...requests].map(([font, text]) => document.fonts.load(font, text).catch(() => [])),
  );
  await document.fonts.ready;
}

/**
 * Resolve once fonts, `<img>` elements, and CSS background/mask images inside
 * `root` are loaded and layout has settled. Rejects if any image fails.
 */
export async function waitForRenderedAssets(root: HTMLElement): Promise<void> {
  await nextFrame();
  const images = Array.from(root.querySelectorAll("img"));
  await Promise.all([
    loadUsedFonts(root),
    ...images.map(decodeImage),
    ...collectCssImageUrls(root).map(preloadImage),
  ]);
  await nextFrame();
  await nextFrame();
}
