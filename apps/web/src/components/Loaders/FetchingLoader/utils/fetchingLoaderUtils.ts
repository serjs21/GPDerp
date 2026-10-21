import type { CSSProperties } from "react";
import { FETCHING_LOADER_DEFAULTS, FETCHING_LOADER_FRAMES, FETCHING_LOADER_SEQUENCE } from "../consts/fetchingLoaderConsts";
import type { FetchingLoaderProps } from "../FetchingLoader.types";

type Frame = (typeof FETCHING_LOADER_FRAMES)[number];

const round = (value: number) => Math.round(value * 1000) / 1000;

/** Stage = the largest frame canvas, so no frame is clipped. */
export const FETCHING_LOADER_STAGE = {
  width: Math.max(...FETCHING_LOADER_FRAMES.map((frame) => frame.width)),
  height: Math.max(...FETCHING_LOADER_FRAMES.map((frame) => frame.height)),
};

export function buildFetchingLoaderStyle(props: FetchingLoaderProps): CSSProperties {
  const widthRem = props.widthRem ?? FETCHING_LOADER_DEFAULTS.widthRem;
  const frameMs = props.frameMs ?? FETCHING_LOADER_DEFAULTS.frameMs;
  return {
    "--fetching-width": `${widthRem}rem`,
    "--fetching-aspect": `${FETCHING_LOADER_STAGE.width} / ${FETCHING_LOADER_STAGE.height}`,
    "--fetching-duration": `${FETCHING_LOADER_SEQUENCE.length * frameMs}ms`,
  } as CSSProperties;
}

/** A frame at its natural size relative to the stage (same drawing scale for every frame). */
export function fetchingFrameStyle(frame: Frame): CSSProperties {
  return {
    "--fetching-frame-width": `${round((frame.width / FETCHING_LOADER_STAGE.width) * 100)}%`,
    "--fetching-frame-height": `${round((frame.height / FETCHING_LOADER_STAGE.height) * 100)}%`,
  } as CSSProperties;
}

/** Frames the sequence actually shows, in FETCHING_LOADER_FRAMES order (unused frames aren't rendered). */
export function fetchingShownFrames(): Array<{ frame: Frame; index: number }> {
  return FETCHING_LOADER_FRAMES.flatMap((frame, index) =>
    (FETCHING_LOADER_SEQUENCE as readonly number[]).includes(index) ? [{ frame, index }] : [],
  );
}

/** Slots (0-based) of the loop in which `frameIndex` is shown. */
export function fetchingFrameSlots(frameIndex: number): number[] {
  return FETCHING_LOADER_SEQUENCE.flatMap((shown, slot) => (shown === frameIndex ? [slot] : []));
}
