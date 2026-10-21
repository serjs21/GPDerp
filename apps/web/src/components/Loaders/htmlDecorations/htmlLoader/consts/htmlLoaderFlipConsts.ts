/** Duration of the page turn that uncovers the app. */
export const HTML_LOADER_FLIP_MS = 900;

/** If the flip code still hasn't loaded this long after reveal, the loader is dropped without the turn. */
export const HTML_LOADER_FLIP_LOAD_TIMEOUT_MS = 2000;

/** The page under the turn (transparent, so the app shows); its clip is the uncovered corner. */
export const HTML_LOADER_FLIP_UNCOVERED_SELECTOR = "[data-flip-uncovered]";

/**
 * react-pageflip settings besides the size: a two-page spread (the loader is the right page, its back
 * the turning flap), no user interaction, the turn runs once.
 */
export const HTML_LOADER_FLIP_SETTINGS = {
  startPage: 0,
  size: "fixed",
  drawShadow: true,
  flippingTime: HTML_LOADER_FLIP_MS,
  usePortrait: false,
  startZIndex: 0,
  autoSize: true,
  maxShadowOpacity: 0.5,
  showCover: false,
  mobileScrollSupport: false,
  clickEventForward: false,
  useMouseEvents: false,
  swipeDistance: 0,
  showPageCorners: false,
  disableFlipByClick: true,
} as const;
