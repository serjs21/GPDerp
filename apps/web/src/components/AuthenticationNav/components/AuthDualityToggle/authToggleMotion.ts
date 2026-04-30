export const TEXT_CROSSFADE_S = 0.4;
export const DISAPPEAR_DURATION_MS = 800;
export const DISAPPEAR_DURATION_S = DISAPPEAR_DURATION_MS / 1000;
export const BLACK_HOLE_ROTATION_SPEED = 0.2;
export const BLACK_HOLE_INSIDE_EASE = 2;

export function computeCrossingDelay(
  startWidth: number,
  endWidth: number,
  requiredWidth: number,
  duration: number,
) {
  if (startWidth === endWidth) return 0;
  const linearProgress = (requiredWidth - startWidth) / (endWidth - startWidth);
  const normalized = Math.max(0, Math.min(1, linearProgress));
  const easedTime = Math.sqrt(normalized);
  return duration * easedTime;
}
