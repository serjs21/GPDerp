import { readFileSync } from "node:fs";
import { join } from "node:path";
import { WAG_TAIL_COPY_COUNT } from "../consts/wagTailLoaderConsts";
import { buildWagTailStyle, linesStyle, resolveWagTailProps, tailCopyStyle } from "./wagTailLoaderUtils";

const STATIC_CSS = readFileSync(join(__dirname, "..", "WagTailStaticLoader.module.css"), "utf8");

/** `{ ".defaults": { "--wag-width": "12rem", ... }, ... }` for every class block in the static CSS. */
function parseBlocks(css: string): Record<string, Record<string, string>> {
  const blocks: Record<string, Record<string, string>> = {};
  for (const [, selector, body] of css.matchAll(/(\.[\w-]+)\s*\{([^}]*)\}/g)) {
    blocks[selector] = Object.fromEntries(
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
  return blocks;
}

const asStrings = (style: object) =>
  Object.fromEntries(Object.entries(style).map(([key, value]) => [key, String(value)]));

describe("WagTailStaticLoader.module.css", () => {
  const blocks = parseBlocks(STATIC_CSS);
  const defaults = resolveWagTailProps({});

  it("fixes the root variables to WAG_TAIL_LOADER_DEFAULTS", () => {
    expect(blocks[".defaults"]).toEqual(asStrings(buildWagTailStyle(defaults)));
  });

  it("fixes every tail copy's index and opacity cycle", () => {
    for (let index = 0; index < WAG_TAIL_COPY_COUNT; index++) {
      expect(blocks[`.copy${index}`]).toEqual(asStrings(tailCopyStyle(index, defaults)));
    }
  });

  it("fixes the motion lines' opacity cycle", () => {
    expect(blocks[".linesDefaults"]).toEqual(asStrings(linesStyle(defaults)));
  });

  it("has no blocks the static components do not use", () => {
    const expected = [".defaults", ...Array.from({ length: WAG_TAIL_COPY_COUNT }, (_, i) => `.copy${i}`), ".linesDefaults"];
    expect(Object.keys(blocks).sort()).toEqual(expected.sort());
  });
});
