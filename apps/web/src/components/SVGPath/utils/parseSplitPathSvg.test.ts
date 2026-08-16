import { readFileSync } from "fs";
import { join } from "path";
import { parseSplitPathSvg, splitPathSvgInnerMarkup } from "./parseSplitPathSvg";

const svgMarkup = readFileSync(
  join(process.cwd(), "public/split_path_colored_stops.svg"),
  "utf8",
);

describe("parseSplitPathSvg", () => {
  const parsed = parseSplitPathSvg(svgMarkup);

  it("reads the 1920×1080 viewBox", () => {
    expect(parsed.viewBox).toEqual({ width: 1920, height: 1080 });
  });

  it("parses stops 00 through 22", () => {
    expect(Object.keys(parsed.stopsById)).toHaveLength(23);
    expect(parsed.stopsById[0]?.id).toBe(0);
    expect(parsed.stopsById[20]?.cx).toBeCloseTo(960.03);
    expect(parsed.stopsById[20]?.cy).toBeCloseTo(1050.6);
    expect(parsed.stopsById[22]?.id).toBe(22);
  });

  it("parses 22 segments connecting consecutive stops", () => {
    expect(Object.keys(parsed.segmentsById)).toHaveLength(22);
    expect(parsed.segmentsById[20]?.startStopId).toBe(20);
    expect(parsed.segmentsById[20]?.endStopId).toBe(21);
    expect(parsed.segmentsById[21]?.startStopId).toBe(21);
    expect(parsed.segmentsById[21]?.endStopId).toBe(22);
  });

  it("extracts inner svg groups for inline rendering", () => {
    const inner = splitPathSvgInnerMarkup(svgMarkup);
    expect(inner).toContain('id="segments"');
    expect(inner).toContain('id="stops"');
    expect(inner).not.toContain("<svg");
  });
});
