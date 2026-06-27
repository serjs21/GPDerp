/** branch-base.png intrinsic size */
export const WISDOM_BRANCH_IMAGE_WIDTH = 861;
export const WISDOM_BRANCH_IMAGE_HEIGHT = 430;
export const WISDOM_BRANCH_IMAGE_ASPECT = WISDOM_BRANCH_IMAGE_WIDTH / WISDOM_BRANCH_IMAGE_HEIGHT;

/** Wrapper height — matches WisdomForest slot */
export const WISDOM_BRANCH_WRAPPER_HEIGHT_REM = 12.5;

/** Note width — align with sticky-note default */
export const WISDOM_BRANCH_NOTE_WIDTH_REM = 28;

/** Max branch band height within wrapper */
export const WISDOM_BRANCH_BAND_MAX_HEIGHT_REM = 3.25;

/** Branch extends past note edges */
export const WISDOM_BRANCH_OVERSHOOT_DESKTOP_REM = 4;
export const WISDOM_BRANCH_OVERSHOOT_MOBILE_REM = 2;
export const WISDOM_BRANCH_MOBILE_MAX_WIDTH_PX = 768;

/** String attach points — normalized 0–1 within branch / note boxes */
export const WISDOM_BRANCH_STRING_ATTACH = {
  branchLeft: { x: 0.14, y: 0.78 },
  branchRight: { x: 0.86, y: 0.78 },
  noteLeft: { x: 0.1, y: 0 },
  noteRight: { x: 0.9, y: 0 },
} as const;

export type WisdomBranchAttachPoint = { x: number; y: number };

export type WisdomBranchConnectorLine = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};
