import { readFileSync } from "node:fs";
import { join } from "node:path";
import { FETCHING_LOADER_DEFAULTS } from "../consts/fetchingLoaderConsts";
import { buildFetchingLoaderStyle, fetchingFrameStyle, fetchingShownFrames } from "./fetchingLoaderUtils";

const CSS = readFileSync(join(__dirname, "..", "FetchingStaticLoader.module.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

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
});
