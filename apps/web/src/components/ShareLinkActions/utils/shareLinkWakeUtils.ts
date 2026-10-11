import type { SteppedTransitionLayer } from "@/components/animations/SteppedTransition";
import { SHARE_LINK_WAKE_TERMINAL_ACTIVE } from "../consts/shareLinkUpdateActionConsts";
import type { ShareLinkWakeSegment } from "../ShareLinkWakeTransition.types";

/** Per-frame opacity for the stacked wake frames. */
export function shareLinkWakeFrameOpacities(
  frameCount: number,
  layers: SteppedTransitionLayer[],
): number[] {
  const opacities = Array.from({ length: frameCount }, (): number => 0);
  for (const layer of layers) {
    const index = Math.round(layer.pose.progress * (frameCount - 1));
    opacities[index] = Math.max(opacities[index] ?? 0, layer.opacity);
  }
  return opacities;
}

/**
 * A finished terminal segment can hand back to the static Update image once
 * the link's `active` state has caught up with the request result.
 */
export function isShareLinkWakeSettled(segment: ShareLinkWakeSegment, active: boolean): boolean {
  const expected = SHARE_LINK_WAKE_TERMINAL_ACTIVE[segment];
  return expected !== undefined && expected === active;
}
