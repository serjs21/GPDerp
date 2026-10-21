import { readFileSync } from "node:fs";
import { join } from "node:path";
import { WAG_TAIL_LOADER_DEFAULTS } from "../consts/wagTailLoaderConsts";

const FACE_CSS = readFileSync(join(__dirname, "..", "WagTailLanternFace.module.css"), "utf8");

function declarationsOf(css: string, selector: string): Record<string, string> {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const body = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`))?.[1] ?? "";
  return Object.fromEntries(
    body
      .split(";")
      .map((declaration) => declaration.replace(/\/\*[\s\S]*?\*\//g, "").trim())
      .filter(Boolean)
      .map((declaration) => {
        const colon = declaration.indexOf(":");
        return [declaration.slice(0, colon).trim(), declaration.slice(colon + 1).trim()];
      }),
  );
}

describe("WagTailLanternFace.module.css", () => {
  it("restates the dog's tail and motion-line geometry as WAG_TAIL_LOADER_DEFAULTS percentages", () => {
    expect(declarationsOf(FACE_CSS, ".root .dog")).toMatchObject({
      "--wag-tail-width": `${WAG_TAIL_LOADER_DEFAULTS.tailWidthPercent}cqw`,
      "--wag-lines-x": `${WAG_TAIL_LOADER_DEFAULTS.linesOffsetXPercent}cqw`,
      "--wag-lines-y": `${WAG_TAIL_LOADER_DEFAULTS.linesOffsetYPercent}cqw`,
      "--wag-lines-width": `${WAG_TAIL_LOADER_DEFAULTS.linesWidthPercent}cqw`,
      "container-type": "inline-size",
    });
  });
});
