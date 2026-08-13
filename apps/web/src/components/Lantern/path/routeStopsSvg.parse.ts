export type ParsedRouteStopCircle = {
  id: number;
  cx: number;
  cy: number;
};

export type ParsedRouteSvg = {
  segmentsById: Readonly<Record<number, string>>;
  circles: ParsedRouteStopCircle[];
};

const SEGMENT_PATH_PATTERN =
  /<path[^>]*id="segment-(\d+)"[^>]*\sd="([^"]+)"/g;
const STOP_CIRCLE_PATTERN =
  /<circle\s+id="stop-(\d+)"\s+cx="([^"]+)"\s+cy="([^"]+)"[^/]*\/?>/g;

const REQUIRED_SEGMENT_COUNT = 16;

/** Normalize `?raw` imports across Vite (string) and Next/Storybook (wrapped object). */
export function resolveRouteStopsSvgMarkup(imported: unknown): string {
  if (typeof imported === "string") {
    return imported;
  }

  if (
    imported &&
    typeof imported === "object" &&
    "default" in imported &&
    typeof (imported as { default: unknown }).default === "string"
  ) {
    return (imported as { default: string }).default;
  }

  throw new Error(
    "route SVG must resolve to markup string; import from src/assets/routeSplitSegmentsExact.ts.",
  );
}

export function parseRouteSvg(svgMarkup: string): ParsedRouteSvg {
  const segmentsById: Record<number, string> = {};

  for (const match of svgMarkup.matchAll(SEGMENT_PATH_PATTERN)) {
    segmentsById[Number(match[1])] = match[2];
  }

  for (let segmentId = 0; segmentId < REQUIRED_SEGMENT_COUNT; segmentId += 1) {
    if (!segmentsById[segmentId]) {
      throw new Error(`route SVG is missing <path id="segment-${segmentId}" d="...">`);
    }
  }

  const circles: ParsedRouteStopCircle[] = [];
  for (const match of svgMarkup.matchAll(STOP_CIRCLE_PATTERN)) {
    circles.push({
      id: Number(match[1]),
      cx: Number(match[2]),
      cy: Number(match[3]),
    });
  }

  circles.sort((a, b) => a.id - b.id);

  return {
    segmentsById,
    circles,
  };
}

/** @deprecated Use parseRouteSvg */
export function parseRouteStopsSvg(svgMarkup: string): ParsedRouteSvg {
  return parseRouteSvg(svgMarkup);
}
