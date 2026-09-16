import type { CSSProperties } from "react";
import {
  WISDOM_BRANCH_BAND_MAX_HEIGHT_REM,
  WISDOM_BRANCH_IMAGE_ASPECT,
  WISDOM_BRANCH_NOTE_WIDTH_REM,
  WISDOM_BRANCH_OVERSHOOT_DESKTOP_REM,
  WISDOM_BRANCH_STRING_ATTACH,
  WISDOM_BRANCH_WRAPPER_HEIGHT_REM,
  type WisdomBranchConnectorLine,
} from "./constants";

function toPercent(value: number): string {
  return `${value * 100}%`;
}

export function getWisdomBranchBandHeightRem(overshootRem: number): number {
  const wrapperWidthRem = WISDOM_BRANCH_NOTE_WIDTH_REM + 2 * overshootRem;
  return Math.min(wrapperWidthRem / WISDOM_BRANCH_IMAGE_ASPECT, WISDOM_BRANCH_BAND_MAX_HEIGHT_REM);
}

export function computeConnectorLines(overshootRem: number): {
  left: WisdomBranchConnectorLine;
  right: WisdomBranchConnectorLine;
} {
  const noteWidthRem = WISDOM_BRANCH_NOTE_WIDTH_REM;
  const wrapperWidthRem = noteWidthRem + 2 * overshootRem;
  const wrapperHeightRem = WISDOM_BRANCH_WRAPPER_HEIGHT_REM;
  const bandHeightRem = getWisdomBranchBandHeightRem(overshootRem);
  const noteHeightRem = wrapperHeightRem - bandHeightRem;
  const noteTopRem = bandHeightRem;

  const bandHeightRatio = bandHeightRem / wrapperHeightRem;
  const { branchLeft, branchRight, noteLeft, noteRight } = WISDOM_BRANCH_STRING_ATTACH;

  return {
    left: {
      x1: branchLeft.x,
      y1: branchLeft.y * bandHeightRatio,
      x2: (overshootRem + noteLeft.x * noteWidthRem) / wrapperWidthRem,
      y2: (noteTopRem + noteLeft.y * noteHeightRem) / wrapperHeightRem,
    },
    right: {
      x1: branchRight.x,
      y1: branchRight.y * bandHeightRatio,
      x2: (overshootRem + noteRight.x * noteWidthRem) / wrapperWidthRem,
      y2: (noteTopRem + noteRight.y * noteHeightRem) / wrapperHeightRem,
    },
  };
}

export function getWisdomBranchLayoutVars(
  overshootRem: number = WISDOM_BRANCH_OVERSHOOT_DESKTOP_REM,
): CSSProperties {
  const noteWidthRem = WISDOM_BRANCH_NOTE_WIDTH_REM;
  const wrapperWidthRem = noteWidthRem + 2 * overshootRem;
  const bandHeightRem = getWisdomBranchBandHeightRem(overshootRem);
  const noteHeightRem = WISDOM_BRANCH_WRAPPER_HEIGHT_REM - bandHeightRem;

  return {
    "--wisdom-branch-note-width": `${noteWidthRem}rem`,
    "--wisdom-branch-note-height": `${noteHeightRem}rem`,
    "--wisdom-branch-overshoot": `${overshootRem}rem`,
    "--wisdom-branch-width": `${wrapperWidthRem}rem`,
    "--wisdom-branch-wrapper-height": `${WISDOM_BRANCH_WRAPPER_HEIGHT_REM}rem`,
    "--wisdom-branch-image-aspect": String(WISDOM_BRANCH_IMAGE_ASPECT),
    "--wisdom-branch-band-height": `${bandHeightRem}rem`,
    "--wisdom-branch-attach-branch-left-x": toPercent(WISDOM_BRANCH_STRING_ATTACH.branchLeft.x),
    "--wisdom-branch-attach-branch-left-y": toPercent(WISDOM_BRANCH_STRING_ATTACH.branchLeft.y),
    "--wisdom-branch-attach-branch-right-x": toPercent(WISDOM_BRANCH_STRING_ATTACH.branchRight.x),
    "--wisdom-branch-attach-branch-right-y": toPercent(WISDOM_BRANCH_STRING_ATTACH.branchRight.y),
    "--wisdom-branch-attach-note-left-x": toPercent(WISDOM_BRANCH_STRING_ATTACH.noteLeft.x),
    "--wisdom-branch-attach-note-right-x": toPercent(WISDOM_BRANCH_STRING_ATTACH.noteRight.x),
  } as CSSProperties;
}
