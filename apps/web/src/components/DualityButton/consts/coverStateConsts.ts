/**
 * Direction cue paths from `/duality_button/direction.svg` (viewBox 0 0 400 400).
 * Inlined so CoverState can draw them with anime.js `createDrawable`.
 */
export const COVER_ARROW_PATHS = [
  "M35 262C160.529 140.938 328.006 207.285 361 215.518",
  "M343.69 143C355.23 190.289 361 214.681 361 216.177C361 218.421 327.488 234.13 312 258",
] as const;

/**
 * Arc for curved cover title (viewBox 0 0 100 72).
 * Sits above the face, matching the direction-cue region.
 */
export const COVER_TITLE_ARC_D = "M 6 52 A 44 44 0 0 1 94 52";
