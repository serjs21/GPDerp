/** Frames of the running dog; sizes are the SVG viewBoxes (same drawing scale, different canvases). */
export const FETCHING_LOADER_FRAMES = [
  { src: "/loader/fetching1.svg", width: 241, height: 124.53 },
  { src: "/loader/fetching2.svg", width: 240, height: 132.88 },
  { src: "/loader/fetching3.svg", width: 252, height: 127.2 },
] as const;

/**
 * Frame shown in each slot of one loop (indexes into FETCHING_LOADER_FRAMES): 1 2 1 3, then 1 again.
 * Only frames listed here are rendered. The keyframes in FetchingLoader.module.css follow this;
 * fetchingLoaderCss.test.ts fails if they drift.
 */
export const FETCHING_LOADER_SEQUENCE = [0, 1, 0, 2] as const;

/** Locales where the dog runs the other way (frames mirrored horizontally). */
export const FETCHING_LOADER_MIRRORED_LOCALES: readonly string[] = ["ja"];

/** Frame shown alone under prefers-reduced-motion. */
export const FETCHING_LOADER_REST_FRAME = 0;

export const FETCHING_LOADER_DEFAULTS = {
  widthRem: 10,
  frameMs: 150,
} as const;
