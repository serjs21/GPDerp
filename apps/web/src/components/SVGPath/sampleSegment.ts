const pathElementCache = new Map<string, SVGPathElement>();

function pathElementFor(d: string): SVGPathElement | null {
  if (typeof document === "undefined") return null;

  const cached = pathElementCache.get(d);
  if (cached) return cached;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", d);
  svg.appendChild(path);
  pathElementCache.set(d, path);
  return path;
}

/** Sample a segment `d` at t in [0, 1] using SVG path length. */
export function sampleSegment(d: string, t: number): { x: number; y: number } | null {
  const path = pathElementFor(d);
  if (!path) return null;

  const length = path.getTotalLength();
  if (!Number.isFinite(length) || length <= 0) return null;

  const clamped = Math.max(0, Math.min(1, t));
  const point = path.getPointAtLength(clamped * length);
  return { x: point.x, y: point.y };
}
