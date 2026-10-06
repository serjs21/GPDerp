type FontUsage = { codepoints: Set<number>; weights: Set<number> };
type CodepointRange = [number, number];

const CSS_URL_PATTERN = /url\(\s*(['"]?)(.*?)\1\s*\)/g;
const dataUrlCache = new Map<string, Promise<string>>();

function normalizeFamily(family: string): string {
  return family.trim().replace(/^['"]|['"]$/g, "").toLowerCase();
}

function textOf(element: Element): string {
  let text = "";
  for (const node of Array.from(element.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) text += node.textContent ?? "";
  }
  return text;
}

/** Family → glyphs and weights actually rendered as text inside `root`. */
function collectFontUsage(root: HTMLElement): Map<string, FontUsage> {
  const usage = new Map<string, FontUsage>();
  const elements = [root, ...Array.from(root.querySelectorAll("*"))];
  for (const element of elements) {
    const text = textOf(element).trim();
    if (!text) continue;
    const computed = getComputedStyle(element);
    const weight = Number.parseInt(computed.fontWeight, 10) || 400;
    for (const family of computed.fontFamily.split(",")) {
      const key = normalizeFamily(family);
      const entry = usage.get(key) ?? { codepoints: new Set<number>(), weights: new Set<number>() };
      for (const char of text) entry.codepoints.add(char.codePointAt(0) ?? 0);
      entry.weights.add(weight);
      usage.set(key, entry);
    }
  }
  return usage;
}

function parseUnicodeRange(value: string): CodepointRange[] | null {
  if (!value.trim()) return null;
  return value.split(",").map((part) => {
    const token = part.trim().replace(/^u\+/i, "");
    if (token.includes("?")) {
      return [
        Number.parseInt(token.replace(/\?/g, "0"), 16),
        Number.parseInt(token.replace(/\?/g, "f"), 16),
      ] as CodepointRange;
    }
    const [start, end] = token.split("-");
    const from = Number.parseInt(start, 16);
    return [from, end ? Number.parseInt(end, 16) : from] as CodepointRange;
  });
}

function rangesCover(ranges: CodepointRange[] | null, codepoints: Set<number>): boolean {
  if (!ranges) return true;
  for (const codepoint of codepoints) {
    if (ranges.some(([from, to]) => codepoint >= from && codepoint <= to)) return true;
  }
  return false;
}

function parseWeightRange(faceWeight: string): CodepointRange | null {
  const parts = faceWeight
    .split(/\s+/)
    .map((part) => (part === "normal" ? 400 : part === "bold" ? 700 : Number.parseInt(part, 10)))
    .filter((value) => Number.isFinite(value));
  if (parts.length === 0) return null;
  const [min, max = min] = parts;
  return [min, max];
}

function weightDistance(range: CodepointRange | null, weight: number): number {
  if (!range) return 0;
  const [min, max] = range;
  if (weight < min) return min - weight;
  if (weight > max) return weight - max;
  return 0;
}

/** Faces the browser would pick for each used weight (nearest available weight per family). */
function selectFacesByWeight(faces: CSSFontFaceRule[], used: Set<number>): CSSFontFaceRule[] {
  const withRange = faces.map((face) => ({
    face,
    range: parseWeightRange(face.style.getPropertyValue("font-weight")),
  }));
  const selected = new Set<CSSFontFaceRule>();
  for (const weight of used) {
    const best = Math.min(...withRange.map(({ range }) => weightDistance(range, weight)));
    for (const { face, range } of withRange) {
      if (weightDistance(range, weight) === best) selected.add(face);
    }
  }
  return faces.filter((face) => selected.has(face));
}

function fetchAsDataUrl(url: string): Promise<string> {
  const cached = dataUrlCache.get(url);
  if (cached) return cached;
  const pending = fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error(`Font fetch failed (${response.status}): ${url}`);
      return response.blob();
    })
    .then(
      (blob) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(reader.error ?? new Error(`Font read failed: ${url}`));
          reader.readAsDataURL(blob);
        }),
    );
  pending.catch(() => dataUrlCache.delete(url));
  dataUrlCache.set(url, pending);
  return pending;
}

async function inlineFontUrls(rule: CSSFontFaceRule): Promise<string> {
  const base = rule.parentStyleSheet?.href ?? document.baseURI;
  let cssText = rule.cssText;
  const urls = [...new Set([...cssText.matchAll(CSS_URL_PATTERN)].map((match) => match[2]))].filter(
    (url) => url && !url.startsWith("data:"),
  );
  for (const url of urls) {
    const dataUrl = await fetchAsDataUrl(new URL(url, base).href);
    cssText = cssText.split(url).join(dataUrl);
  }
  return cssText;
}

function collectFontFaceRules(rules: CSSRuleList, out: CSSFontFaceRule[]): void {
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSFontFaceRule) out.push(rule);
    else if (rule instanceof CSSImportRule && rule.styleSheet) {
      try {
        collectFontFaceRules(rule.styleSheet.cssRules, out);
      } catch {
        // Cross-origin @import (e.g. Google Fonts) is unreadable; self-hosted next/font faces cover it.
      }
    } else if ("cssRules" in rule) {
      collectFontFaceRules((rule as CSSGroupingRule).cssRules, out);
    }
  }
}

/**
 * Build `fontEmbedCSS` for html-to-image containing only @font-face rules whose
 * family, weight, and unicode-range match glyphs rendered inside `root`, with
 * font files inlined as data URLs. Avoids embedding every CJK subset.
 */
export async function buildPostcardFontEmbedCSS(root: HTMLElement): Promise<string> {
  const usage = collectFontUsage(root);
  const faces: CSSFontFaceRule[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      collectFontFaceRules(sheet.cssRules, faces);
    } catch {
      // Cross-origin stylesheet without CORS; skip.
    }
  }

  const byFamily = new Map<string, CSSFontFaceRule[]>();
  for (const face of faces) {
    const family = normalizeFamily(face.style.getPropertyValue("font-family"));
    if (!usage.has(family)) continue;
    byFamily.set(family, [...(byFamily.get(family) ?? []), face]);
  }

  const matched: CSSFontFaceRule[] = [];
  for (const [family, familyFaces] of byFamily) {
    const used = usage.get(family);
    if (!used) continue;
    for (const face of selectFacesByWeight(familyFaces, used.weights)) {
      const ranges = parseUnicodeRange(face.style.getPropertyValue("unicode-range"));
      if (rangesCover(ranges, used.codepoints)) matched.push(face);
    }
  }

  const unique = [...new Map(matched.map((face) => [face.cssText, face])).values()];
  const inlined = await Promise.all(unique.map(inlineFontUrls));
  return inlined.join("\n");
}
