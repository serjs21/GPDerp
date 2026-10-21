import { readFileSync } from "node:fs";
import { join } from "node:path";
import { FETCHING_LOADER_FRAMES, FETCHING_LOADER_SEQUENCE } from "../consts/fetchingLoaderConsts";
import {
  buildFetchingLoaderStyle,
  FETCHING_LOADER_STAGE,
  fetchingFrameSlots,
  fetchingFrameStyle,
  fetchingShownFrames,
} from "./fetchingLoaderUtils";

const CSS = readFileSync(join(__dirname, "..", "FetchingLoader.module.css"), "utf8");

/** `[[percent, opacity], ...]` for `@keyframes name`. */
function keyframeStops(name: string): Array<[number, number]> {
  const body = new RegExp(`@keyframes\\s+${name}\\s*\\{([\\s\\S]*?)\\}\\s*\\}`).exec(CSS)?.[1] ?? "";
  return [...body.matchAll(/([\d.]+)%\s*\{\s*opacity:\s*([\d.]+);?\s*/g)].map(([, percent, opacity]) => [
    Number(percent),
    Number(opacity),
  ]);
}

/** Opacity at `percent` under step-end timing: the last stop at or before it. */
const opacityAt = (stops: Array<[number, number]>, percent: number) =>
  stops.filter(([stop]) => stop <= percent).at(-1)?.[1];

describe("FetchingLoader.module.css", () => {
  it("shows exactly the frame FETCHING_LOADER_SEQUENCE names in every slot (1 2 1 3)", () => {
    const slotCount = FETCHING_LOADER_SEQUENCE.length;
    for (const { index } of fetchingShownFrames()) {
      const stops = keyframeStops(`fetchingFrame${index + 1}`);
      const shownIn = Array.from({ length: slotCount }, (_, slot) => slot).filter(
        (slot) => opacityAt(stops, ((slot + 0.5) / slotCount) * 100) === 1,
      );
      expect(shownIn).toEqual(fetchingFrameSlots(index));
    }
  });

  it("has keyframes only for the frames the sequence shows", () => {
    const names = [...CSS.matchAll(/@keyframes\s+(fetchingFrame\d+)/g)].map(([, name]) => name);
    expect(names).toEqual(fetchingShownFrames().map(({ index }) => `fetchingFrame${index + 1}`));
  });
});

describe("fetchingLoaderUtils", () => {
  it("loops 1 2 1 3 and renders only frames 1-3", () => {
    expect(FETCHING_LOADER_SEQUENCE.map((index) => index + 1)).toEqual([1, 2, 1, 3]);
    expect(fetchingFrameSlots(0)).toEqual([0, 2]);
    expect(fetchingShownFrames().map(({ index }) => index + 1)).toEqual([1, 2, 3]);
  });

  it("sizes the stage to the largest canvas and keeps every frame at the same scale", () => {
    expect(FETCHING_LOADER_STAGE).toEqual({ width: 252, height: 132.88 });
    expect(fetchingFrameStyle(FETCHING_LOADER_FRAMES[2])).toEqual({
      "--fetching-frame-width": "100%",
      "--fetching-frame-height": "95.725%",
    });
  });

  it("runs one frameMs per slot", () => {
    expect(buildFetchingLoaderStyle({ frameMs: 100 })).toMatchObject({ "--fetching-duration": "400ms" });
  });
});
