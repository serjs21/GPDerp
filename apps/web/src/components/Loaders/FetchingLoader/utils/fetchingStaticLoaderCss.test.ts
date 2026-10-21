import { readFileSync } from "node:fs";
import { join } from "node:path";
import { FETCHING_LOADER_DEFAULTS, FETCHING_LOADER_DOT_COUNT, FETCHING_LOADER_DOT_STEP_MS } from "../consts/fetchingLoaderConsts";
import { buildFetchingLoaderStyle, fetchingFrameStyle, fetchingShownFrames } from "./fetchingLoaderUtils";

const SOURCE = readFileSync(join(__dirname, "..", "FetchingStaticLoader.module.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const KEYFRAMES = /@keyframes\s+([\w-]+)\s*\{([\s\S]*?\})\s*\}/g;
const CSS = SOURCE.replace(KEYFRAMES, "").replace(/@media[^{]*\{[\s\S]*?\}\s*\}/g, "");

/** Opacity of `@keyframes name` at `percent` under step-end timing (last stop at or before it). */
function keyframeOpacityAt(name: string, percent: number): number | undefined {
  const body = [...SOURCE.matchAll(KEYFRAMES)].find(([, keyframesName]) => keyframesName === name)?.[2] ?? "";
  const stops = [...body.matchAll(/([\d.]+)%\s*\{\s*opacity:\s*([\d.]+);?\s*\}/g)].map(([, at, opacity]) => [Number(at), Number(opacity)]);
  return stops.filter(([at]) => at <= percent).at(-1)?.[1];
}

/** `{ ".defaults": { "--fetching-width": "10rem", ... }, ... }` for every rule in the static CSS. */
function parseRules(css: string): Record<string, Record<string, string>> {
  const rules: Record<string, Record<string, string>> = {};
  for (const [, selector, body] of css.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    rules[selector.trim()] = Object.fromEntries(
      body
        .split(";")
        .map((declaration) => declaration.trim())
        .filter(Boolean)
        .map((declaration) => {
          const colon = declaration.indexOf(":");
          return [declaration.slice(0, colon).trim(), declaration.slice(colon + 1).trim()];
        }),
    );
  }
  return rules;
}

const asStrings = (style: object) => Object.fromEntries(Object.entries(style).map(([key, value]) => [key, String(value)]));

describe("FetchingStaticLoader.module.css", () => {
  const rules = parseRules(CSS);

  it("fixes the stage variables to FETCHING_LOADER_DEFAULTS", () => {
    expect(rules[".defaults"]).toEqual(asStrings(buildFetchingLoaderStyle(FETCHING_LOADER_DEFAULTS)));
  });

  it("fixes every shown frame's size, and only those", () => {
    const shown = fetchingShownFrames();
    for (const { frame, index } of shown) {
      expect(rules[`.frame${index + 1}`]).toEqual(asStrings(fetchingFrameStyle(frame)));
    }
    const frameRules = Object.keys(rules).filter((selector) => /^\.frame\d+$/.test(selector));
    expect(frameRules.sort()).toEqual(shown.map(({ index }) => `.frame${index + 1}`).sort());
  });

  it("steps the caption dots . -> .. -> ... once per FETCHING_LOADER_DOT_STEP_MS", () => {
    expect(rules[".caption"]["--fetching-dots-duration"]).toBe(`${FETCHING_LOADER_DOT_COUNT * FETCHING_LOADER_DOT_STEP_MS}ms`);
    const visibleDots = Array.from({ length: FETCHING_LOADER_DOT_COUNT }, (_, step) => {
      const percent = ((step + 0.5) / FETCHING_LOADER_DOT_COUNT) * 100;
      // The first dot has no animation, so it always shows.
      return 1 + [2, 3].filter((dot) => keyframeOpacityAt(`fetchingDot${dot}`, percent) === 1).length;
    });
    expect(visibleDots).toEqual([1, 2, 3]);
  });
});
