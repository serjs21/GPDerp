import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildLoadingTextStyle } from "@/components/Loaders/LoadingText/utils/loadingTextUtils";
import { LANTERN_LOADER_DEFAULTS } from "../consts/lanternLoaderConsts";
import { buildLanternKeyframes, buildLanternStyle, resolveLanternProps } from "./lanternLoaderUtils";

const STATIC_CSS = readFileSync(join(__dirname, "..", "LanternStaticLoader.module.css"), "utf8").replace(
  /\/\*[\s\S]*?\*\//g,
  "",
);

const KEYFRAMES = /@keyframes\s+([\w-]+)\s*\{[\s\S]*?\}\s*\}/;

/** `{ ".defaults": { "--lantern-width": "8rem", ... }, ... }` for every rule outside the keyframes. */
function parseRules(css: string): Record<string, Record<string, string>> {
  const rules: Record<string, Record<string, string>> = {};
  for (const [, selector, body] of css.replace(KEYFRAMES, "").matchAll(/([^{}]+)\{([^}]*)\}/g)) {
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
const squash = (css: string) => css.replace(/\s+/g, "");

describe("LanternStaticLoader.module.css", () => {
  const rules = parseRules(STATIC_CSS);
  const defaults = resolveLanternProps({});
  const keyframesMatch = KEYFRAMES.exec(STATIC_CSS);

  it("fixes the root variables to LANTERN_LOADER_DEFAULTS", () => {
    expect(rules[".defaults"]).toEqual(asStrings(buildLanternStyle(defaults, null)));
  });

  it("fixes the keyframes to the default steps and points the lantern at them", () => {
    expect(keyframesMatch).not.toBeNull();
    const [keyframes, name] = keyframesMatch!;
    expect(squash(keyframes)).toBe(squash(buildLanternKeyframes(name, LANTERN_LOADER_DEFAULTS.steps)));
    expect(rules[".defaults .frames"]).toEqual({ "animation-name": name });
  });

  it("fixes the caption's dot cycle to the default step clock", () => {
    expect(rules[".textTiming"]).toEqual(asStrings(buildLoadingTextStyle(defaults.stepTransitionMs)));
  });

  it("has no rules the static component does not use", () => {
    expect(Object.keys(rules).sort()).toEqual([".defaults", ".defaults .frames", ".textTiming"].sort());
  });
});
