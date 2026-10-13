import { BACKGROUND_SCENE_ASSETS } from "@/components/BackgroundScene/backgroundSceneAssets";
import { LANTERN_ASSET_SRC } from "@/components/Lantern/constants";
import { LANTERN_ROTATED_CONTENT } from "@/components/Lantern/consts/rotationBaseConsts";
import type { CriticalImage } from "@/utils/visualReadiness/imageReadiness";

/** CSS `mask-image` fetches use CORS mode; preloads/decodes must match to share one request. */
export const BACKGROUND_MOUNTAIN_MASK: CriticalImage = {
  src: BACKGROUND_SCENE_ASSETS.masks.mountain,
  crossOrigin: "anonymous",
};

/** Login/Register lanterns render the rotated base as a CSS mask. */
export const AUTH_LANTERN_MASK: CriticalImage = {
  src: LANTERN_ROTATED_CONTENT.rotated.assetSrc,
  crossOrigin: "anonymous",
};

/** Persistent shell art visible on every route (base + mountain layers). */
export const SHELL_CRITICAL_ASSETS: readonly CriticalImage[] = [
  {
    src: BACKGROUND_SCENE_ASSETS.base,
    srcSet: BACKGROUND_SCENE_ASSETS.baseSrcSet,
    sizes: BACKGROUND_SCENE_ASSETS.baseSizes,
  },
  BACKGROUND_MOUNTAIN_MASK,
];

export const MAIN_GUEST_CRITICAL_ASSETS: readonly CriticalImage[] = [
  ...SHELL_CRITICAL_ASSETS,
  AUTH_LANTERN_MASK,
];

/** Main, logged in: the lantern path shows upright, rotated, and rotated-2 `<img>` bases around the focus stop. */
export const MAIN_MEMBER_LANTERN_ASSETS: readonly CriticalImage[] = [
  { src: LANTERN_ASSET_SRC },
  { src: LANTERN_ROTATED_CONTENT.rotated.assetSrc },
  { src: LANTERN_ROTATED_CONTENT.rotated2.assetSrc },
];

export const MAIN_MEMBER_CRITICAL_ASSETS: readonly CriticalImage[] = [
  ...SHELL_CRITICAL_ASSETS,
  ...MAIN_MEMBER_LANTERN_ASSETS,
];

/**
 * Upper bound on holding the first-load loader for art. Past this the view is revealed
 * as `degraded` so slow or failing images never block the app.
 */
export const FIRST_REVEAL_MAX_WAIT_MS = 5000;

/** Upper bound on hiding an in-page control cluster (e.g. sort coins) while its art decodes. */
export const CONTROL_ART_MAX_WAIT_MS = 2000;
