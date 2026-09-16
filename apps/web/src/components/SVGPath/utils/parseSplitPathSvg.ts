export type SplitPathStop = {
  id: number;
  cx: number;
  cy: number;
};

export type SplitPathSegment = {
  id: number;
  startStopId: number;
  endStopId: number;
  d: string;
};

export type ParsedSplitPathSvg = {
  viewBox: { width: number; height: number };
  stopsById: Readonly<Record<number, SplitPathStop>>;
  segmentsById: Readonly<Record<number, SplitPathSegment>>;
};

export const SPLIT_PATH_STOP_COUNT = 23;
export const SPLIT_PATH_SEGMENT_COUNT = 22;
export const SPLIT_PATH_MIN_STOP = 0;
export const SPLIT_PATH_MAX_STOP = 22;

const VIEWBOX_PATTERN = /viewBox="0 0 ([0-9.]+) ([0-9.]+)"/;
/** Attribute order may vary across Illustrator exports. */
const SEGMENT_TAG_PATTERN = /<path\b([^>]*\bid="segment-\d+"[^>]*)\/?>/g;
const STOP_TAG_PATTERN = /<circle\b([^>]*\bid="stop-\d+"[^>]*)\/?>/g;
const ATTR_PATTERN = /([:\w-]+)="([^"]*)"/g;

function readAttrs(tagAttrs: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const match of tagAttrs.matchAll(ATTR_PATTERN)) {
    attrs[match[1]] = match[2];
  }
  return attrs;
}

function parseStopId(value: string | undefined, label: string): number {
  const match = value?.match(/^stop-(\d+)$/);
  if (!match) {
    throw new Error(`split path SVG ${label} must be stop-NN`);
  }
  return Number(match[1]);
}

export function parseSplitPathSvg(svgMarkup: string): ParsedSplitPathSvg {
  const viewBoxMatch = svgMarkup.match(VIEWBOX_PATTERN);
  if (!viewBoxMatch) {
    throw new Error('split path SVG is missing viewBox="0 0 width height"');
  }

  const viewBox = {
    width: Number(viewBoxMatch[1]),
    height: Number(viewBoxMatch[2]),
  };

  const segmentsById: Record<number, SplitPathSegment> = {};
  for (const match of svgMarkup.matchAll(SEGMENT_TAG_PATTERN)) {
    const attrs = readAttrs(match[1]);
    const idMatch = attrs.id?.match(/^segment-(\d+)$/);
    if (!idMatch || !attrs.d) continue;
    const id = Number(idMatch[1]);
    segmentsById[id] = {
      id,
      startStopId: parseStopId(attrs["data-start"], `segment-${padStopId(id)} data-start`),
      endStopId: parseStopId(attrs["data-end"], `segment-${padStopId(id)} data-end`),
      d: attrs.d,
    };
  }

  for (let segmentId = 0; segmentId < SPLIT_PATH_SEGMENT_COUNT; segmentId += 1) {
    const segment = segmentsById[segmentId];
    if (!segment) {
      throw new Error(`split path SVG is missing <path id="segment-${padStopId(segmentId)}">`);
    }
    if (segment.startStopId !== segmentId || segment.endStopId !== segmentId + 1) {
      throw new Error(
        `segment-${padStopId(segmentId)} must connect stop-${padStopId(segmentId)} to stop-${padStopId(segmentId + 1)}`,
      );
    }
  }

  const stopsById: Record<number, SplitPathStop> = {};
  for (const match of svgMarkup.matchAll(STOP_TAG_PATTERN)) {
    const attrs = readAttrs(match[1]);
    const idMatch = attrs.id?.match(/^stop-(\d+)$/);
    if (!idMatch || attrs.cx == null || attrs.cy == null) continue;
    const id = Number(idMatch[1]);
    stopsById[id] = {
      id,
      cx: Number(attrs.cx),
      cy: Number(attrs.cy),
    };
  }

  for (let stopId = 0; stopId < SPLIT_PATH_STOP_COUNT; stopId += 1) {
    if (!stopsById[stopId]) {
      throw new Error(`split path SVG is missing <circle id="stop-${padStopId(stopId)}">`);
    }
  }

  return { viewBox, stopsById, segmentsById };
}

/** Inner markup of the authored SVG (groups), for inline rendering in the same viewBox. */
export function splitPathSvgInnerMarkup(svgMarkup: string): string {
  const start = svgMarkup.search(/<svg[\s>]/i);
  const openEnd = start >= 0 ? svgMarkup.indexOf(">", start) : -1;
  const close = svgMarkup.lastIndexOf("</svg>");
  if (openEnd < 0 || close < 0 || close <= openEnd) {
    throw new Error("split path SVG is missing a complete <svg>…</svg> wrapper");
  }
  return svgMarkup.slice(openEnd + 1, close).trim();
}

export function padStopId(id: number): string {
  return String(id).padStart(2, "0");
}
