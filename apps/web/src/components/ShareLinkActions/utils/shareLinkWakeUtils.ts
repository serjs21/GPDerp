import type { SteppedTransitionLayer } from "@/components/animations/SteppedTransition";

/** Per-frame opacity for the stacked wake frames; idle shows only the first frame. */
export function shareLinkWakeFrameOpacities(
  frameCount: number,
  layers: SteppedTransitionLayer[],
  playing: boolean,
): number[] {
  const opacities = Array.from({ length: frameCount }, (_, index): number =>
    !playing && index === 0 ? 1 : 0,
  );
  if (!playing) return opacities;

  for (const layer of layers) {
    const index = Math.round(layer.pose.progress * (frameCount - 1));
    opacities[index] = Math.max(opacities[index] ?? 0, layer.opacity);
  }
  return opacities;
}
